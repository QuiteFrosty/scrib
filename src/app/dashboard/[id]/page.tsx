import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LectureView } from "@/components/LectureView";

export default async function LecturePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lecture } = await supabase
    .from("lectures")
    .select("*")
    .eq("id", id)
    .single();

  if (!lecture) notFound();

  const { data: signedUrl } = await supabase.storage
    .from("lectures")
    .createSignedUrl(lecture.audio_path, 60 * 60);

  return (
    <LectureView lecture={lecture} audioUrl={signedUrl?.signedUrl ?? null} />
  );
}
