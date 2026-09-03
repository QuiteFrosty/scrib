import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, course, audioPath, durationSeconds } = await request.json();

  if (!title || !audioPath) {
    return NextResponse.json(
      { error: "title and audioPath are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("lectures")
    .insert({
      user_id: user.id,
      title,
      course: course || null,
      audio_path: audioPath,
      duration_seconds: durationSeconds ?? null,
      status: "uploaded",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Kick off transcription + note generation in the background. We don't await
  // this so the client gets an immediate response and polls for status.
  fetch(new URL(`/api/lectures/${data.id}/process`, request.url), {
    method: "POST",
    headers: { cookie: request.headers.get("cookie") ?? "" },
  }).catch(() => {
    /* best-effort kick-off; the lecture stays in "uploaded" if this fails
       and can be retried from the detail page. */
  });

  return NextResponse.json({ lecture: data });
}
