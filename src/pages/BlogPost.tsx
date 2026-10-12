import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Link2, Linkedin, MessageCircle, Twitter } from "lucide-react";
import { scrollToId, scrollToTop } from "@/components/fx/primitives";
import { BlogShell, usePageTitle } from "@/components/blog/BlogShell";
import { Markdown } from "@/components/blog/Markdown";
import { PostCover, PostMetaLine, Tag } from "@/components/blog/PostCard";
import { GiscusThread } from "@/components/portfolio/Giscus";
import { getPost, loadPostBody, posts, resolveMedia } from "@/lib/blog/posts";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

/** Build the table of contents from the rendered article and track which heading is in view. */
function useToc(ref: React.RefObject<HTMLElement>, ready: boolean) {
  const [items, setItems] = useState<TocItem[]>([]);
  const [active, setActive] = useState("");
  useEffect(() => {
    const root = ref.current;
    if (!root || !ready) return;
    const hs = Array.from(root.querySelectorAll<HTMLElement>("h2[id], h3[id]"));
    setItems(hs.map((h) => ({ id: h.id, text: h.textContent ?? "", level: Number(h.tagName[1]) })));
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-15% 0px -70% 0px" },
    );
    hs.forEach((h) => io.observe(h));
    return () => io.disconnect();
  }, [ref, ready]);
  return { items, active };
}

function Share({ title }: { title: string }) {
  const url = window.location.href;
  const btn = "flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-muted-foreground transition hover:border-primary hover:text-primary";
  return (
    <div className="flex items-center gap-2">
      <button
        className={btn}
        aria-label="Copy link"
        onClick={() => {
          navigator.clipboard?.writeText(url);
          toast.success("Link copied");
          sound.play("success");
        }}
      >
        <Link2 className="h-4 w-4" />
      </button>
      <a className={btn} aria-label="Share on X" target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`}>
        <Twitter className="h-4 w-4" />
      </a>
      <a className={btn} aria-label="Share on LinkedIn" target="_blank" rel="noreferrer" href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}>
        <Linkedin className="h-4 w-4" />
      </a>
    </div>
  );
}

export default function BlogPost() {
  const { slug = "" } = useParams();
  const post = getPost(slug);
  const [body, setBody] = useState<string | null>(null);
  const articleRef = useRef<HTMLElement>(null);
  const toc = useToc(articleRef, body !== null);
  usePageTitle(post ? `${post.title} · Rahul Raj` : "Post not found · Rahul Raj");

  useEffect(() => {
    setBody(null);
    scrollToTop();
    loadPostBody(slug).then(setBody);
  }, [slug]);

  if (!post) {
    return (
      <BlogShell>
        <div className="container py-20 text-center font-mono">
          <div className="text-7xl">🫥</div>
          <h1 className="mt-6 font-display text-4xl font-bold">This post wandered off.</h1>
          <p className="mt-3 text-muted-foreground">
            <span className="text-destructive">404:</span> no post at <span className="text-foreground">/blog/{slug}</span>
          </p>
          <Link to="/blog" className="mt-8 inline-block rounded-full border border-primary/50 px-6 py-2.5 text-sm text-primary transition hover:bg-primary hover:text-primary-foreground">
            cd ~/blog
          </Link>
        </div>
      </BlogShell>
    );
  }

  const idx = posts.findIndex((p) => p.slug === slug);
  const newer = posts[idx - 1];
  const older = posts[idx + 1];

  return (
    <BlogShell>
      <article className="container">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="mx-auto max-w-3xl">
          <Link to="/blog" className="group mb-8 inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition hover:text-primary">
            <ArrowLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-1" /> all posts
          </Link>
          <div className="mb-5 flex flex-wrap gap-1.5">
            {post.tags.map((t) => (
              <Link key={t} to={`/blog?tag=${encodeURIComponent(t)}`}>
                <Tag tag={t} />
              </Link>
            ))}
          </div>
          <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
            {post.mood && <span className="mr-3 inline-block animate-float">{post.mood}</span>}
            {post.title}
          </h1>
          {post.summary && <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">{post.summary}</p>}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-white/5 py-4">
            <PostMetaLine post={post} />
            <Share title={post.title} />
          </div>
        </motion.div>

        {post.cover && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto mt-10 max-w-5xl"
          >
            <PostCover post={post} className="aspect-[21/9] rounded-3xl border border-white/10" />
          </motion.div>
        )}

        <div className="mx-auto mt-12 grid max-w-6xl gap-12 lg:grid-cols-[1fr_220px]">
          <div className="mx-auto w-full max-w-3xl min-w-0">
            {body === null ? (
              <div className="space-y-4">
                {[90, 75, 95, 60, 85].map((w, i) => (
                  <div key={i} className="h-4 animate-pulse rounded bg-white/5" style={{ width: `${w}%` }} />
                ))}
              </div>
            ) : (
              <section ref={articleRef}>
                <Markdown source={body} resolve={(src) => resolveMedia(slug, src)} />
              </section>
            )}
          </div>

          {toc.items.length > 1 && (
            <aside className="hidden lg:block">
              <div className="sticky top-32">
                <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">on this page</div>
                <ul className="space-y-1 border-l border-white/10">
                  {toc.items.map((t) => (
                    <li key={t.id}>
                      <a
                        href={`#${t.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToId(t.id);
                        }}
                        className={cn(
                          "-ml-px block border-l py-1 text-sm transition",
                          t.level === 3 ? "pl-6" : "pl-4",
                          toc.active === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {t.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          )}
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <div className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:flex-row">
            <p className="font-display text-lg font-semibold">Enjoyed this? Pass it on. 🚀</p>
            <Share title={post.title} />
          </div>

          {(newer || older) && (
            <nav className="mt-10 grid gap-4 sm:grid-cols-2">
              {older ? (
                <Link to={`/blog/${older.slug}`} className="glass group rounded-2xl p-5 transition hover:border-primary/40">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    <ArrowLeft className="h-3 w-3 transition group-hover:-translate-x-1" /> older
                  </span>
                  <span className="mt-2 block font-display font-semibold transition group-hover:text-primary">
                    {older.mood} {older.title}
                  </span>
                </Link>
              ) : (
                <span />
              )}
              {newer && (
                <Link to={`/blog/${newer.slug}`} className="glass group rounded-2xl p-5 text-right transition hover:border-primary/40">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    newer <ArrowRight className="h-3 w-3 transition group-hover:translate-x-1" />
                  </span>
                  <span className="mt-2 block font-display font-semibold transition group-hover:text-primary">
                    {newer.mood} {newer.title}
                  </span>
                </Link>
              )}
            </nav>
          )}

          <section className="glass mt-12 rounded-3xl p-6 md:p-8">
            <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold">
              <MessageCircle className="h-5 w-5 text-primary" /> Thoughts &amp; reactions
            </h2>
            <GiscusThread term={`blog/${slug}`} />
          </section>
        </div>
      </article>
    </BlogShell>
  );
}
