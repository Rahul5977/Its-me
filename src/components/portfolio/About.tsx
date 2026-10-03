import { motion } from "framer-motion";
import { BarChart3, Code2, GitBranch, Medal, Target, Trophy, Users } from "lucide-react";
import { Reveal, SectionHeading, useSpotlight } from "@/components/fx/primitives";
import { achievements, profile } from "@/data/portfolio";

const ICONS = { trophy: Trophy, target: Target, chart: BarChart3, code: Code2, users: Users, git: GitBranch, medal: Medal };

type Tok = [string, string?];
const CODE: Tok[][] = [
  [["const ", "k"], ["rahul", "v"], [": ", "p"], ["Engineer", "t"], [" = {", "p"]],
  [["  name", "f"], [":       ", "p"], ['"Rahul Raj"', "s"], [",", "p"]],
  [["  institute", "f"], [":  ", "p"], ['"IIT Bhilai — B.Tech DSAI"', "s"], [",", "p"]],
  [["  role", "f"], [":       ", "p"], ['"ex-AI Intern @ SuperLiving"', "s"], [",", "p"]],
  [["  oss", "f"], [":        ", "p"], ['"Maintainer @ OpenLake"', "s"], [",", "p"]],
  [["  focus", "f"], [":      [", "p"], ['"agentic RAG"', "s"], [", ", "p"], ['"AI systems"', "s"], [", ", "p"], ['"realtime"', "s"], ["],", "p"]],
  [["  building", "f"], [":   [", "p"], ['"MiniClaw"', "s"], [", ", "p"], ['"VeriMem"', "s"], [", ", "p"], ['"AI-PPT"', "s"], ["],", "p"]],
  [["  philosophy", "f"], [": ", "p"], [`"${profile.philosophy}"`, "s"], [",", "p"]],
  [["  available", "f"], [":  ", "p"], ["true", "k"], [",", "p"]],
  [["};", "p"]],
];
const COLORS: Record<string, string> = {
  k: "text-secondary",
  v: "text-primary",
  t: "text-accent",
  f: "text-sky-300",
  s: "text-amber-300",
  p: "text-muted-foreground",
};

function CodeCard() {
  const spot = useSpotlight<HTMLDivElement>();
  return (
    <div ref={spot.ref} onMouseMove={spot.onMouseMove} className="spotlight glass overflow-hidden rounded-2xl shadow-2xl">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-3 font-mono text-xs text-muted-foreground">whoami.ts</span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">TypeScript</span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-7 md:text-sm">
        {CODE.map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.07 }}
            className="whitespace-pre"
          >
            <span className="mr-4 inline-block w-5 select-none text-right text-muted-foreground/40">{i + 1}</span>
            {line.map(([t, c], j) => (
              <span key={j} className={COLORS[c ?? "p"]}>
                {t}
              </span>
            ))}
          </motion.div>
        ))}
      </pre>
    </div>
  );
}

export function About() {
  return (
    <section id="about" className="relative py-28 md:py-36">
      <div className="container">
        <SectionHeading
          index="01"
          label="about.me"
          title={
            <>
              Engineer by training,
              <br />
              <span className="text-gradient">builder by obsession.</span>
            </>
          }
        />

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16 [&>*]:min-w-0">
          <Reveal>
            <CodeCard />
          </Reveal>

          <div className="space-y-6">
            <Reveal delay={0.1}>
              <p className="text-lg leading-relaxed text-foreground/85">{profile.bio}</p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="leading-relaxed text-muted-foreground">
                I care about the unglamorous parts: idempotent jobs, circuit breakers around LLM calls, caches that make a
                spike cheap, and approvals that keep an agent honest. I learn by shipping, and I write about what I learn on{" "}
                <a href={profile.socials.hashnode} target="_blank" rel="noreferrer" className="text-primary underline-offset-4 hover:underline">
                  Hashnode
                </a>
                .
              </p>
            </Reveal>

            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
              {achievements.map((a, i) => {
                const Icon = ICONS[a.icon];
                return (
                  <motion.div
                    key={a.title}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.07, type: "spring", stiffness: 200, damping: 20 }}
                    whileHover={{ y: -6 }}
                    className="group glass rounded-xl p-4 transition-colors hover:border-primary/40"
                  >
                    <Icon className="mb-3 h-5 w-5 text-primary transition group-hover:scale-110 group-hover:text-accent" />
                    <div className="font-display font-semibold">{a.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{a.detail}</div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
