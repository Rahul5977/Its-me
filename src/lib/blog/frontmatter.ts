// Tiny, dependency-free frontmatter for blog posts. Shared by the browser (editor) and vite.config (build).
// Supports the flat subset posts use: strings (quoted or bare), numbers, booleans and [inline, lists].

export interface PostMeta {
  title: string;
  /** ISO date, e.g. 2026-10-12. */
  date: string;
  summary: string;
  tags: string[];
  /** Cover image: `media/x.webp` (stored with the post), a /public path, or a full URL. */
  cover?: string;
  /** One emoji that sets the mood of the post. */
  mood?: string;
  /** Drafts show up in `npm run dev` but are left out of production builds. */
  draft?: boolean;
}

type Value = string | number | boolean | string[];

function parseScalar(raw: string): string | number | boolean {
  const v = raw.trim();
  if (v.startsWith('"') && v.endsWith('"')) {
    try {
      return JSON.parse(v);
    } catch {
      return v.slice(1, -1);
    }
  }
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  if (v === "true" || v === "false") return v === "true";
  if (/^-?\d+(\.\d+)?$/.test(v) && !/^\d{4}-/.test(v)) return Number(v);
  return v;
}

function splitList(inner: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quote: string | null = null;
  for (const c of inner) {
    if (quote) {
      if (c === quote) quote = null;
      cur += c;
    } else if (c === '"' || c === "'") {
      quote = c;
      cur += c;
    } else if (c === ",") {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  if (cur.trim()) out.push(cur);
  return out.map((s) => String(parseScalar(s))).filter(Boolean);
}

export function parseFrontmatter(source: string): { data: Record<string, Value>; body: string } {
  const m = /^\uFEFF?---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!m) return { data: {}, body: source };
  const data: Record<string, Value> = {};
  let listKey: string | null = null;
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    // YAML block list ("tags:\n  - a\n  - b")
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && listKey) {
      (data[listKey] as string[]).push(String(parseScalar(item[1])));
      continue;
    }
    const kv = /^([A-Za-z_][\w-]*)\s*:\s*(.*)$/.exec(line);
    if (!kv) continue;
    const [, key, rest] = kv;
    listKey = null;
    if (rest === "") {
      data[key] = [];
      listKey = key;
    } else if (rest.trim().startsWith("[") && rest.trim().endsWith("]")) {
      data[key] = splitList(rest.trim().slice(1, -1));
    } else data[key] = parseScalar(rest);
  }
  return { data, body: source.slice(m[0].length) };
}

/** Normalise loose frontmatter into PostMeta, filling sensible fallbacks. */
export function toMeta(data: Record<string, Value>, body: string, fallbackTitle = "Untitled"): PostMeta {
  const str = (v: Value | undefined) => (v === undefined ? "" : Array.isArray(v) ? v.join(", ") : String(v));
  const firstHeading = /^#\s+(.+)$/m.exec(body)?.[1];
  const tags = Array.isArray(data.tags) ? data.tags : str(data.tags).split(",").map((t) => t.trim()).filter(Boolean);
  return {
    title: str(data.title) || firstHeading || fallbackTitle,
    date: str(data.date) || new Date().toISOString().slice(0, 10),
    summary: str(data.summary ?? data.description) || excerpt(body),
    tags: tags.map((t) => t.toLowerCase()),
    cover: str(data.cover) || undefined,
    mood: str(data.mood) || undefined,
    draft: data.draft === true,
  };
}

export function serializeFrontmatter(meta: PostMeta): string {
  const q = (s: string) => JSON.stringify(s);
  const lines = [
    "---",
    `title: ${q(meta.title)}`,
    `date: ${meta.date}`,
    `summary: ${q(meta.summary)}`,
    `tags: [${meta.tags.map(q).join(", ")}]`,
  ];
  if (meta.cover) lines.push(`cover: ${q(meta.cover)}`);
  if (meta.mood) lines.push(`mood: ${q(meta.mood)}`);
  if (meta.draft) lines.push("draft: true");
  lines.push("---", "");
  return lines.join("\n");
}

/** Plain-text excerpt from markdown, for summaries and the RSS feed. */
export function excerpt(md: string, max = 180): string {
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\$\$[\s\S]*?\$\$/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/\[!\w+\]/g, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max).replace(/\s+\S*$/, "")}…` : text;
}

export function readingMinutes(md: string): number {
  const words = md.replace(/```[\s\S]*?```/g, (c) => c.split(/\s+/).slice(0, 60).join(" ")).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "post"
  );
}
