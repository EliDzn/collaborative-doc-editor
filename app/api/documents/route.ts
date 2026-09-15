import { NextRequest, NextResponse } from "next/server";
import { getDocuments, createDocument } from "@/lib/db";

export async function GET(req: NextRequest) {
  const userId = Number(req.nextUrl.searchParams.get("userId"));
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  const documents = await getDocuments(userId);
  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, title } = body;
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }
  const doc = await createDocument(userId, title);
  return NextResponse.json(doc, { status: 201 });
}
