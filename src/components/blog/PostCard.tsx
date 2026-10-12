import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";
import { useSpotlight } from "@/components/fx/primitives";
import { formatDate, resolveMedia, type PostSummary } from "@/lib/blog/posts";
import { cn } from "@/lib/utils";

// Deterministic per-post hue, so posts without a cover still get a distinct, on-brand tile.
function hueOf(slug: string) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) % 360;
  return [188, 258, 84, 320, 28, 210][h % 6];
}

export function PostCover({ post, className, big = false }: { post: PostSummary; className?: string; big?: boolean }) {
  if (post.cover) {
    return (
      <div className={cn("overflow-hidden bg-card", className)}>
        <img
          src={resolveMedia(post.slug, post.cover)}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
      </div>
    );
  }
  const hue = hueOf(post.slug);
  return (
    <div
      className={cn("relative flex items-center justify-center overflow-hidden", className)}
      style={{
        background: `radial-gradient(120% 120% at 0% 0%, hsl(${hue} 85% 55% / 0.35), transparent 60%), radial-gradient(100% 100% at 100% 100%, hsl(${(hue + 70) % 360} 85% 60% / 0.28), transparent 55%), hsl(220 25% 6%)`,
      }}
    >
      <div className="grid-bg absolute inset-0 opacity-70" />
      <span className={cn("relative transition duration-500 group-hover:-rotate-6 group-hover:scale-110", big ? "text-8xl" : "text-6xl")}>
        {post.mood || "✍️"}
      </span>
    </div>
  );
}

export function PostMetaLine({ post, className }: { post: PostSummary; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground", className)}>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
      <span className="inline-flex items-center gap-1">
        <Clock className="h-3 w-3" /> {post.readingMinutes} min read
      </span>
      {post.draft && <span className="rounded bg-amber-400/15 px-1.5 py-0.5 text-amber-300">draft</span>}
    </div>
  );
}

export function Tag({ tag, active, onClick }: { tag: string; active?: boolean; onClick?: () => void }) {
  const cls = cn(
    "rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition",
    active ? "border-primary bg-primary text-primary-foreground" : "border-white/10 bg-white/[0.03] text-muted-foreground hover:border-primary/50 hover:text-primary",
  );
  return onClick ? (
    <button onClick={onClick} className={cls}>
      #{tag}
    </button>
  ) : (
    <span className={cls}>#{tag}</span>
  );
}

export function PostCard({ post, i = 0, featured = false }: { post: PostSummary; i?: number; featured?: boolean }) {
  const spot = useSpotlight<HTMLAnchorElement>();
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: (i % 3) * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        to={`/blog/${post.slug}`}
        ref={spot.ref}
        onMouseMove={spot.onMouseMove}
        className={cn(
          "spotlight glass group flex h-full overflow-hidden rounded-3xl transition-colors hover:border-primary/40",
          featured ? "flex-col md:flex-row" : "flex-col",
        )}
      >
        <PostCover post={post} big={featured} className={featured ? "aspect-[16/10] md:aspect-auto md:w-[55%]" : "aspect-[16/9]"} />
        <div className={cn("flex flex-1 flex-col", featured ? "p-7 md:p-10" : "p-6")}>
          {featured && (
            <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[11px] text-accent">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> latest post
            </span>
          )}
          <PostMetaLine post={post} />
          <h3 className={cn("mt-3 font-display font-bold leading-tight tracking-tight transition group-hover:text-primary", featured ? "text-3xl md:text-4xl" : "text-xl")}>
            {post.title}
          </h3>
          <p className={cn("mt-3 flex-1 text-muted-foreground", featured ? "text-base leading-relaxed" : "line-clamp-3 text-sm leading-relaxed")}>{post.summary}</p>
          <div className="mt-5 flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 3).map((t) => (
                <Tag key={t} tag={t} />
              ))}
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 transition group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
              <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
