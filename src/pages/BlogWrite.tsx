import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  Bold,
  CheckCircle2,
  CheckSquare,
  Code,
  Columns2,
  Download,
  Eye,
  FileCode2,
  FilePlus2,
  FileUp,
  FolderOpen,
  Github,
  Heading2,
  Heading3,
  HelpCircle,
  ImagePlus,
  Italic,
  Lock,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Megaphone,
  Minus,
  PenLine,
  Quote,
  Rocket,
  Save,
  Sigma,
  Smile,
  Sticker,
  Strikethrough,
  Table,
  Trash2,
  X,
  Youtube,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Logo } from "@/components/portfolio/Logo";
import { Markdown } from "@/components/blog/Markdown";
import { usePageTitle } from "@/components/blog/BlogShell";
import { EmojiPopover, GifPopover, StickerPopover } from "@/components/blog/StudioPickers";
import { parseFrontmatter, readingMinutes, serializeFrontmatter, slugify, toMeta, type PostMeta } from "@/lib/blog/frontmatter";
import { forgetVault, getSession, lockSession, publishCommit, type GithubSettings, type PublishFile } from "@/lib/blog/github";
import { OwnerAccess } from "@/components/blog/OwnerAccess";
import { blobToBase64, clearDraftMedia, compressImage, deleteDraftMedia, listDraftMedia, mediaName, putDraftMedia, referencedMedia } from "@/lib/blog/media";
import { allTags, loadPostSource, posts, resolveMedia } from "@/lib/blog/posts";
import { sound } from "@/lib/sound";
import { asset, cn } from "@/lib/utils";

/* ───────── draft state ───────── */

interface Draft {
  meta: PostMeta;
  slug: string;
  /** Once you edit the slug by hand, it stops following the title. */
  slugTouched: boolean;
  body: string;
  /** Slug of the published post being edited, or null for a new post. */
  editing: string | null;
}

const DRAFT_KEY = "rr-blog-draft";
const pad = (n: number) => String(n).padStart(2, "0");
const localToday = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};
const emptyDraft = (): Draft => ({
  meta: { title: "", date: localToday(), summary: "", tags: [] },
  slug: "",
  slugTouched: false,
  body: "",
  editing: null,
});

function loadDraft(): Draft {
  try {
    const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? "null");
    if (d && typeof d.body === "string" && d.meta) return { ...emptyDraft(), ...d, meta: { ...emptyDraft().meta, ...d.meta } };
  } catch {
    /* ignore */
  }
  return emptyDraft();
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;
type View = "write" | "split" | "preview";

/* ───────── small UI bits ───────── */

