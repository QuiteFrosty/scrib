"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Mic, Square, Upload } from "lucide-react";

type RecorderState = "idle" | "recording" | "recorded";

export default function NewLecturePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [recorderState, setRecorderState] = useState<RecorderState>("idle");
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function startRecording() {
    setError("");
    setUploadedFile(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        setRecordedBlob(blob);
        setRecorderState("recorded");
        stream.getTracks().forEach((track) => track.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecorderState("recording");
      setSeconds(0);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      setError(
        "Couldn't access your microphone. Check your browser permissions."
      );
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
  }

  function resetRecording() {
    setRecordedBlob(null);
    setRecorderState("idle");
    setSeconds(0);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const audio = uploadedFile ?? recordedBlob;
    if (!audio || !title.trim()) {
      setError("Give your lecture a title and record or choose a file.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const extension =
        uploadedFile?.name.split(".").pop() ??
        (recordedBlob?.type.includes("webm") ? "webm" : "m4a");
      const contentType =
        uploadedFile?.type || recordedBlob?.type || "application/octet-stream";

      const presignRes = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extension, contentType }),
      });
      const presignBody = await presignRes.json();
      if (!presignRes.ok)
        throw new Error(presignBody.error ?? "Failed to prepare upload");

      const putRes = await fetch(presignBody.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: audio,
      });
      if (!putRes.ok) throw new Error("Failed to upload audio");

      const res = await fetch("/api/lectures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          course,
          audioPath: presignBody.key,
          durationSeconds: recorderState === "recorded" ? seconds : null,
        }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to save lecture");

      router.push(`/dashboard/${body.lecture.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const hasAudio = Boolean(uploadedFile || recordedBlob);

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">New lecture</h1>
      <p className="mt-1 text-sm text-neutral-400">
        Record right here, or upload an audio file. Scrib takes it from
        there.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Lecture 12 — Thermodynamics"
            className="mt-1.5 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-400"
          />
        </div>

        <div>
          <label htmlFor="course" className="text-sm font-medium">
            Course <span className="text-neutral-500">(optional)</span>
          </label>
          <input
            id="course"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="e.g. PHYS 201"
            className="mt-1.5 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm outline-none focus:border-neutral-400"
          />
        </div>

        <div className="rounded-lg border border-neutral-800 p-5">
          <p className="text-sm font-medium">Audio</p>

          <div className="mt-4 flex items-center gap-3">
            {recorderState !== "recording" ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={submitting}
                className="flex items-center gap-2 rounded-md border border-neutral-700 px-4 py-2 text-sm transition hover:border-neutral-500 disabled:opacity-50"
              >
                <Mic className="h-4 w-4" /> Record
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="flex items-center gap-2 rounded-md bg-red-500/15 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/25"
              >
                <Square className="h-4 w-4" /> Stop ({seconds}s)
              </button>
            )}

            <span className="text-xs text-neutral-500">or</span>

            <label className="flex cursor-pointer items-center gap-2 rounded-md border border-neutral-700 px-4 py-2 text-sm transition hover:border-neutral-500">
              <Upload className="h-4 w-4" /> Upload file
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setUploadedFile(file);
                  resetRecording();
                }}
              />
            </label>
          </div>

          {recorderState === "recorded" && recordedBlob && (
            <p className="mt-4 text-sm text-neutral-400">
              Recorded {seconds}s of audio.{" "}
              <button
                type="button"
                onClick={resetRecording}
                className="underline underline-offset-2"
              >
                Re-record
              </button>
            </p>
          )}
          {uploadedFile && (
            <p className="mt-4 text-sm text-neutral-400">
              Selected: {uploadedFile.name}
            </p>
          )}
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting || !hasAudio}
          className="w-full rounded-md bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-neutral-200 disabled:opacity-50"
        >
          {submitting ? "Saving…" : "Save lecture"}
        </button>
      </form>
    </div>
  );
}
