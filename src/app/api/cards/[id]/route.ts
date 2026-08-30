import { NextRequest, NextResponse } from "next/server";
import { queryD1, parseCard } from "@/lib/d1";

// GET /api/cards/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await queryD1<Record<string, unknown>>("SELECT * FROM cards WHERE id = ?", [id]);
    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: parseCard(rows[0]) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PATCH /api/cards/[id] (Edit card content or pin status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await queryD1<Record<string, unknown>>("SELECT * FROM cards WHERE id = ?", [id]);
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 });
    }

    const current = parseCard(existing[0]);
    const title = body.title !== undefined ? String(body.title).trim() : current.title;
    const content = body.content !== undefined ? String(body.content).trim() : current.content;
    const category = body.category !== undefined ? String(body.category).trim() : current.category;
    const color = body.color !== undefined ? String(body.color) : current.color;
    const author = body.author !== undefined ? String(body.author).trim() : current.author;
    const pinned = body.pinned !== undefined ? (body.pinned ? 1 : 0) : (current.pinned ? 1 : 0);
    
    let tagsJson = JSON.stringify(current.tags);
    if (body.tags !== undefined) {
      tagsJson = JSON.stringify(Array.isArray(body.tags) ? body.tags.map((t: string) => String(t).trim()).filter(Boolean) : []);
    }

    const now = new Date().toISOString();

    const sql = `
      UPDATE cards 
      SET title = ?, content = ?, category = ?, tags = ?, color = ?, author = ?, pinned = ?, updated_at = ?
      WHERE id = ?
    `;

    await queryD1(sql, [title, content, category, tagsJson, color, author, pinned, now, id]);

    const updated = await queryD1<Record<string, unknown>>("SELECT * FROM cards WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      data: updated.length > 0 ? parseCard(updated[0]) : null,
      message: "Card updated successfully",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// DELETE /api/cards/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await queryD1("DELETE FROM cards WHERE id = ?", [id]);
    return NextResponse.json({ success: true, message: "Card deleted successfully" });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
