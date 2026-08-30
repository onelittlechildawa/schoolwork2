import { NextRequest, NextResponse } from "next/server";
import { queryD1, parseCard } from "@/lib/d1";

// POST /api/cards/[id]/like
// Action: 'like' (increment) or 'unlike' (decrement)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let action = "like";
    try {
      const body = await request.json();
      if (body.action === "unlike") action = "unlike";
    } catch {
      // default like
    }

    const existing = await queryD1<Record<string, unknown>>("SELECT * FROM cards WHERE id = ?", [id]);
    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 });
    }

    const sql = action === "unlike"
      ? "UPDATE cards SET likes = MAX(0, likes - 1) WHERE id = ?"
      : "UPDATE cards SET likes = likes + 1 WHERE id = ?";

    await queryD1(sql, [id]);

    const updated = await queryD1<Record<string, unknown>>("SELECT * FROM cards WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      data: updated.length > 0 ? parseCard(updated[0]) : null,
      message: action === "unlike" ? "Unliked" : "Liked",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
