import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { presignUpload } from "@/lib/r2";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { extension, contentType } = await request.json();
  if (!extension || !contentType) {
    return NextResponse.json(
      { error: "extension and contentType are required" },
      { status: 400 }
    );
  }

  const key = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const uploadUrl = await presignUpload(key, contentType);

  return NextResponse.json({ uploadUrl, key });
}
