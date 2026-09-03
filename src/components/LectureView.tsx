"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { StatusBadge, PROCESSING_STATUSES } from "@/components/StatusBadge";
import type { Lecture } from "@/types/database";

type Tab = "summary" | "keyPoints" | "flashcards" | "transcript";

export function LectureView({
  lecture: initialLecture,
  audioUrl,
}: {
  lecture: Lecture;
  audioUrl: string | null;
}) {
  const router = useRouter();
  const [lecture, setLecture] = useState(initialLecture);
  const [tab, setTab] = useState<Tab>("summary");
  const [deleting, setDeleting] = useState(false);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());

  const isProcessing = PROCESSING_STATUSES.includes(lecture.status);

  useEffect(() => {
    if (!isProcessing) return;

    const supabase = createClient();
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from("lectures")
        .select("*")
        .eq("id", lecture.id)
        .single();
      if (data) setLecture(data);
    }, 3000);

    return () => clearInterval(interval);
  }, [isProcessing, lecture.id]);

  async function handleDelete() {
    if (!confirm("Delete this lecture? This can't be undone.")) return;
    setDeleting(true);
    await fetch(`/api/lectures/${lecture.id}`, { method: "DELETE" });
    router.push("/dashboard");
    router.refresh();
  }

  function toggleFlip(i: number) {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {lecture.title}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {lecture.course ? `${lecture.course} · ` : ""}
            {new Date(lecture.created_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={lecture.status} />
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-md border border-neutral-800 p-2 text-neutral-500 transition hover:border-red-500/50 hover:text-red-400"
            aria-label="Delete lecture"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {audioUrl && (
        <audio controls src={audioUrl} className="mt-6 w-full">
          Your browser does not support the audio element.
        </audio>
      )}

      {lecture.status === "error" && (
        <div className="mt-6 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          Processing failed{lecture.error_message ? `: ${lecture.error_message}` : "."}
        </div>
      )}

      {isProcessing && (
        <div className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-3 text-sm text-neutral-400">
          Scrib is working on this lecture — this page updates automatically.
        </div>
      )}

      {lecture.status === "ready" && (
        <div className="mt-8">
          <div className="flex gap-1 border-b border-neutral-800">
            {(
              [
                ["summary", "Summary"],
                ["keyPoints", "Key points"],
                ["flashcards", "Flashcards"],
                ["transcript", "Transcript"],
              ] as [Tab, string][]
            ).map(([value, label]) => (
              <button
                key={value}
                onClick={() => setTab(value)}
                className={`px-4 py-2.5 text-sm font-medium transition ${
                  tab === value
                    ? "border-b-2 border-white text-white"
                    : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="py-6">
            {tab === "summary" && (
              <p className="leading-relaxed text-neutral-200">
                {lecture.summary}
              </p>
            )}

            {tab === "keyPoints" && (
              <ul className="list-disc space-y-2 pl-5 text-neutral-200">
                {lecture.key_points?.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            )}

            {tab === "flashcards" && (
              <div className="grid gap-4 sm:grid-cols-2">
                {lecture.flashcards?.map((card, i) => {
                  const flipped = flippedCards.has(i);
                  return (
                    <button
                      key={i}
                      onClick={() => toggleFlip(i)}
                      className="min-h-32 rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-left text-sm transition hover:border-neutral-600"
                    >
                      <p className="mb-2 text-xs font-medium text-neutral-500">
                        {flipped ? "Answer" : "Question"}
                      </p>
                      <p className="text-neutral-200">
                        {flipped ? card.answer : card.question}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {tab === "transcript" && (
              <p className="whitespace-pre-wrap leading-relaxed text-neutral-300">
                {lecture.transcript}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
