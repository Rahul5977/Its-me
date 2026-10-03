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
  lib/sound.ts               Web Audio sound engine (hover/click/key/boot/success…)
  components/fx/             ambient effects + animation primitives
  components/portfolio/      page sections (Hero, About, Work, Journey, Stack, Terminal, Contact…)
  pages/Index.tsx            page assembly + global UI sounds
```

## Visitors & guestbook

- **Analytics:** [GoatCounter](https://www.goatcounter.com) (cookie-free). Set the repo variable once:
  `gh variable set GOATCOUNTER_CODE --body <your-code>` and push / re-run the deploy. Stats live at `https://<your-code>.goatcounter.com`.
- **Guestbook:** [giscus](https://giscus.app) over this repo's Discussions ("Guestbook" thread in *General*).
  Requires the giscus GitHub App installed on this repo.
