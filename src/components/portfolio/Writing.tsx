import { Link } from "react-router-dom";
import { ArrowRight, PenLine } from "lucide-react";
import { Magnetic, Reveal, SectionHeading } from "@/components/fx/primitives";
import { PostCard } from "@/components/blog/PostCard";
import { posts } from "@/lib/blog/posts";

export function Writing() {
  const latest = posts.slice(0, 3);
  return (
    <section id="writing" className="relative py-28 md:py-36">
      <div className="container">
        <SectionHeading
          index="10"
          label="blog"
          title={
            <>
              Thinking <span className="text-gradient">out loud.</span>
            </>
          }
          sub="Daily notes, concepts that finally clicked, and stories from building things. Written fast, shipped often."
        />
        {latest.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {latest.map((p, i) => (
              <PostCard key={p.slug} post={p} i={i} />
            ))}
          </div>
        ) : (
          <Reveal>
            <div className="glass flex items-center gap-4 rounded-3xl p-8">
              <PenLine className="h-6 w-6 text-primary" />
              <p className="text-muted-foreground">The first post is on its way.</p>
            </div>
          </Reveal>
        )}
        <Reveal className="mt-10 flex justify-center">
          <Magnetic>
            <Link
              to="/blog"
              className="group inline-flex items-center gap-2 rounded-full border border-primary/50 px-6 py-3 font-mono text-sm text-primary transition hover:bg-primary hover:text-primary-foreground hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
            >
              read all posts <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </Magnetic>
        </Reveal>
      </div>
    </section>
  );
}
