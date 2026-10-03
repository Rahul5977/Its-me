import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Small looping "screenshots" rendered in code, one per featured project. */

function useStep(n: number, ms: number) {
  const [s, setS] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setS((x) => (x + 1) % n), ms);
    return () => clearInterval(iv);
  }, [n, ms]);
  return s;
}

function Frame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-[260px] flex-col overflow-hidden rounded-xl border border-white/5 bg-background/70">
      <div className="flex items-center gap-1.5 border-b border-white/5 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="h-2 w-2 rounded-full bg-white/15" />
        <span className="ml-2 font-mono text-[10px] text-muted-foreground">{title}</span>
      </div>
      <div className="relative flex-1 p-4 font-mono text-[11px] leading-6">{children}</div>
    </div>
  );
}

function MiniClawVisual() {
  const lines = [
    { t: "you › summarise notes.txt into summary.md", c: "text-foreground" },
    { t: "  ⚙ read notes.txt [low]  ✔", c: "text-muted-foreground" },
    { t: "  ⚙ write summary.md [medium]", c: "text-amber-300" },
    { t: "    +- MiniClaw is a local AI agent.", c: "text-accent" },
    { t: "    +- It can undo changes.", c: "text-accent" },
    { t: "  Allow? [yes / no / always] y", c: "text-primary" },
    { t: "  ✔ done · changed +summary.md", c: "text-accent" },
    { t: "you › /undo", c: "text-foreground" },
    { t: "  ↺ reverted summary.md", c: "text-secondary" },
  ];
  const s = useStep(lines.length + 3, 650);
  return (
    <Frame title="miniclaw — bun run chat">
      {lines.slice(0, Math.min(s + 1, lines.length)).map((l, i) => (
        <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className={`whitespace-pre ${l.c}`}>
          {l.t}
        </motion.div>
      ))}
    </Frame>
  );
}

function CodeArenaVisual() {
  const s = useStep(4, 1400);
  const rows = [
    { n: "rahul", p: 400, t: "01:12" },
    { n: "nullptr", p: 300, t: "00:58" },
    { n: "segfault", p: 300, t: "01:31" },
    { n: "dev_42", p: 200, t: "00:44" },
  ];
  const order = s % 2 === 0 ? [0, 1, 2, 3] : [1, 0, 2, 3];
  return (
    <Frame title="codearena.kodexa.in/contest/42">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-muted-foreground">two-sum.cpp</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={s}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`rounded px-2 ${s === 1 ? "bg-amber-400/15 text-amber-300" : "bg-accent/15 text-accent"}`}
          >
            {s === 1 ? "● Running 12/15" : "✔ Accepted · 4ms"}
          </motion.span>
        </AnimatePresence>
      </div>
      <div className="space-y-1.5">
        {order.map((idx, rank) => (
          <motion.div layout key={rows[idx].n} className="flex items-center justify-between rounded-md bg-white/[0.03] px-3 py-1.5">
            <span>
              <span className="mr-3 text-muted-foreground">#{rank + 1}</span>
              <span className={idx === 0 ? "text-primary" : ""}>{rows[idx].n}</span>
            </span>
            <span className="text-muted-foreground">
              {rows[idx].p} · {rows[idx].t}
            </span>
          </motion.div>
        ))}
      </div>
      <div className="mt-3 text-[10px] text-muted-foreground">⚡ live via socket.io</div>
    </Frame>
  );
}

function PptVisual() {
  const stages = ["outline", "content", "images", "layout", "finalize"];
  const s = useStep(stages.length + 1, 900);
  return (
    <Frame title="kodexa — generating deck">
      <div className="mb-3 text-muted-foreground">
        prompt › <span className="text-foreground">"The future of agentic AI"</span>
      </div>
      <div className="mb-4 flex gap-1.5">
        {stages.map((st, i) => (
          <div key={st} className="flex-1">
            <div className="h-1 overflow-hidden rounded bg-white/10">
              <motion.div className="h-full bg-secondary" animate={{ width: i < s ? "100%" : "0%" }} transition={{ duration: 0.6 }} />
            </div>
            <div className={`mt-1 text-[9px] ${i < s ? "text-secondary" : "text-muted-foreground/50"}`}>{st}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: i < s + 1 ? 1 : 0.15, y: i < s + 1 ? 0 : 6 }}
            className="aspect-video rounded-md border border-white/10 bg-gradient-to-br from-secondary/25 to-primary/10 p-1.5"
          >
            <div className="h-1 w-2/3 rounded bg-white/40" />
            <div className="mt-1 h-0.5 w-1/2 rounded bg-white/20" />
          </motion.div>
        ))}
      </div>
    </Frame>
  );
}

function CounselorVisual() {
  const s = useStep(3, 1600);
  const ranks = ["4,820", "12,400", "28,950"];
  const data = [
    [
      ["IIT Bhilai · CSE", "Target", 62],
      ["NIT Trichy · CSE", "Safe", 91],
      ["IIT Delhi · EE", "Reach", 18],
    ],
    [
      ["NIT Warangal · ECE", "Target", 58],
      ["IIIT Hyderabad · CSE", "Reach", 12],
      ["NIT Raipur · CSE", "Safe", 88],
    ],
    [
      ["NIT Surat · ME", "Safe", 84],
      ["IIIT Lucknow · IT", "Target", 55],
      ["NIT Calicut · CSE", "Reach", 21],
    ],
  ] as const;
  const color = { Safe: "bg-accent text-accent", Target: "bg-primary text-primary", Reach: "bg-secondary text-secondary" };
  return (
    <Frame title="counsellor.kodexa.in/predict">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-muted-foreground">rank ›</span>
        <AnimatePresence mode="wait">
          <motion.span key={s} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="text-foreground">
            {ranks[s]}
          </motion.span>
        </AnimatePresence>
        <span className="ml-auto text-[10px] text-muted-foreground">p95 &lt; 50ms</span>
      </div>
      <div className="space-y-2.5">
        {data[s].map(([name, b, pct]) => (
          <div key={name}>
            <div className="mb-1 flex justify-between">
              <span>{name}</span>
              <span className={color[b].split(" ")[1]}>{b}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded bg-white/10">
              <motion.div
                key={`${s}-${name}`}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                className={`h-full ${color[b].split(" ")[0]}`}
              />
            </div>
          </div>
        ))}
      </div>
    </Frame>
  );
}

export const PROJECT_VISUALS: Record<string, () => JSX.Element> = {
  miniclaw: MiniClawVisual,
  codearena: CodeArenaVisual,
  "ai-ppt": PptVisual,
  "student-counselor": CounselorVisual,
};
