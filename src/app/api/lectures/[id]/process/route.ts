import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { transcribeAudio } from "@/lib/transcribe";
import { generateLectureNotes } from "@/lib/notes";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Verify the caller owns this lecture using the request-scoped client
  // (RLS enforces this), then do the actual work with the admin client so
  // storage downloads and multi-step updates aren't blocked by RLS.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: lecture, error: fetchError } = await supabase
    .from("lectures")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !lecture) {
    return NextResponse.json({ error: "Lecture not found" }, { status: 404 });
  }

  const admin = createAdminClient();

  try {
    await admin
      .from("lectures")
      .update({ status: "transcribing", error_message: null })
      .eq("id", id);

    const { data: audioFile, error: downloadError } = await admin.storage
      .from("lectures")
      .download(lecture.audio_path);

    if (downloadError || !audioFile) {
      throw new Error(downloadError?.message ?? "Could not download audio");
    }

    const transcript = await transcribeAudio(
      audioFile,
      lecture.audio_path.split("/").pop() ?? "lecture.webm"
    );

    await admin
      .from("lectures")
      .update({ transcript, status: "summarizing" })
      .eq("id", id);

    const notes = await generateLectureNotes(transcript);

    await admin
      .from("lectures")
      .update({
        summary: notes.summary,
        key_points: notes.keyPoints,
        flashcards: notes.flashcards,
        status: "ready",
      })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Processing failed";
    await admin
      .from("lectures")
      .update({ status: "error", error_message: message })
      .eq("id", id);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
