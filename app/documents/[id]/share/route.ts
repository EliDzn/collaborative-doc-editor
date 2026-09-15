import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { ownerId, targetUserId } = body;

  const { rows: docRows } = await sql`
    SELECT * FROM documents WHERE id = ${Number(id)} AND owner_id = ${ownerId}
  `;
  if (docRows.length === 0) {
    return NextResponse.json(
      { error: "Not found or not owner" },
      { status: 403 }
    );
  }

  await sql`
    INSERT INTO shares (document_id, user_id)
    VALUES (${Number(id)}, ${targetUserId})
    ON CONFLICT DO NOTHING
  `;

  return NextResponse.json({ success: true });
}
