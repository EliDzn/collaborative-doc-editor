import { NextRequest, NextResponse } from "next/server";
import { getDocument, updateDocument } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  const doc = await getDocument(Number(id), userId);
  if (!doc) {
    return NextResponse.json(
      { error: "Not found or no access" },
      { status: 404 }
    );
  }
  return NextResponse.json(doc);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { userId, title, content } = body;
  const doc = await updateDocument(Number(id), userId, { title, content });
  if (!doc) {
    return NextResponse.json(
      { error: "Not found or no access" },
      { status: 404 }
    );
  }
  return NextResponse.json(doc);
}