function ToolButton({ icon: Icon, label, onClick, shortcut }: { icon: typeof Bold; label: string; onClick?: () => void; shortcut?: string }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()} // keep the textarea selection
      onClick={onClick}
      title={shortcut ? `${label} (${shortcut})` : label}
      aria-label={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-white/5 hover:text-primary"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

const Sep = () => <span className="mx-1 h-5 w-px shrink-0 bg-white/10" />;

function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <label className="group block">
      <span className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground transition group-focus-within:text-primary">
        {label}
        {hint && <span className="normal-case tracking-normal">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-background/60 px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]";

const CHEATSHEET: [string, string][] = [
  ["**bold** / *italic* / ~~strike~~", "text styles"],
  ["## Heading", "section (shows in the table of contents)"],
  ["> [!TIL] / [!NOTE] / [!TIP]", "callout box ([!WARNING], [!IMPORTANT], [!CAUTION])"],
  ["> [!TIP] Custom title", "callout with your own title"],
  ["![alt](media/x.webp \"caption\")", "image with a caption"],
  ["![sticker](url)", "animated sticker"],
  [":rocket: :fire: :tada:", "emoji shortcodes"],
  ["$E = mc^2$  /  $$ … $$", "inline / block math (KaTeX)"],
  ["```python", "code block with highlighting"],
  ["- [ ] todo", "checklist"],
  ["https://youtu.be/…", "YouTube / Vimeo / Loom link alone on a line → embedded player"],
  ["<details><summary>…</summary>…</details>", "collapsible section (raw HTML works too)"],
];

/* ───────── publish dialog ───────── */

function PublishDialog({
  open,
  onOpenChange,
  draft,
  buildFiles,
  onPublished,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  draft: Draft;
  buildFiles: () => Promise<{ markdown: string; media: { name: string; base64: string }[] }>;
  onPublished: (slug: string) => void;
}) {
  const [gh, setGh] = useState<GithubSettings | null>(getSession);
  const [phase, setPhase] = useState<"idle" | "working" | "done">("idle");
  const [result, setResult] = useState<{ commit?: string; local?: string } | null>(null);
  const { slug, meta } = draft;
  const problems = [
    !meta.title.trim() && "Add a title",
    !SLUG_RE.test(slug) && "Slug must be lowercase letters, numbers and dashes",
    slug === "write" && "“write” is reserved",
    !draft.body.trim() && "The post is empty",
    !draft.editing && posts.some((p) => p.slug === slug) && `A post with slug “${slug}” already exists. Publishing will overwrite it.`,
  ].filter(Boolean) as string[];
  const blocking = problems.filter((p) => !p.includes("overwrite"));

  useEffect(() => {
    if (open) {
      setPhase("idle");
      setResult(null);
    }
  }, [open]);

  const publish = async () => {
    if (!gh) return;
    setPhase("working");
    try {
      const { markdown, media } = await buildFiles();
      const files: PublishFile[] = [
        { path: `src/content/blog/${slug}.md`, content: markdown, encoding: "utf-8" },
        ...media.map((m) => ({ path: `public/blog/${slug}/${m.name}`, content: m.base64, encoding: "base64" as const })),
      ];
      const verb = draft.editing ? "update" : "publish";
      const commit = await publishCommit(gh, files, `blog: ${verb} “${meta.title.trim()}”`);
      setResult({ commit });
      setPhase("done");
      sound.play("success");
      onPublished(slug);
    } catch (e) {
      setPhase("idle");
      sound.play("error");
      toast.error("Publish failed", { description: (e as Error).message });
    }
  };

  const saveLocal = async () => {
    setPhase("working");
    try {
      const { markdown, media } = await buildFiles();
      const res = await fetch("/__blog/save", { method: "POST", body: JSON.stringify({ slug, markdown, media }) });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);
      setResult({ local: data.path });
      setPhase("done");
      sound.play("success");
      onPublished(slug);
    } catch (e) {
      setPhase("idle");
      toast.error("Save failed", { description: (e as Error).message });
    }
  };

  const liveUrl = `${window.location.origin}${asset(`blog/${slug}`)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass max-w-lg rounded-3xl border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-2xl">
            <Rocket className="h-5 w-5 text-primary" /> {draft.editing ? "Update post" : "Ship it"}
          </DialogTitle>
          <DialogDescription>One commit to your repo: the post plus its images. The site redeploys automatically.</DialogDescription>
        </DialogHeader>

        {phase === "done" && result ? (
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <div className="text-sm">
                {result.commit ? (
                  <>
                    <p className="font-semibold">Committed! Deploy is running.</p>
                    <p className="mt-1 text-muted-foreground">It&apos;ll be live in ~1–2 minutes at</p>
                    <a href={liveUrl} target="_blank" rel="noreferrer" className="break-all font-mono text-xs text-primary hover:underline">
                      {liveUrl}
                    </a>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">Saved to disk.</p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">{result.local}</p>
                    <p className="mt-2 text-muted-foreground">Commit &amp; push when you&apos;re ready, or publish from here.</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {result.commit && (
                <>
                  <a href={result.commit} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 font-mono text-xs transition hover:border-primary hover:text-primary">
                    view commit
                  </a>
                  <a href={`https://github.com/${gh?.repo}/actions`} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-4 py-2 font-mono text-xs transition hover:border-primary hover:text-primary">
                    watch deploy
                  </a>
                </>
              )}
              {result.local && (
                <Link to={`/blog/${slug}`} className="rounded-full border border-white/10 px-4 py-2 font-mono text-xs transition hover:border-primary hover:text-primary">
                  open post
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-background/40 p-4 font-mono text-xs">
              <div className="flex justify-between gap-3">
                <span className="text-muted-foreground">post</span>
                <span className="truncate">src/content/blog/{slug || "…"}.md</span>
              </div>
              <div className="mt-1.5 flex justify-between gap-3">
                <span className="text-muted-foreground">url</span>
                <span className="truncate">/blog/{slug || "…"}</span>
              </div>
              {meta.draft && <div className="mt-2 text-amber-300">marked as draft: hidden on the live site</div>}
            </div>

            {problems.length > 0 && (
              <ul className="space-y-1 text-sm">
                {problems.map((p) => (
                  <li key={p} className={p.includes("overwrite") ? "text-amber-300" : "text-destructive"}>
                    • {p}
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-3 rounded-2xl border border-white/10 p-4">
              <div className="flex items-center justify-between gap-2 text-sm font-semibold">
                <span className="inline-flex items-center gap-2">
                  <Github className="h-4 w-4" /> GitHub{" "}
                  {gh ? (
                    <span className="font-mono text-[11px] font-normal text-accent">unlocked · {gh.repo}</span>
                  ) : (
                    <span className="font-mono text-[11px] font-normal text-muted-foreground">locked</span>
                  )}
                </span>
                {gh && (
                  <button
                    onClick={() => {
                      forgetVault();
                      setGh(null);
                    }}
                    className="inline-flex items-center gap-1.5 font-mono text-[11px] font-normal text-muted-foreground transition hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> remove token
                  </button>
                )}
              </div>
              {!gh && <OwnerAccess onReady={setGh} />}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                onClick={publish}
                disabled={phase === "working" || !gh || blocking.length > 0}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground transition hover:shadow-[0_0_30px_hsl(var(--primary)/0.5)] disabled:opacity-40 disabled:hover:shadow-none"
              >
                {phase === "working" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                {draft.editing ? "Commit update" : "Publish to GitHub"}
              </button>
              {import.meta.env.DEV && (
                <button
                  onClick={saveLocal}
                  disabled={phase === "working" || blocking.length > 0}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-5 py-3 text-sm transition hover:border-primary hover:text-primary disabled:opacity-40"
                >
                  <Save className="h-4 w-4" /> Save to disk
                </button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}


/* ───────── owner gate ───────── */

/**
 * The studio is the owner's alone. Publishing was always guarded by GitHub (only a token with push
 * access to the repo can commit), but visitors shouldn't even see the editor. It opens in `npm run dev`,
 * or once you unlock the encrypted token with your passphrase (re-checked against GitHub every time).
 */
export default function BlogWrite() {
  usePageTitle("Studio · Rahul Raj");
  const [unlocked, setUnlocked] = useState(() => import.meta.env.DEV || !!getSession());

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  if (unlocked) return <Studio />;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-60" />
      <div className="glass relative w-full max-w-md rounded-3xl p-8 text-center">
        <Link to="/blog" className="mx-auto mb-6 block w-fit" aria-label="Back to blog">
          <Logo className="h-12 w-12" />
        </Link>
        <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h1 className="font-display text-2xl font-bold">This studio is private</h1>
            <p className="mt-2 text-sm text-muted-foreground">It&apos;s where Rahul writes. The posts themselves are all on the blog.</p>
            <Link
              to="/blog"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:shadow-[0_0_24px_hsl(var(--primary)/0.5)]"
            >
              Read the blog
            </Link>
            <details className="mt-8 text-left">
              <summary className="cursor-pointer text-center font-mono text-[11px] text-muted-foreground/70 transition hover:text-muted-foreground">owner sign-in</summary>
              <div className="mt-4">
                <OwnerAccess onReady={() => setUnlocked(true)} />
              </div>
            </details>
        </>
      </div>
    </div>
  );
}

/* ───────── the studio (owner only) ───────── */

function Studio() {
  const [draft, setDraft] = useState<Draft>(loadDraft);
  const [media, setMedia] = useState<Record<string, string>>({});
  const [view, setView] = useState<View>(() => (window.innerWidth >= 1024 ? "split" : "write"));
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [publishOpen, setPublishOpen] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [dragging, setDragging] = useState(false);
  const ta = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  const { meta, body } = draft;
  const slug = draft.slugTouched || draft.editing ? draft.slug : slugify(meta.title || "untitled");

  const update = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const setMeta = useCallback((patch: Partial<PostMeta>) => setDraft((d) => ({ ...d, meta: { ...d.meta, ...patch } })), []);

  // Autosave the text to localStorage (images are already in IndexedDB).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, slug }));
        setSavedAt(new Date());
      } catch {
        /* storage full or blocked */
      }
    }, 600);
    return () => clearTimeout(t);
  }, [draft, slug]);

  // Load draft images from IndexedDB.
  useEffect(() => {
    const urls: string[] = [];
    listDraftMedia()
      .then((list) => {
        const map: Record<string, string> = {};
        for (const [name, blob] of list) {
          const u = URL.createObjectURL(blob);
          urls.push(u);
          map[name] = u;
        }
        setMedia(map);
      })
      .catch(() => {});
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const resolve = useCallback(
    (src: string) => {
      const name = src.startsWith("media/") ? src.slice(6) : "";
      return name && media[name] ? media[name] : resolveMedia(draft.editing || slug, src);
    },
    [media, draft.editing, slug],
  );

  /* ── text editing helpers (execCommand keeps native undo/redo) ── */

  const insert = useCallback((text: string, select?: [number, number]) => {
    const el = ta.current;
    if (!el) return;
    el.focus();
    const start = el.selectionStart;
    if (!document.execCommand("insertText", false, text)) {
      el.setRangeText(text, el.selectionStart, el.selectionEnd, "end");
      setDraft((d) => ({ ...d, body: el.value }));
    }
    if (select) el.setSelectionRange(start + select[0], start + select[1]);
  }, []);

  const wrap = (before: string, after = before, placeholder = "text") => {
    const el = ta.current!;
    const sel = el.value.slice(el.selectionStart, el.selectionEnd) || placeholder;
    insert(before + sel + after, [before.length, before.length + sel.length]);
  };

  const prefixLines = (prefix: string | ((i: number) => string)) => {
    const el = ta.current!;
    el.focus();
    const v = el.value;
    const s = v.lastIndexOf("\n", el.selectionStart - 1) + 1;
    let e = v.indexOf("\n", el.selectionEnd);
    if (e === -1) e = v.length;
    el.setSelectionRange(s, e);
    const lines = v.slice(s, e).split("\n");
    insert(lines.map((l, i) => (typeof prefix === "string" ? prefix : prefix(i)) + l).join("\n"));
  };

  /** Insert a block on its own paragraph. */
  const block = (text: string, select?: [number, number]) => {
    const el = ta.current!;
    const before = el.value.slice(0, el.selectionStart);
    const lead = !before || before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
    insert(`${lead}${text}\n\n`, select && [select[0] + lead.length, select[1] + lead.length]);
  };

  /* ── media ── */

  const addFiles = async (files: File[], as: "image" | "sticker" = "image") => {
    for (const file of files) {
      if (/\.(md|markdown)$/i.test(file.name) || file.type === "text/markdown") {
        await importMarkdown(file);
        continue;
      }
      if (!/^(image|video)\//.test(file.type)) {
        toast.error(`Unsupported file: ${file.name}`);
        continue;
      }
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`${file.name} is over 25 MB`);
        continue;
      }
      const blob = as === "sticker" ? file : await compressImage(file);
      const name = mediaName(file, blob);
      await putDraftMedia(name, blob);
      setMedia((m) => ({ ...m, [name]: URL.createObjectURL(blob) }));
      if (file.type.startsWith("video/")) block(`<video src="media/${name}" autoplay loop muted playsinline></video>`);
      else if (as === "sticker") insert(`![sticker](media/${name})`);
      else block(`![image](media/${name} "caption")`, [`![image](media/${name} "`.length, `![image](media/${name} "caption`.length]);
      if (blob.size < file.size) toast.success(`${file.name} optimised`, { description: `${(file.size / 1024).toFixed(0)} KB → ${(blob.size / 1024).toFixed(0)} KB` });
    }
    sound.play("success");
  };

  const setCover = async (file: File) => {
    const blob = await compressImage(file);
    const name = `cover-${mediaName(file, blob)}`;
    await putDraftMedia(name, blob);
    setMedia((m) => ({ ...m, [name]: URL.createObjectURL(blob) }));
    setMeta({ cover: `media/${name}` });
  };

  const importMarkdown = async (file: File) => {
    const text = await file.text();
    const { data, body: b } = parseFrontmatter(text);
    const m = toMeta(data, b, file.name.replace(/\.[^.]+$/, ""));
    // A leading "# Title" duplicates the page title, so drop it.
    const cleaned = b.replace(/^\s*#\s+.+\n+/, "");
    const fileSlug = slugify(file.name.replace(/\.[^.]+$/, ""));
    setDraft({ meta: m, body: cleaned, slug: fileSlug, slugTouched: true, editing: null });
    toast.success(`Imported ${file.name}`);
  };

  const openPost = async (s: string) => {
    const src = await loadPostSource(s);
    if (!src) return;
    const { data, body: b } = parseFrontmatter(src);
    setDraft({ meta: toMeta(data, b, s), body: b.replace(/^\n+/, ""), slug: s, slugTouched: true, editing: s });
    toast.success(`Editing “${data.title ?? s}”`);
  };

  const newPost = async () => {
    if (!confirmNew && (body.trim() || meta.title.trim())) {
      setConfirmNew(true);
      setTimeout(() => setConfirmNew(false), 3000);
      return;
    }
    setConfirmNew(false);
    await clearDraftMedia();
    Object.values(media).forEach((u) => URL.revokeObjectURL(u));
    setMedia({});
    setDraft(emptyDraft());
    ta.current?.focus();
  };

  const markdown = () => `${serializeFrontmatter({ ...meta, title: meta.title.trim(), summary: meta.summary.trim() })}\n${body.trim()}\n`;

  const buildFiles = async () => {
    const refs = referencedMedia(body, meta.cover);
    const list = await listDraftMedia();
    const out: { name: string; base64: string }[] = [];
    for (const [name, blob] of list) if (refs.has(name)) out.push({ name, base64: await blobToBase64(blob) });
    return { markdown: markdown(), media: out };
  };

  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([markdown()], { type: "text/markdown" }));
    a.download = `${slug || "post"}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  // Unused images in the draft store (e.g. you deleted the line): tidy them up on publish.
  const onPublished = (s: string) => {
    update({ editing: s, slug: s, slugTouched: true });
    const refs = referencedMedia(body, meta.cover);
    Object.keys(media).forEach((n) => !refs.has(n) && deleteDraftMedia(n));
  };

  /* ── keyboard / paste / drop ── */

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const mod = e.metaKey || e.ctrlKey;
    const actions: Record<string, () => void> = {
      b: () => wrap("**"),
      i: () => wrap("*"),
      k: () => wrap("[", "](https://)", "link text"),
      s: () => toast.success("Draft saved", { description: "Autosaved in this browser." }),
      Enter: () => setPublishOpen(true),
    };
    const action = mod ? actions[e.key] : e.key === "Tab" && !e.shiftKey ? () => insert("  ") : undefined;
    if (action) {
      e.preventDefault();
      action();
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const files = Array.from(e.clipboardData.files);
    if (files.length) {
      e.preventDefault();
      addFiles(files);
      return;
    }
    const text = e.clipboardData.getData("text/plain").trim();
    const el = e.currentTarget;
    // Paste a URL over selected text → markdown link.
    if (/^https?:\/\/\S+$/.test(text) && el.selectionStart !== el.selectionEnd) {
      e.preventDefault();
      wrap("[", `](${text})`);
    }
  };

  const syncScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    const p = previewRef.current;
    if (!p || view !== "split") return;
    const ratio = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight);
    p.scrollTop = ratio * (p.scrollHeight - p.clientHeight);
  };

  const words = useMemo(() => body.split(/\s+/).filter(Boolean).length, [body]);
  const coverSrc = meta.cover ? resolve(meta.cover) : "";

  // "ai, rag, daily life" → three tags; spaces inside a tag become dashes.
  const addTag = (t: string) => {
    const next = [...meta.tags];
    for (const part of t.split(/[,\n]/)) {
      const tag = part.trim().toLowerCase().replace(/^#/, "").replace(/\s+/g, "-");
      if (tag && !next.includes(tag)) next.push(tag);
    }
    if (next.length !== meta.tags.length) setMeta({ tags: next });
    setTagInput("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background lg:h-screen">
      {/* top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/5 px-3 md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/blog" className="shrink-0" aria-label="Back to blog">
            <Logo className="h-8 w-8" />
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-primary">studio</span>
              <span className="text-muted-foreground">/</span>
              <span className="truncate text-muted-foreground">{draft.editing ? `editing ${draft.editing}` : "new post"}</span>
            </div>
            <div className="font-mono text-[10px] text-muted-foreground/70">{savedAt ? `autosaved ${savedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "not saved yet"}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={newPost}
            className={cn(
              "hidden items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs transition sm:inline-flex",
              confirmNew ? "bg-destructive/15 text-destructive" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <FilePlus2 className="h-3.5 w-3.5" /> {confirmNew ? "discard draft?" : "new"}
          </button>
          <Popover>
            <PopoverTrigger asChild>
              <button className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs text-muted-foreground transition hover:text-foreground">
                <FolderOpen className="h-3.5 w-3.5" /> <span className="hidden sm:inline">open</span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="glass w-72 rounded-2xl border-white/10 p-2">
              <div className="px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">edit a published post</div>
              <div data-lenis-prevent className="max-h-72 overflow-y-auto">
                {posts.length === 0 && <p className="px-2 py-3 text-sm text-muted-foreground">No posts yet.</p>}
                {posts.map((p) => (
                  <button key={p.slug} onClick={() => openPost(p.slug)} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition hover:bg-white/5">
                    <span>{p.mood || "✍️"}</span>
                    <span className="flex-1 truncate">{p.title}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{p.date.slice(5)}</span>
                  </button>
                ))}
              </div>
              <div className="mt-1 border-t border-white/5 pt-1">
                <button onClick={() => importRef.current?.click()} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition hover:bg-white/5">
                  <FileUp className="h-4 w-4 text-primary" /> import a .md file
                </button>
              </div>
            </PopoverContent>
          </Popover>
          {!import.meta.env.DEV && (
            <button
              onClick={() => {
                lockSession();
                window.location.reload();
              }}
              title="Lock the studio (clears the token from memory)"
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs text-muted-foreground transition hover:text-foreground"
            >
              <Lock className="h-3.5 w-3.5" /> <span className="hidden sm:inline">lock</span>
            </button>
          )}
          <button onClick={download} title="Download .md" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-xs text-muted-foreground transition hover:text-foreground">
            <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">.md</span>
          </button>
          <button
            onClick={() => setPublishOpen(true)}
            className="ml-1 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:shadow-[0_0_24px_hsl(var(--primary)/0.5)]"
          >
            <Megaphone className="h-3.5 w-3.5" /> {draft.editing ? "Update" : "Publish"}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[320px_1fr]">
        {/* post settings */}
        <aside data-lenis-prevent className="space-y-5 border-b border-white/5 p-4 lg:overflow-y-auto lg:border-b-0 lg:border-r md:p-5">
          <Field label="cover">
            <button
              type="button"
              onClick={() => coverRef.current?.click()}
              className="group relative flex aspect-[16/9] w-full items-center justify-center overflow-hidden rounded-xl border border-dashed border-white/15 bg-background/40 transition hover:border-primary"
            >
              {coverSrc ? (
                <img src={coverSrc} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">
                  <ImagePlus className="h-5 w-5" /> add a cover (optional)
                </span>
              )}
            </button>
            {meta.cover && (
              <button type="button" onClick={() => setMeta({ cover: undefined })} className="mt-1.5 font-mono text-[10px] text-muted-foreground hover:text-destructive">
                remove cover
              </button>
            )}
          </Field>

          <Field label="summary" hint={<span>{meta.summary.length}/200</span>}>
            <textarea
              value={meta.summary}
              onChange={(e) => setMeta({ summary: e.target.value.slice(0, 200) })}
              rows={3}
              placeholder="One or two lines for the post card and link previews."
              className={cn(inputCls, "resize-none")}
            />
          </Field>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <Field label="date">
              <input type="date" value={meta.date} onChange={(e) => setMeta({ date: e.target.value })} className={cn(inputCls, "[color-scheme:dark]")} />
            </Field>
            <Field label="mood" hint={meta.mood ? <button type="button" onClick={() => setMeta({ mood: undefined })} className="hover:text-destructive">clear</button> : undefined}>
              <EmojiPopover
                onPick={(e) => setMeta({ mood: e })}
                trigger={
                  <button type="button" className="flex h-[38px] w-14 items-center justify-center rounded-xl border border-white/10 bg-background/60 text-xl transition hover:border-primary">
                    {meta.mood || <Smile className="h-4 w-4 text-muted-foreground" />}
                  </button>
                }
              />
            </Field>
          </div>

          <Field label="tags">
            <div className="flex flex-wrap gap-1.5 rounded-xl border border-white/10 bg-background/60 p-2 focus-within:border-primary">
              {meta.tags.map((t) => (
                <span key={t} className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-[11px] text-primary">
                  #{t}
                  <button type="button" onClick={() => setMeta({ tags: meta.tags.filter((x) => x !== t) })} aria-label={`Remove ${t}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => {
                  // Typing or pasting a comma commits everything before it as tags.
                  const v = e.target.value;
                  if (v.includes(",")) {
                    const cut = v.lastIndexOf(",");
                    addTag(v.slice(0, cut));
                    setTagInput(v.slice(cut + 1).trimStart());
                  } else setTagInput(v);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    addTag(tagInput);
                  } else if (e.key === "Backspace" && !tagInput && meta.tags.length) setMeta({ tags: meta.tags.slice(0, -1) });
                }}
                onBlur={() => tagInput && addTag(tagInput)}
                placeholder={meta.tags.length ? "" : "til, ai, daily…"}
                className="min-w-[80px] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground/50"
              />
            </div>
            {allTags.filter((t) => !meta.tags.includes(t)).length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {allTags
                  .filter((t) => !meta.tags.includes(t))
                  .slice(0, 10)
                  .map((t) => (
                    <button type="button" key={t} onClick={() => addTag(t)} className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] text-muted-foreground transition hover:border-primary hover:text-primary">
                      +{t}
                    </button>
                  ))}
              </div>
            )}
          </Field>

          <Field label="slug" hint={draft.editing ? "locked while editing" : undefined}>
            <div className="flex items-center rounded-xl border border-white/10 bg-background/60 pl-3 font-mono text-xs focus-within:border-primary">
              <span className="text-muted-foreground">/blog/</span>
              <input
                value={slug}
                disabled={!!draft.editing}
                onChange={(e) => update({ slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"), slugTouched: true })}
                className="w-full bg-transparent py-2 pr-3 outline-none disabled:opacity-60"
              />
            </div>
          </Field>

          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 px-3 py-2.5">
            <span className="text-sm">
              Draft
              <span className="block font-mono text-[10px] text-muted-foreground">hidden on the live site</span>
            </span>
            <input type="checkbox" checked={!!meta.draft} onChange={(e) => setMeta({ draft: e.target.checked })} className="h-4 w-4 accent-[hsl(var(--primary))]" />
          </label>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3 font-mono text-[11px] text-muted-foreground">
            <div className="flex justify-between">
              <span>words</span>
              <span className="text-foreground">{words}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>read time</span>
              <span className="text-foreground">{readingMinutes(body)} min</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span>images</span>
              <span className="text-foreground">{referencedMedia(body).size}</span>
            </div>
          </div>
        </aside>

        {/* editor */}
        <section className="flex min-h-0 flex-col">
          <div className="px-4 pt-5 md:px-8">
            <input
              value={meta.title}
              onChange={(e) => setMeta({ title: e.target.value })}
              placeholder="Title of today's story…"
              className="w-full bg-transparent font-display text-3xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/40 md:text-4xl"
            />
          </div>

          {/* toolbar */}
          <div className="sticky top-0 z-10 mt-3 flex items-center gap-2 border-y border-white/5 bg-background/90 px-2 py-1.5 backdrop-blur md:px-6">
            <div data-lenis-prevent className="flex min-w-0 flex-1 items-center overflow-x-auto [scrollbar-width:none]">
              <ToolButton icon={Bold} label="Bold" shortcut="⌘B" onClick={() => wrap("**")} />
              <ToolButton icon={Italic} label="Italic" shortcut="⌘I" onClick={() => wrap("*")} />
              <ToolButton icon={Strikethrough} label="Strikethrough" onClick={() => wrap("~~")} />
              <ToolButton icon={Code} label="Inline code" onClick={() => wrap("`", "`", "code")} />
              <ToolButton icon={Link2} label="Link" shortcut="⌘K" onClick={() => wrap("[", "](https://)", "link text")} />
              <Sep />
              <ToolButton icon={Heading2} label="Heading" onClick={() => prefixLines("## ")} />
              <ToolButton icon={Heading3} label="Subheading" onClick={() => prefixLines("### ")} />
              <ToolButton icon={Quote} label="Quote" onClick={() => prefixLines("> ")} />
              <ToolButton icon={List} label="Bullet list" onClick={() => prefixLines("- ")} />
              <ToolButton icon={ListOrdered} label="Numbered list" onClick={() => prefixLines((i) => `${i + 1}. `)} />
              <ToolButton icon={CheckSquare} label="Checklist" onClick={() => prefixLines("- [ ] ")} />
              <Sep />
              <ToolButton icon={FileCode2} label="Code block" onClick={() => block("```ts\n\n```", [6, 6])} />
              <ToolButton icon={Sigma} label="Math block" onClick={() => block("$$\n\\hat{y} = \\sigma(Wx + b)\n$$")} />
              <ToolButton icon={Table} label="Table" onClick={() => block("| Column | Column |\n| --- | --- |\n| cell | cell |")} />
              <ToolButton
                icon={Megaphone}
                label="Callout"
                onClick={() => block("> [!TIL]\n> Something that finally clicked today.", ["> [!TIL]\n> ".length, "> [!TIL]\n> Something that finally clicked today.".length])}
              />
              <ToolButton icon={Minus} label="Divider" onClick={() => block("---")} />
              <ToolButton icon={Youtube} label="Embed video" onClick={() => block("https://www.youtube.com/watch?v=", [32, 32])} />
              <Sep />
              <ToolButton icon={ImagePlus} label="Image or video" onClick={() => imageRef.current?.click()} />
              <GifPopover
                onPick={(url, title) => block(`![gif](${url}${title ? ` "${title.replace(/"/g, "")}"` : ""})`)}
                onUpload={(f) => addFiles([f])}
                trigger={
                  <button
                    type="button"
                    title="GIF"
                    className="flex h-8 shrink-0 items-center justify-center rounded-lg px-1.5 font-mono text-[11px] font-bold text-muted-foreground transition hover:bg-white/5 hover:text-primary"
                  >
                    GIF
                  </button>
                }
              />
              <StickerPopover
                onPick={(url, name) => insert(`![sticker: ${name}](${url})`)}
                onUpload={(f) => addFiles([f], "sticker")}
                trigger={
                  <button type="button" title="Sticker" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-white/5 hover:text-primary">
                    <Sticker className="h-4 w-4" />
                  </button>
                }
              />
              <EmojiPopover
                onPick={(e) => insert(e)}
                trigger={
                  <button type="button" title="Emoji" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-white/5 hover:text-primary">
                    <Smile className="h-4 w-4" />
                  </button>
                }
              />
              <Popover>
                <PopoverTrigger asChild>
                  <button type="button" title="Markdown cheatsheet" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-white/5 hover:text-primary">
                    <HelpCircle className="h-4 w-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="glass w-[min(92vw,460px)] rounded-2xl border-white/10 p-4">
                  <div className="mb-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">cheatsheet</div>
                  <ul className="space-y-2">
                    {CHEATSHEET.map(([code, what]) => (
                      <li key={code} className="grid grid-cols-[1fr_1fr] gap-3 text-xs">
                        <code className="break-all font-mono text-accent">{code}</code>
                        <span className="text-muted-foreground">{what}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 border-t border-white/5 pt-3 text-xs text-muted-foreground">
                    Drag &amp; drop or paste images anywhere in the editor. Drop a <span className="text-foreground">.md</span> file to import it. ⌘↵ opens publish.
                  </p>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex shrink-0 rounded-full border border-white/10 p-0.5">
              {(
                [
                  ["write", PenLine],
                  ["split", Columns2],
                  ["preview", Eye],
                ] as const
              ).map(([v, Icon]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  title={v}
                  className={cn(
                    "flex h-7 w-8 items-center justify-center rounded-full transition",
                    v === "split" && "hidden lg:flex",
                    view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* panes */}
          <div className={cn("grid min-h-[70vh] flex-1 lg:min-h-0", view === "split" && "lg:grid-cols-2")}>
            {view !== "preview" && (
              <div
                className="relative min-h-0"
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragging(false);
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length) addFiles(files);
                }}
              >
                <textarea
                  ref={ta}
                  data-lenis-prevent
                  value={body}
                  onChange={(e) => update({ body: e.target.value })}
                  onKeyDown={onKeyDown}
                  onPaste={onPaste}
                  onScroll={syncScroll}
                  spellCheck
                  placeholder={
                    "Start writing… ✍️\n\nMarkdown works: **bold**, ## headings, - lists, ```code```.\nDrop or paste images, add GIFs & stickers from the toolbar.\n\n> [!TIL]\n> Callouts like this make concepts pop."
                  }
                  className="h-full min-h-[70vh] w-full resize-none bg-transparent px-4 py-6 font-mono text-[14.5px] leading-[1.8] text-foreground/90 outline-none placeholder:text-muted-foreground/40 md:px-8 lg:min-h-0"
                />
                {dragging && (
                  <div className="pointer-events-none absolute inset-3 flex items-center justify-center rounded-2xl border-2 border-dashed border-primary bg-primary/5 font-mono text-sm text-primary">
                    drop images, GIFs, videos or a .md file
                  </div>
                )}
              </div>
            )}
            {view !== "write" && (
              <div ref={previewRef} data-lenis-prevent className={cn("min-h-0 overflow-y-auto px-4 py-6 md:px-8", view === "split" && "border-l border-white/5")}>
                <div className="mx-auto max-w-3xl">
                  {view === "preview" && meta.title && (
                    <h1 className="mb-8 font-display text-4xl font-bold tracking-tight md:text-5xl">
                      {meta.mood && <span className="mr-3">{meta.mood}</span>}
                      {meta.title}
                    </h1>
                  )}
                  {body.trim() ? (
                    <Markdown source={body} resolve={resolve} />
                  ) : (
                    <p className="pt-20 text-center font-mono text-sm text-muted-foreground">preview shows up here ✨</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <input
        ref={imageRef}
        type="file"
        accept="image/*,video/mp4,video/webm"
        multiple
        hidden
        onChange={(e) => {
          addFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
      <input
        ref={coverRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) setCover(f);
          e.target.value = "";
        }}
      />
      <input
        ref={importRef}
        type="file"
        accept=".md,.markdown,text/markdown,text/plain"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importMarkdown(f);
          e.target.value = "";
        }}
      />

      <PublishDialog open={publishOpen} onOpenChange={setPublishOpen} draft={{ ...draft, slug }} buildFiles={buildFiles} onPublished={onPublished} />
    </div>
  );
}
