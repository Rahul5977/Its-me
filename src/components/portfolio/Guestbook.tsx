import { BookOpenText, Github } from "lucide-react";
import { Reveal } from "@/components/fx/primitives";
import { GiscusThread } from "./Giscus";

export function Guestbook() {
  return (
    <Reveal className="mt-20">
      <div className="glass rounded-3xl p-6 md:p-10">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 font-mono text-xs text-secondary">
              <BookOpenText className="h-3.5 w-3.5" /> guestbook
            </div>
            <h3 className="font-display text-3xl font-bold md:text-4xl">
              Passing through? <span className="text-gradient">Sign the guestbook.</span>
            </h3>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Leave your name and a line: who you are, what you&apos;re building, or just a hello. Sign in with GitHub to post.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <Github className="h-3.5 w-3.5" /> powered by GitHub Discussions
          </span>
        </div>
        <GiscusThread term="Guestbook" />
      </div>
    </Reveal>
  );
}
