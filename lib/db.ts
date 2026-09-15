import { sql } from "@vercel/postgres";

export async function getDocuments(userId: number) {
  const { rows } = await sql`
    SELECT d.*, u.name as owner_name
    FROM documents d
    JOIN users u ON d.owner_id = u.id
    WHERE d.owner_id = ${userId}
       OR d.id IN (SELECT document_id FROM shares WHERE user_id = ${userId})
    ORDER BY d.updated_at DESC
  `;
  return rows;
}

export async function createDocument(
  ownerId: number,
  title: string = "Untitled Document"
) {
  const { rows } = await sql`
    INSERT INTO documents (title, content, owner_id, updated_by)
    VALUES (${title}, '', ${ownerId}, ${ownerId})
    RETURNING *
  `;
  return rows[0];
}

export async function getDocument(id: number, userId: number) {
  const { rows } = await sql`
    SELECT d.*, u.name as owner_name, editor.name as updated_by_name,
      (d.owner_id = ${userId}) as is_owner
    FROM documents d
    JOIN users u ON d.owner_id = u.id
    LEFT JOIN users editor ON d.updated_by = editor.id
    WHERE d.id = ${id}
      AND (d.owner_id = ${userId}
           OR d.id IN (SELECT document_id FROM shares WHERE user_id = ${userId}))
  `;
  return rows[0] || null; // null = not found OR no access — access enforcement lives here
}

export async function updateDocument(
  id: number,
  userId: number,
  updates: { title?: string; content?: string }
) {
  const { rows } = await sql`
    UPDATE documents
    SET title = COALESCE(${updates.title}, title),
        content = COALESCE(${updates.content}, content),
        updated_at = NOW(),
        updated_by = ${userId}
    WHERE id = ${id}
      AND (owner_id = ${userId}
           OR id IN (SELECT document_id FROM shares WHERE user_id = ${userId}))
    RETURNING *
  `;
  return rows[0] || null; // null = update rejected — same access check as getDocument
}
