import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Rss, Search, X } from "lucide-react";
import { Reveal, ScrambleText } from "@/components/fx/primitives";
import { BlogShell, usePageTitle } from "@/components/blog/BlogShell";
import { PostCard, PostMetaLine, Tag } from "@/components/blog/PostCard";
import { allTags, formatDate, posts } from "@/lib/blog/posts";
import { sound } from "@/lib/sound";
import { asset } from "@/lib/utils";

const GRID_COUNT = 6;

export default function Blog() {
  usePageTitle("Blog · Rahul Raj");
  const [params, setParams] = useSearchParams();
  const tag = params.get("tag");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" focuses search, like on GitHub.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target as HTMLElement).closest("input, textarea")) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const setTag = (t: string | null) => {
    sound.play("toggle");
    const next = new URLSearchParams(params);
    if (t && t !== tag) next.set("tag", t);
    else next.delete("tag");
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter(
      (p) =>
        (!tag || p.tags.includes(tag)) &&
        (!q || p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q) || p.tags.some((t) => t.includes(q))),
    );
  }, [query, tag]);

  const filtering = !!tag || !!query.trim();
  const [featured, ...rest] = filtered;
  const grid = filtering ? rest : rest.slice(0, GRID_COUNT);
  const archive = filtering ? [] : rest.slice(GRID_COUNT);
  const byYear = archive.reduce<Record<string, typeof archive>>((acc, p) => {
    (acc[p.date.slice(0, 4)] ??= []).push(p);
    return acc;
  }, {});

  return (
    <BlogShell>
      <section className="container">
        <Reveal>
          <div className="mb-4 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.3em] text-primary">
            <span className="text-muted-foreground">~/</span>
            <span className="h-px w-10 bg-gradient-to-r from-primary to-transparent" />
            <ScrambleText text="blog" trigger="mount" />
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="max-w-4xl font-display text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl">
            Notes from the <span className="text-gradient">build log.</span>
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            Days, debugging sessions, concepts that finally clicked, and whatever else feels worth writing down. Unpolished on purpose,
            honest by default.
          </p>
        </Reveal>

        <Reveal delay={0.22}>
          <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <label className="group relative flex w-full max-w-md items-center">
              <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground transition group-focus-within:text-primary" />
              <input
                ref={searchRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  sound.play("key");
                }}
                placeholder="Search posts…"
                className="w-full rounded-full border border-white/10 bg-background/60 py-3 pl-11 pr-12 text-sm outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]"
              />
              {query ? (
                <button onClick={() => setQuery("")} className="absolute right-4 text-muted-foreground hover:text-foreground" aria-label="Clear search">
                  <X className="h-4 w-4" />
                </button>
              ) : (
                <kbd className="absolute right-4 rounded border border-border px-1.5 font-mono text-[10px] text-muted-foreground">/</kbd>
              )}
            </label>
            <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
              <span>
                <span className="text-foreground">{posts.length}</span> posts · <span className="text-foreground">{allTags.length}</span> topics
              </span>
              <a href={asset("feed.xml")} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 transition hover:text-primary">
                <Rss className="h-3.5 w-3.5" /> rss
              </a>
            </div>
          </div>
          {allTags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => setTag(null)}
                className={`rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition ${!tag ? "border-primary bg-primary text-primary-foreground" : "border-white/10 text-muted-foreground hover:text-primary"}`}
              >
                all
              </button>
              {allTags.map((t) => (
                <Tag key={t} tag={t} active={t === tag} onClick={() => setTag(t)} />
              ))}
            </div>
          )}
        </Reveal>
      </section>

      <section className="container mt-14">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass rounded-3xl px-6 py-20 text-center"
            >
              <div className="text-6xl">{posts.length ? "🔍" : "🌱"}</div>
              <p className="mt-4 font-display text-2xl font-bold">{posts.length ? "Nothing matches that." : "First post is brewing."}</p>
              <p className="mt-2 font-mono text-sm text-muted-foreground">
                {posts.length ? "try another word or clear the filter" : "check back soon ☕"}
              </p>
            </motion.div>
          ) : (
            <motion.div key={`${tag}-${filtering}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
              {featured && <PostCard post={featured} featured />}
              {grid.length > 0 && (
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {grid.map((p, i) => (
                    <PostCard key={p.slug} post={p} i={i} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {archive.length > 0 && (
        <section className="container mt-24">
          <Reveal>
            <h2 className="mb-8 font-display text-3xl font-bold tracking-tight">
              The <span className="text-gradient">archive</span>
            </h2>
          </Reveal>
          {Object.entries(byYear)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([year, list]) => (
              <div key={year} className="mb-10 grid gap-4 md:grid-cols-[120px_1fr]">
                <div className="font-display text-4xl font-bold text-transparent [-webkit-text-stroke:1px_hsl(var(--muted-foreground)/0.6)]">{year}</div>
                <ul className="divide-y divide-white/5 border-y border-white/5">
                  {list.map((p) => (
                    <li key={p.slug}>
                      <Link to={`/blog/${p.slug}`} className="group flex items-center gap-4 py-4">
                        <span className="w-16 shrink-0 font-mono text-xs text-muted-foreground">{formatDate(p.date, "short")}</span>
                        <span className="text-xl">{p.mood || "✍️"}</span>
                        <span className="flex-1 font-medium transition group-hover:text-primary">{p.title}</span>
                        <PostMetaLine post={p} className="hidden md:flex [&>time]:hidden [&>span:first-of-type]:hidden" />
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:rotate-45 group-hover:text-primary" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </section>
      )}
    </BlogShell>
  );
}
