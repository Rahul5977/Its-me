import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Reveal, SectionHeading, scrollToId } from "@/components/fx/primitives";
import { experience, featuredProjects, forTheStudents, interIIT, internship, moreProjects, nowBuilding, profile, skillGroups } from "@/data/portfolio";
import { sound } from "@/lib/sound";

type Line = { id: number; node: ReactNode };

const HELP: [string, string][] = [
  ["help", "list available commands"],
  ["whoami", "who is this guy?"],
  ["projects", "featured projects"],
  ["ls", "every project"],
  ["now", "what I'm building right now"],
  ["skills", "tech stack"],
  ["experience", "where I've worked"],
  ["internship", "what I engineered at SuperLiving"],
  ["interiit", "Inter IIT Tech Meet 14.0"],
  ["vision", "why I'm building ForTheStudents"],
  ["socials", "find me online"],
  ["contact", "jump to the mail form"],
  ["guestbook", "sign my guestbook"],
  ["sudo hire-rahul", "you know you want to"],
  ["clear", "clear the screen"],
];

const A = ({ href, children }: { href: string; children: ReactNode }) => (
  <a href={href} target="_blank" rel="noreferrer" className="text-primary underline-offset-2 hover:underline">
    {children}
  </a>
);

export function Terminal() {
  const [lines, setLines] = useState<Line[]>(() => [
    { id: -2, node: <span className="text-muted-foreground">rahul-os v2026.10 · tty1</span> },
    {
      id: -1,
      node: (
        <span>
          Type <span className="text-accent">help</span> to get started. Use ↑/↓ for history and Tab to autocomplete.
        </span>
      ),
    },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const idRef = useRef(0);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const push = (...nodes: ReactNode[]) => setLines((l) => [...l, ...nodes.map((node) => ({ id: idRef.current++, node }))]);


  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [lines]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    push(
      <span>
        <span className="text-accent">rahul@iitbhilai</span>
        <span className="text-muted-foreground">:</span>
        <span className="text-primary">~</span>
        <span className="text-muted-foreground">$</span> {raw}
      </span>,
    );
    if (!cmd) return;
    setHistory((h) => [raw, ...h]);
    setHIdx(-1);

    switch (cmd) {
      case "help":
        push(
          ...HELP.map(([c, d]) => (
            <span>
              <span className="inline-block w-40 text-accent">{c}</span>
              <span className="text-muted-foreground">{d}</span>
            </span>
          )),
        );
        break;
      case "whoami":
        push(
          <span className="text-foreground">
            {profile.name}: {profile.role}
          </span>,
          <span className="text-muted-foreground">{profile.degree} @ {profile.institute}</span>,
          <span className="text-muted-foreground">ex-AI Intern @ SuperLiving (Summer 2026) · Inter IIT 14.0 · Maintainer @ OpenLake</span>,
          <span className="text-muted-foreground">philosophy: &quot;{profile.philosophy}&quot;</span>,
        );
        break;
      case "projects":
        push(
          ...featuredProjects.map((p) => (
            <span>
              <span className="text-primary">▸ {p.name}</span> <span className="text-muted-foreground">({p.status}) · {p.kicker}</span>{" "}
              {(p.links.live || p.links.github) && <A href={(p.links.live ?? p.links.github)!}>↗</A>}
            </span>
          )),
        );
        break;
      case "ls":
      case "ls -la":
        push(
          <span className="flex flex-wrap gap-x-6 gap-y-1">
            {[...featuredProjects, ...moreProjects].map((p) => (
              <span key={p.id} className={p.status === "Live" ? "text-accent" : "text-primary"}>
                {p.id}/
              </span>
            ))}
          </span>,
        );
        break;
      case "now":
        push(
          <span>
            <span className="text-amber-300">● building {nowBuilding.name}</span>: {nowBuilding.kicker}
          </span>,
          <span className="text-muted-foreground">{nowBuilding.pipeline.join("  →  ")}</span>,
          <span className="text-muted-foreground">also: MiniClaw v1.0.0 shipped (taint tracking, flight recorder, 97% coverage)</span>,
        );
        break;
      case "skills":
        push(
          ...skillGroups.map((g) => (
            <span>
              <span className="inline-block w-32 text-secondary">{g.name}</span>
              <span className="text-muted-foreground">{g.items.join(" · ")}</span>
            </span>
          )),
        );
        break;
      case "experience":
        push(
          ...experience.map((e) => (
            <span>
              <span className="inline-block w-28 text-primary">{e.period}</span>
              {e.role} <span className="text-muted-foreground">@ {e.org}</span>
            </span>
          )),
        );
        break;
      case "internship":
        push(
          <span>
            <span className="text-primary">{internship.role} @ {internship.org}</span> <span className="text-muted-foreground">({internship.year})</span>
          </span>,
          <span className="text-muted-foreground">{internship.pipeline.map((s) => s.name.toLowerCase()).join("  →  ")}</span>,
          ...internship.decisions.map((d) => (
            <span>
              <span className="text-accent">✔</span> {d.title} <span className="text-muted-foreground">· {d.tag}</span>
            </span>
          )),
        );
        break;
      case "interiit":
        push(
          <span className="text-primary">{interIIT.title} · {interIIT.period}</span>,
          <span>
            <span className="text-accent">{interIIT.hp3.code}</span> {interIIT.hp3.name}: {interIIT.hp3.title}{" "}
            <span className="text-muted-foreground">({interIIT.hp3.metrics.map((m) => `${m.value} ${m.label}`).join(" · ")})</span>
          </span>,
          <span>
            <span className="text-accent">{interIIT.np2.code}</span> {interIIT.np2.name}: {interIIT.np2.title}
          </span>,
        );
        break;
      case "vision":
        push(
          <span className="text-accent">&quot;{forTheStudents.mission}&quot;</span>,
          <span className="text-muted-foreground">{forTheStudents.pillars.map((p) => p.name).join("  →  ")}</span>,
          <span>
            try it → <A href={forTheStudents.live}>{forTheStudents.live}</A>
          </span>,
        );
        break;
      case "socials":
        push(
          <span>
            github → <A href={profile.socials.github}>{profile.socials.github}</A>
          </span>,
          <span>
            linkedin → <A href={profile.socials.linkedin}>{profile.socials.linkedin}</A>
          </span>,
          <span>
            leetcode → <A href={profile.socials.leetcode}>{profile.socials.leetcode}</A>
          </span>,
          <span>
            blog → <A href={profile.socials.hashnode}>{profile.socials.hashnode}</A>
          </span>,
        );
        break;
      case "guestbook":
        push(<span className="text-accent">opening the guestbook… ✍</span>);
        setTimeout(() => document.querySelector(".giscus")?.scrollIntoView({ behavior: "smooth", block: "center" }), 400);
        break;
      case "contact":
      case "mail":
        push(<span className="text-accent">opening secure channel… ✉</span>);
        setTimeout(() => scrollToId("contact"), 400);
        break;
      case "sudo hire-rahul":
      case "sudo hire rahul":
        sound.play("success");
        push(
          <span className="text-accent">[sudo] password for recruiter: ••••••••</span>,
          <span className="text-accent">✔ access granted. Excellent decision.</span>,
          <span>
            Drop a line at <A href={`mailto:${profile.email}`}>{profile.email}</A> and let&apos;s build something.
          </span>,
        );
        break;
      case "hire-rahul":
        sound.play("error");
        push(<span className="text-destructive">permission denied: try `sudo hire-rahul` 😉</span>);
        break;
      case "rm -rf /":
      case "sudo rm -rf /":
        sound.play("error");
        push(<span className="text-destructive">nice try. this portfolio runs MiniClaw-grade approvals. ✋</span>);
        break;
      case "clear":
        setLines([]);
        break;
      default:
        sound.play("error");
        push(
          <span className="text-destructive">
            command not found: {cmd}. Type <span className="text-accent">help</span>.
          </span>,
        );
    }
  };

  const complete = () => {
    const match = HELP.map(([c]) => c).find((c) => c.startsWith(input.toLowerCase()) && input);
    if (match) setInput(match);
  };

  return (
    <section id="terminal" className="relative py-28 md:py-36">
      <div className="container">
        <SectionHeading
          index="08"
          label="interactive.shell"
          title={
            <>
              Prefer the <span className="text-gradient">command line?</span>
            </>
          }
          sub="So do I. Poke around, there are a couple of easter eggs."
        />

        <Reveal>
          <motion.div
            whileHover={{ boxShadow: "0 0 80px -20px hsl(188 86% 53% / 0.35)" }}
            className="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-[hsl(220_30%_4%)]"
            onClick={() => inputRef.current?.focus({ preventScroll: true })}
            data-cursor
          >
            <div className="flex items-center gap-2 border-b border-white/5 bg-white/[0.02] px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="mx-auto font-mono text-xs text-muted-foreground">rahul@iitbhilai: ~ (zsh)</span>
            </div>
            <div className="scanlines pointer-events-none absolute inset-0 opacity-20" />
            <div ref={bodyRef} data-lenis-prevent className="h-[420px] overflow-y-auto p-5 font-mono text-[13px] leading-6">
              {lines.map((l) => (
                <motion.div key={l.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="break-words">
                  {l.node}
                </motion.div>
              ))}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sound.play("click");
                  run(input);
                  setInput("");
                }}
                className="flex items-center"
              >
                <span className="shrink-0">
                  <span className="text-accent">rahul@iitbhilai</span>
                  <span className="text-muted-foreground">:</span>
                  <span className="text-primary">~</span>
                  <span className="text-muted-foreground">$</span>&nbsp;
                </span>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => {
                    setInput(e.target.value);
                    sound.play("key");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      const n = Math.min(hIdx + 1, history.length - 1);
                      if (history[n] !== undefined) {
                        setHIdx(n);
                        setInput(history[n]);
                      }
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      const n = hIdx - 1;
                      setHIdx(Math.max(n, -1));
                      setInput(n >= 0 ? history[n] : "");
                    } else if (e.key === "Tab") {
                      e.preventDefault();
                      complete();
                    }
                  }}
                  className="w-full bg-transparent text-foreground caret-accent outline-none"
                  aria-label="Terminal input"
                  autoComplete="off"
                  spellCheck={false}
                />
              </form>
            </div>
            <div className="flex flex-wrap gap-2 border-t border-white/5 px-4 py-3">
              {["whoami", "projects", "now", "skills", "sudo hire-rahul"].map((c) => (
                <button
                  key={c}
                  onClick={(e) => {
                    e.stopPropagation();
                    run(c);
                  }}
                  className="rounded-md border border-white/10 px-2.5 py-1 font-mono text-[11px] text-muted-foreground transition hover:border-accent hover:text-accent"
                >
                  {c}
                </button>
              ))}
            </div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
