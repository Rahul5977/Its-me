import { loaders, posts as index } from "virtual:blog-index";
import { asset } from "@/lib/utils";
import { parseFrontmatter } from "./frontmatter";

export type PostSummary = (typeof index)[number];

/** Published posts, newest first (drafts are included only in `npm run dev`). */
export const posts: PostSummary[] = index;

export const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}

/** Lazily fetch a post's markdown body (frontmatter stripped). */
export async function loadPostBody(slug: string): Promise<string | null> {
  const load = loaders[slug];
  if (!load) return null;
  return parseFrontmatter(await load()).body;
}

/** Full source, frontmatter included, for re-opening a post in the studio. */
export async function loadPostSource(slug: string): Promise<string | null> {
  const load = loaders[slug];
  return load ? load() : null;
}

/**
 * Images in posts are written as `media/<file>` and live in `public/blog/<slug>/<file>`.
 * Absolute URLs pass through; root paths are resolved against the deploy base.
 */
export function resolveMedia(slug: string, src = ""): string {
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  if (src.startsWith("media/")) return asset(`blog/${slug}/${src.slice(6)}`);
  if (src.startsWith("/")) return asset(src);
  return src;
}

export function formatDate(iso: string, style: "long" | "short" = "long") {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", style === "long" ? { day: "numeric", month: "long", year: "numeric" } : { day: "numeric", month: "short" });
}
