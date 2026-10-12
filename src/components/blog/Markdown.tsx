import { createContext, useContext, useState, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkEmoji from "remark-emoji";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import rehypeKatex from "rehype-katex";
import rehypeHighlight from "rehype-highlight";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, Copy, Flame, Info, Lightbulb, Link2, OctagonAlert, Sparkles } from "lucide-react";
import "katex/dist/katex.min.css";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { embedSrc, remarkBlog, type CalloutKind } from "./remark-blog";

const CALLOUT_STYLE: Record<CalloutKind, { icon: typeof Info; label: string; cls: string }> = {
  note: { icon: Info, label: "Note", cls: "border-primary/40 bg-primary/[0.06] [--c:var(--primary)]" },
  tip: { icon: Lightbulb, label: "Tip", cls: "border-accent/40 bg-accent/[0.06] [--c:var(--accent)]" },
  til: { icon: Sparkles, label: "Today I learned", cls: "border-secondary/40 bg-secondary/[0.07] [--c:var(--secondary)]" },
  important: { icon: Flame, label: "Important", cls: "border-secondary/40 bg-secondary/[0.06] [--c:var(--secondary)]" },
  warning: { icon: AlertTriangle, label: "Heads up", cls: "border-amber-400/40 bg-amber-400/[0.06] [--c:38_92%_55%]" },
  caution: { icon: OctagonAlert, label: "Caution", cls: "border-destructive/40 bg-destructive/[0.06] [--c:var(--destructive)]" },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function hastText(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.value;
  return (node.children ?? []).map(hastText).join("");
}

function CodeBlock({ node, children }: { node?: any; children?: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const code = node?.children?.[0];
  const cls: string[] = code?.properties?.className ?? [];
  const lang = cls.find((c) => c.startsWith("language-"))?.slice(9);
  const text = hastText(code);
  return (
    <div className="not-prose group relative my-7 overflow-hidden rounded-2xl border border-white/10 bg-[hsl(220_30%_4.5%)]">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-2">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
          {lang && <span className="ml-3 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{lang}</span>}
        </div>
        <button
          onClick={() => {
            navigator.clipboard?.writeText(text);
            setCopied(true);
            sound.play("success");
            setTimeout(() => setCopied(false), 1600);
          }}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[11px] text-muted-foreground transition hover:bg-white/5 hover:text-primary"
          aria-label="Copy code"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-accent" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      <pre data-lenis-prevent className="overflow-x-auto p-4 font-mono text-[13.5px] leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

function ZoomImage({ src, alt, title }: { src: string; alt: string; title?: string }) {
  const [open, setOpen] = useState(false);
  const isGif = /\.gif($|\?)/i.test(src) || /giphy\.com|tenor\.com/.test(src) || /^gif\b/i.test(alt);
  // Captions come from the markdown title: ![alt](src "caption")
  const caption = title;
  return (
    <span className="my-8 block">
      <span className="relative block overflow-hidden rounded-2xl border border-white/10 bg-card">
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onClick={() => setOpen(true)}
          className="mx-auto max-h-[75vh] w-auto cursor-zoom-in object-contain !my-0"
          data-cursor
        />
        {isGif && (
          <span className="absolute left-3 top-3 rounded-md bg-background/80 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider text-accent backdrop-blur">
            GIF
          </span>
        )}
      </span>
      {caption && <span className="mt-3 block text-center font-mono text-xs text-muted-foreground">{caption}</span>}
      <AnimatePresence>
        {open && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[80] flex cursor-zoom-out items-center justify-center bg-background/90 p-4 backdrop-blur-xl"
          >
            <motion.img
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              src={src}
              alt={alt}
              className="max-h-full max-w-full rounded-xl object-contain"
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}

function Heading({ level, id, children }: { level: 2 | 3 | 4; id?: string; children?: ReactNode }) {
  const Tag = `h${level}` as const;
  return (
    <Tag id={id} className="group scroll-mt-28">
      {children}
      {id && (
        <a href={`#${id}`} aria-label="Link to this section" className="ml-2 inline-block align-middle opacity-0 transition group-hover:opacity-100">
          <Link2 className="h-4 w-4 text-primary" />
        </a>
      )}
    </Tag>
  );
}

export const proseClass = cn(
  "prose prose-invert max-w-none md:prose-lg",
  "prose-headings:font-display prose-headings:font-bold prose-headings:tracking-tight",
  "prose-h2:mt-14 prose-h2:text-3xl prose-h3:text-2xl",
  "prose-p:leading-[1.85] prose-p:text-foreground/85 prose-li:text-foreground/85 prose-li:marker:text-primary",
  "prose-a:font-medium prose-a:text-primary prose-a:underline-offset-4 prose-a:decoration-primary/40 hover:prose-a:decoration-primary",
  "prose-strong:text-foreground prose-em:text-foreground/90",
  "prose-code:rounded-md prose-code:border prose-code:border-white/10 prose-code:bg-white/[0.04] prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.85em] prose-code:font-normal prose-code:text-accent prose-code:before:content-none prose-code:after:content-none",
  "prose-hr:border-white/10 prose-th:text-foreground prose-td:text-foreground/85",
  "prose-img:rounded-2xl",
  "[&_mark]:rounded [&_mark]:bg-primary/20 [&_mark]:px-1 [&_mark]:text-foreground",
  "[&_kbd]:rounded-md [&_kbd]:border [&_kbd]:border-white/15 [&_kbd]:bg-white/[0.04] [&_kbd]:px-1.5 [&_kbd]:font-mono [&_kbd]:text-[0.8em]",
);

// Media resolution goes through context so `components` stays a stable module-level object;
// rebuilding it per render would give React new component types and remount the whole article.
const ResolveCtx = createContext<(src: string) => string>((s) => s);

function MdImage({ src = "", alt = "", title }: { src?: string; alt?: string; title?: string }) {
  const url = useContext(ResolveCtx)(src);
  if (/^sticker\b/i.test(alt)) {
    return (
      <img
        src={url}
        alt={alt.replace(/^sticker:?\s*/i, "") || "sticker"}
        title={title}
        loading="lazy"
        className="sticker !my-2 mx-1 inline-block h-28 w-28 align-middle drop-shadow-[0_8px_24px_hsl(var(--primary)/0.25)] transition-transform duration-300 hover:-rotate-6 hover:scale-110 md:h-32 md:w-32"
      />
    );
  }
  return <ZoomImage src={url} alt={alt} title={title} />;
}

function MdVideo({ src, ...rest }: React.VideoHTMLAttributes<HTMLVideoElement>) {
  const resolve = useContext(ResolveCtx);
  return <video {...rest} src={src ? resolve(src) : undefined} className="my-8 w-full rounded-2xl border border-white/10" />;
}

const components: Components = {
  h2: ({ id, children }) => (
    <Heading level={2} id={id}>
      {children}
    </Heading>
  ),
  h3: ({ id, children }) => (
    <Heading level={3} id={id}>
      {children}
    </Heading>
  ),
  h4: ({ id, children }) => (
    <Heading level={4} id={id}>
      {children}
    </Heading>
  ),
  pre: ({ node, children }) => <CodeBlock node={node}>{children}</CodeBlock>,
  a: ({ href = "", children, node: _n, ...rest }) => {
    const external = /^https?:\/\//.test(href);
    return (
      <a href={href} {...rest} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>
        {children}
      </a>
    );
  },
  img: ({ src, alt, title }) => <MdImage src={src} alt={alt} title={title} />,
  video: ({ node: _n, ...rest }) => <MdVideo {...rest} />,
  table: ({ children }) => (
    <div data-lenis-prevent className="not-prose my-8 overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-left text-sm [&_td]:border-t [&_td]:border-white/5 [&_td]:px-4 [&_td]:py-3 [&_th]:bg-white/[0.03] [&_th]:px-4 [&_th]:py-3 [&_th]:font-mono [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-muted-foreground">
        {children}
      </table>
    </div>
  ),
  blockquote: ({ node, children, ...rest }) => {
    const kind = (node?.properties?.dataCallout as CalloutKind | undefined) ?? (rest as any)["data-callout"];
    if (kind && CALLOUT_STYLE[kind]) {
      const s = CALLOUT_STYLE[kind];
      const Icon = s.icon;
      const title = (node?.properties?.dataTitle as string) || (rest as any)["data-title"] || s.label;
      return (
        <aside className={cn("not-prose my-8 rounded-2xl border p-5 [&_p]:my-2 [&_p]:leading-relaxed [&_p]:text-foreground/85", s.cls)}>
          <div className="mb-1 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--c))]">
            <Icon className="h-4 w-4" /> {title}
          </div>
          <div className="[&_a]:text-primary [&_a]:underline [&_code]:font-mono [&_code]:text-accent">{children}</div>
        </aside>
      );
    }
    return (
      <blockquote className="border-l-2 border-primary/60 font-display text-xl not-italic text-foreground/90 [&_p]:before:content-none [&_p]:after:content-none">
        {children}
      </blockquote>
    );
  },
  div: ({ node, children, ...rest }) => {
    const url = (node?.properties?.dataEmbed as string | undefined) ?? (rest as any)["data-embed"];
    const src = url && embedSrc(url);
    if (src) {
      return (
        <div className="not-prose my-8 aspect-video overflow-hidden rounded-2xl border border-white/10 bg-card">
          <iframe
            src={src}
            title="Embedded video"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      );
    }
    return <div {...rest}>{children}</div>;
  },
};

export function Markdown({ source, resolve, className }: { source: string; resolve: (src: string) => string; className?: string }) {
  return (
    <ResolveCtx.Provider value={resolve}>
      <div className={cn(proseClass, className)}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath, [remarkEmoji, { accessible: true }], remarkBlog]}
          rehypePlugins={[rehypeRaw, rehypeSlug, rehypeKatex, [rehypeHighlight, { detect: true }]]}
          components={components}
        >
          {source}
        </ReactMarkdown>
      </div>
    </ResolveCtx.Provider>
  );
}
