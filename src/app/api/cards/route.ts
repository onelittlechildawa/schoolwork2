import { NextRequest, NextResponse } from "next/server";
import { queryD1, parseCard } from "@/lib/d1";

// GET /api/cards?category=xxx&search=xxx&sort=latest|likes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "latest";

    let sql = "SELECT * FROM cards WHERE 1=1";
    const params: (string | number)[] = [];

    if (category && category !== "All") {
      sql += " AND category = ?";
      params.push(category);
    }

    if (search && search.trim()) {
      sql += " AND (title LIKE ? OR content LIKE ? OR tags LIKE ? OR author LIKE ?)";
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern, pattern, pattern);
    }

    // Pinned cards always stay on top
    if (sort === "likes") {
      sql += " ORDER BY pinned DESC, likes DESC, created_at DESC";
    } else {
      sql += " ORDER BY pinned DESC, created_at DESC";
    }

    const rows = await queryD1<Record<string, unknown>>(sql, params);
    const cards = rows.map(parseCard);

    return NextResponse.json({ success: true, data: cards });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("GET /api/cards error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/cards
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, category = "General", tags = [], color = "amber", author = "Anonymous" } = body;

    if (!title || !title.trim() || !content || !content.trim()) {
      return NextResponse.json({ success: false, error: "Title and content are required." }, { status: 400 });
    }

    const id = "card_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    const tagsJson = JSON.stringify(Array.isArray(tags) ? tags.map((t: string) => t.trim()).filter(Boolean) : []);
    const now = new Date().toISOString();

    const sql = `
      INSERT INTO cards (id, title, content, category, tags, color, author, likes, pinned, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
    `;

    await queryD1(sql, [id, title.trim(), content.trim(), category.trim(), tagsJson, color, author.trim() || "Anonymous", now, now]);

    const created = await queryD1<Record<string, unknown>>("SELECT * FROM cards WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      data: created.length > 0 ? parseCard(created[0]) : null,
      message: "Idea card created successfully!",
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Server Error";
    console.error("POST /api/cards error:", message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
