import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { presignDownload } from "@/lib/r2";
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

  const audioUrl = await presignDownload(lecture.audio_path);

  return <LectureView lecture={lecture} audioUrl={audioUrl} />;
}
