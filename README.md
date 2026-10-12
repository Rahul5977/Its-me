# Rahul Raj · Portfolio

A techy, animated single-page portfolio: boot sequence, neural-network canvas background, custom cursor,
synthesized UI sound effects (Web Audio, no assets), ⌘K command palette, interactive terminal, sticky stacked
project cards with live mini-demos, a scroll-drawn timeline, a live GitHub contribution graph, and a contact form.

**Stack:** Vite · React 18 · TypeScript · Tailwind · Framer Motion · Lenis · shadcn/ui (cmdk, sonner)

```bash
npm install
npm run dev      # http://localhost:8080
npm run build
```

## Editing content

All content lives in [`src/data/portfolio.ts`](src/data/portfolio.ts): profile, projects, experience, skills, achievements.

- **Photo:** drop a square image at `public/avatar.jpg`. Without one, the hero shows an animated "RR" monogram.
- **Contact form:** delivers through [FormSubmit](https://formsubmit.co) with no key. The very first submission sends an
  activation email to the inbox, and you click it once. Alternatively set `VITE_WEB3FORMS_KEY` (repo secret for CI) to use Web3Forms.
  If delivery ever fails, the form opens the visitor's mail app pre-filled.

## Blog

Posts are Markdown files in [`src/content/blog/`](src/content/blog) (images in `public/blog/<slug>/`), rendered at `/blog`
and `/blog/<slug>` with giscus comments, plus an RSS feed at `/feed.xml`.

**Writing studio: `/blog/write`.** Split editor with live preview, toolbar, emoji picker, animated stickers, GIFs,
drag/drop/paste images (auto-compressed to WebP), `.md` import, and autosaved drafts.

- **Publish from anywhere** (even your phone): *Publish* → paste a fine-grained GitHub token with
  *Contents: read & write* on this repo (stored only in that browser). It makes one commit and the site redeploys in ~2 min.
- **Locally:** `npm run dev` → `/blog/write` → *Save to disk* writes the files into the repo; commit & push as usual.
- **By hand:** drop a `.md` file into `src/content/blog/`:

```md
---
title: "What I learned about vector DBs"
date: 2026-10-12
summary: "One line for the card."
tags: ["til", "ai"]
mood: "🧠"
cover: "media/cover.webp"   # optional, file in public/blog/<slug>/
draft: true                  # optional: only visible in npm run dev
---
```

Extras: `> [!TIL]` / `[!NOTE]` / `[!TIP]` / `[!WARNING]` callouts, `![sticker](url)`, `$math$`, highlighted code,
and a YouTube/Vimeo/Loom link on its own line becomes a player. See the draft post
[`markdown-playground.md`](src/content/blog/markdown-playground.md) for everything.
GIF search needs a free GIPHY key: `gh variable set GIPHY_KEY --body <key>` (or `VITE_GIPHY_KEY` in `.env.local`).

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml` → GitHub Pages.

- Without a custom domain: `https://rahul5977.github.io/Its-me/`
- With `its-me.kodexa.in`: add a DNS **CNAME** record `its-me` → `rahul5977.github.io`, then
  `gh variable set CUSTOM_DOMAIN --body its-me.kodexa.in` and
  `gh api -X PUT repos/Rahul5977/Its-me/pages -f cname=its-me.kodexa.in`, then re-run the workflow.

## Layout

```
src/
  data/portfolio.ts          content
  content/blog/*.md          blog posts
  lib/blog/                  frontmatter, post index, GitHub publishing, studio media
  lib/sound.ts               Web Audio sound engine (hover/click/key/boot/success…)
  components/fx/             ambient effects + animation primitives
  components/portfolio/      page sections (Hero, About, Work, Journey, Stack, Terminal, Contact…)
  pages/Index.tsx            page assembly
  pages/Blog*.tsx            blog index, post page, writing studio
```

## Visitors & guestbook

- **Analytics:** [GoatCounter](https://www.goatcounter.com) (cookie-free). Set the repo variable once:
  `gh variable set GOATCOUNTER_CODE --body <your-code>` and push / re-run the deploy. Stats live at `https://<your-code>.goatcounter.com`.
- **Guestbook:** [giscus](https://giscus.app) over this repo's Discussions ("Guestbook" thread in *General*).
  Requires the giscus GitHub App installed on this repo.
