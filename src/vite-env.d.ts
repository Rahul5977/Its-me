/// <reference types="vite/client" />

declare module "virtual:blog-index" {
  import type { PostMeta } from "@/lib/blog/frontmatter";
  export const posts: (PostMeta & { slug: string; readingMinutes: number })[];
  export const loaders: Record<string, () => Promise<string>>;
}
