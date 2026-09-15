import { NextRequest, NextResponse } from "next/server";
import { isAllowedFileType } from "@/lib/validate-upload";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  if (!isAllowedFileType(file.name)) {
    return NextResponse.json(
      { error: "Only .txt and .md files are supported" },
      { status: 400 }
    );
  }

  const text = await file.text();
  return NextResponse.json({ content: text });
}
