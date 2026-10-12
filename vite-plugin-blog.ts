// Blog plumbing for Vite:
//  • `virtual:blog-index`: post metadata (no bodies) plus lazy loaders, so pages only download the post they show.
//  • `feed.xml`: RSS feed emitted at build time.
//  • `POST /__blog/save` (dev server only, localhost only): the /blog/write studio saves posts straight to disk.
import fs from "node:fs";
import path from "node:path";
import type { Plugin, ResolvedConfig } from "vite";
import { excerpt, parseFrontmatter, readingMinutes, toMeta } from "./src/lib/blog/frontmatter";

const VIRTUAL = "virtual:blog-index";
const RESOLVED = "\0" + VIRTUAL;
const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
const FILE_RE = /^[\w][\w.-]*$/;

export function blog(): Plugin {
  let config: ResolvedConfig;
  let contentDir = "";
  let publicBlogDir = "";

  const readPosts = (includeDrafts: boolean) => {
    if (!fs.existsSync(contentDir)) return [];
    return fs
      .readdirSync(contentDir)
      .filter((f) => f.endsWith(".md"))
      .map((file) => {
        const slug = file.replace(/\.md$/, "");
        const src = fs.readFileSync(path.join(contentDir, file), "utf8");
        const { data, body } = parseFrontmatter(src);
        return { slug, file, body, ...toMeta(data, body, slug), readingMinutes: readingMinutes(body) };
      })
      .filter((p) => SLUG_RE.test(p.slug) && (includeDrafts || !p.draft))
      .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
  };

  return {
    name: "rr-blog",
    configResolved(c) {
      config = c;
      contentDir = path.resolve(c.root, "src/content/blog");
      publicBlogDir = path.resolve(c.publicDir || path.resolve(c.root, "public"), "blog");
    },
    resolveId(id) {
      return id === VIRTUAL ? RESOLVED : null;
    },
    load(id) {
      if (id !== RESOLVED) return null;
      const posts = readPosts(config.command === "serve");
      for (const p of posts) this.addWatchFile(path.join(contentDir, p.file));
      const meta = posts.map(({ body: _b, file: _f, ...m }) => m);
      const loaders = posts
        .map((p) => `  ${JSON.stringify(p.slug)}: () => import(${JSON.stringify(`/src/content/blog/${p.file}?raw`)}).then((m) => m.default),`)
        .join("\n");
      return `export const posts = ${JSON.stringify(meta)};\nexport const loaders = {\n${loaders}\n};\n`;
    },
    configureServer(server) {
      const reload = (file: string) => {
        if (!file.startsWith(contentDir)) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.add(contentDir);
      server.watcher.on("add", reload);
      server.watcher.on("unlink", reload);
      server.watcher.on("change", reload);

      server.middlewares.use("/__blog/save", (req, res) => {
        const ip = req.socket.remoteAddress ?? "";
        const local = ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
        if (req.method !== "POST" || !local) {
          res.statusCode = 403;
          return res.end("forbidden");
        }
        let raw = "";
        req.on("data", (c) => (raw += c));
        req.on("end", () => {
          try {
            const { slug, markdown, media = [] } = JSON.parse(raw) as {
              slug: string;
              markdown: string;
              media?: { name: string; base64: string }[];
            };
            if (!SLUG_RE.test(slug) || slug === "write") throw new Error("invalid slug");
            fs.mkdirSync(contentDir, { recursive: true });
            fs.writeFileSync(path.join(contentDir, `${slug}.md`), markdown);
            if (media.length) {
              const dir = path.join(publicBlogDir, slug);
              fs.mkdirSync(dir, { recursive: true });
              for (const m of media) {
                if (!FILE_RE.test(m.name)) throw new Error(`invalid file name: ${m.name}`);
                fs.writeFileSync(path.join(dir, m.name), Buffer.from(m.base64, "base64"));
              }
            }
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, path: `src/content/blog/${slug}.md` }));
          } catch (e) {
            res.statusCode = 400;
            res.end(JSON.stringify({ ok: false, error: (e as Error).message }));
          }
        });
      });
    },
    generateBundle() {
      const domain = process.env.CUSTOM_DOMAIN;
      const site = domain ? `https://${domain}/` : `https://rahul5977.github.io${config.base}`;
      const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const items = readPosts(false)
        .slice(0, 30)
        .map((p) => {
          const url = `${site}blog/${p.slug}`;
          return `    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${new Date(`${p.date}T09:00:00+05:30`).toUTCString()}</pubDate>
      <description>${esc(p.summary || excerpt(p.body))}</description>
${p.tags.map((t) => `      <category>${esc(t)}</category>`).join("\n")}
    </item>`;
        })
        .join("\n");
      this.emitFile({
        type: "asset",
        fileName: "feed.xml",
        source: `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Rahul Raj · Blog</title>
    <link>${site}blog</link>
    <atom:link href="${site}feed.xml" rel="self" type="application/rss+xml" />
    <description>Notes on what I'm building, learning and thinking about.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`,
      });
    },
  };
}
