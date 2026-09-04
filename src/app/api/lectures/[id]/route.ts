import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: lecture } = await supabase
    .from("lectures")
    .select("audio_path")
    .eq("id", id)
    .single();

  if (lecture?.audio_path) {
    await supabase.storage.from("lectures").remove([lecture.audio_path]);
  }

  const { error } = await supabase.from("lectures").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
