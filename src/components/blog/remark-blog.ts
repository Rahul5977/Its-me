// Remark plugin for blog-specific markdown:
//  • GitHub-style callouts:  > [!NOTE] / [!TIP] / [!TIL] / [!WARNING] / [!IMPORTANT] / [!CAUTION]
//  • A bare YouTube / Vimeo / Loom link on its own line becomes an embedded player.

/* eslint-disable @typescript-eslint/no-explicit-any */
type Node = { type: string; value?: string; url?: string; children?: Node[]; data?: Record<string, any> };

export const CALLOUTS = ["note", "tip", "til", "important", "warning", "caution"] as const;
export type CalloutKind = (typeof CALLOUTS)[number];

const EMBED_RE = /^https?:\/\/(www\.)?(youtube\.com\/watch|youtu\.be\/|youtube\.com\/shorts\/|vimeo\.com\/\d|loom\.com\/share\/)/;

export function embedSrc(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu")) {
      const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : u.pathname.startsWith("/shorts/") ? u.pathname.split("/")[2] : u.searchParams.get("v");
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
    }
    if (u.hostname.includes("vimeo")) return `https://player.vimeo.com/video/${u.pathname.split("/")[1]}`;
    if (u.hostname.includes("loom")) return `https://www.loom.com/embed/${u.pathname.split("/")[2]}`;
  } catch {
    /* not a URL */
  }
  return null;
}

function walk(node: Node) {
  if (node.type === "blockquote") {
    const para = node.children?.[0];
    const first = para?.type === "paragraph" ? para.children?.[0] : undefined;
    const m = first?.type === "text" ? /^\[!(\w+)\][^\S\n]*(.*)\n?/.exec(first.value ?? "") : null;
    if (m && (CALLOUTS as readonly string[]).includes(m[1].toLowerCase())) {
      const kind = m[1].toLowerCase();
      first!.value = first!.value!.slice(m[0].length);
      node.data = { ...node.data, hProperties: { "data-callout": kind, "data-title": m[2] || "" } };
      // "[!TIP] Custom title" — the rest of the first line becomes the title, not body text.
      if (!first!.value && para!.children!.length === 1) node.children!.shift();
      else if (!first!.value) para!.children!.shift();
    }
  }
  if (node.type === "paragraph" && node.children?.length === 1) {
    const link = node.children[0];
    if (link.type === "link" && link.url && EMBED_RE.test(link.url) && embedSrc(link.url)) {
      node.data = { hName: "div", hProperties: { "data-embed": link.url }, hChildren: [] };
    }
  }
  node.children?.forEach(walk);
}

export function remarkBlog() {
  return (tree: Node) => walk(tree);
}
