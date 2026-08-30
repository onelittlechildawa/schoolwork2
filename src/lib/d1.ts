export interface CardItem {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  color: string;
  author: string;
  likes: number;
  pinned: boolean;
  created_at: string;
  updated_at: string;
}

export type CreateCardInput = {
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  color?: string;
  author?: string;
};

export type UpdateCardInput = Partial<CreateCardInput> & {
  pinned?: boolean;
};

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID;
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;

export async function queryD1<T = unknown>(sql: string, params: (string | number | boolean | null)[] = []): Promise<T[]> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sql,
      params,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`D1 Query HTTP error: ${response.status} - ${errText}`);
  }

  const data = await response.json();
  if (!data.success) {
    throw new Error(`D1 Query failure: ${JSON.stringify(data.errors)}`);
  }

  const results = data.result?.[0]?.results || [];
  return results as T[];
}

export function parseCard(raw: Record<string, unknown>): CardItem {
  let parsedTags: string[] = [];
  if (typeof raw.tags === "string") {
    try {
      parsedTags = JSON.parse(raw.tags);
    } catch {
      parsedTags = raw.tags ? [raw.tags] : [];
    }
  } else if (Array.isArray(raw.tags)) {
    parsedTags = raw.tags as string[];
  }

  return {
    id: String(raw.id || ""),
    title: String(raw.title || ""),
    content: String(raw.content || ""),
    category: String(raw.category || "General"),
    tags: parsedTags,
    color: String(raw.color || "amber"),
    author: String(raw.author || "Anonymous"),
    likes: Number(raw.likes || 0),
    pinned: Boolean(raw.pinned),
    created_at: String(raw.created_at || ""),
    updated_at: String(raw.updated_at || ""),
  };
}
