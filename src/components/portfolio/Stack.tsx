import { motion } from "framer-motion";
import { Bot, Boxes, Cloud, Code2, Database, Layout } from "lucide-react";
import { Marquee } from "@/components/fx/ambient";
import { SectionHeading, useSpotlight } from "@/components/fx/primitives";
import { marqueeTech, skillGroups } from "@/data/portfolio";

const ICONS = [Code2, Layout, Boxes, Database, Bot, Cloud];
const SPANS = ["", "", "lg:col-span-2", "lg:col-span-2", "lg:col-span-2", "sm:col-span-2 lg:col-span-4"];

function SkillCard({ g, i }: { g: (typeof skillGroups)[number]; i: number }) {
  const spot = useSpotlight<HTMLDivElement>();
  const Icon = ICONS[i];
  return (
    <motion.div
      ref={spot.ref}
      onMouseMove={spot.onMouseMove}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`spotlight glass group rounded-2xl p-6 ${SPANS[i]}`}
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 text-primary transition group-hover:rotate-6 group-hover:scale-110">
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground">{String(g.items.length).padStart(2, "0")} items</span>
      </div>
      <h3 className="mb-4 font-display text-lg font-semibold">{g.name}</h3>
      <div className="flex flex-wrap gap-2">
        {g.items.map((s, j) => (
          <motion.span
            key={s}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + j * 0.04 }}
            whileHover={{ y: -3 }}
            className="rounded-lg border border-white/5 bg-white/[0.03] px-2.5 py-1 font-mono text-xs text-foreground/80 transition-colors hover:border-primary/50 hover:text-primary"
          >
            {s}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

export function Stack() {
  const half = Math.ceil(marqueeTech.length / 2);
  return (
    <section id="stack" className="relative py-28 md:py-36">
      <div className="container">
        <SectionHeading
          index="07"
          label="tech.stack"
          title={
            <>
              The <span className="text-gradient">toolbox.</span>
            </>
          }
          sub="What I reach for, from the first prototype through to production."
        />
      </div>
      <div className="mb-16 space-y-4">
        <Marquee items={marqueeTech.slice(0, half)} duration={38} />
        <Marquee items={marqueeTech.slice(half)} duration={44} reverse />
      </div>
      <div className="container grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {skillGroups.map((g, i) => (
          <SkillCard key={g.name} g={g} i={i} />
        ))}
      </div>
    </section>
  );
}
