import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type Variants } from "framer-motion";
import { ArrowDown, ArrowUpRight, Github, Linkedin, Mail, Sparkles } from "lucide-react";
import { Counter, Magnetic, ScrambleText, scrollToId } from "@/components/fx/primitives";
import { profile, stats } from "@/data/portfolio";
import { asset } from "@/lib/utils";

function useTypewriter(words: string[], start: boolean) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!start) return;
    let wi = 0,
      ci = 0,
      deleting = false,
      t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const w = words[wi];
      ci += deleting ? -1 : 1;
      setText(w.slice(0, ci));
      let delay = deleting ? 28 : 65;
      if (!deleting && ci === w.length) {
        deleting = true;
        delay = 1700;
      } else if (deleting && ci === 0) {
        deleting = false;
        wi = (wi + 1) % words.length;
        delay = 350;
      }
      t = setTimeout(tick, delay);
    };
    t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, [words, start]);
  return text;
}

const ORBIT = ["LLMs", "RAG", "Agents", "React", "Node", "AWS", "Redis", "Python"];

function Monogram() {
  return (
    <div className="relative flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary)/0.25),transparent_55%),radial-gradient(circle_at_80%_90%,hsl(var(--secondary)/0.3),transparent_55%)]">
      <div className="absolute inset-0 overflow-hidden p-3 font-mono text-[9px] leading-4 text-primary/20">
        {Array.from({ length: 24 }, (_, i) => (
          <div key={i} className="whitespace-nowrap">
            {["const agent = new MiniClaw({ sandbox: true });", "await rag.grade(evidence) // CRAG", "SELECT * FROM cutoffs WHERE rank <= $1;", "queue.add('generate-deck', { prompt });", "socket.emit('leaderboard:update', rows);", "def verify(claim): return verdict"][i % 6]}
          </div>
        ))}
      </div>
      <span className="relative font-display text-[7rem] font-bold leading-none tracking-tighter text-gradient">RR</span>
    </div>
  );
}

function HoloAvatar() {
  // Uses public/avatar.jpg when present, otherwise an animated monogram.
  const [photo, setPhoto] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(useMotionValue(0), { stiffness: 120, damping: 14 });
  const ry = useSpring(useMotionValue(0), { stiffness: 120, damping: 14 });

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[420px] [perspective:1000px]"
      onMouseMove={(e) => {
        const r = ref.current!.getBoundingClientRect();
        ry.set(((e.clientX - r.left) / r.width - 0.5) * 22);
        rx.set(-((e.clientY - r.top) / r.height - 0.5) * 22);
      }}
      onMouseLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
      data-cursor
    >
      {/* orbit rings */}
      <div className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-primary/25" />
      <div className="absolute inset-[9%] animate-spin-slower rounded-full border border-secondary/20 [animation-direction:reverse]" />
      <div className="absolute inset-0 animate-spin-slower">
        {ORBIT.map((t, i) => {
          const a = (i / ORBIT.length) * Math.PI * 2;
          return (
            <span
              key={t}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${50 + Math.cos(a) * 50}%`, top: `${50 + Math.sin(a) * 50}%` }}
            >
              <span className="glass block animate-spin-slower rounded-full px-2.5 py-1 font-mono text-[10px] text-primary [animation-direction:reverse]">{t}</span>
            </span>
          );
        })}
      </div>

      <motion.div ref={ref} style={{ rotateX: rx, rotateY: ry }} className="absolute inset-[17%] [transform-style:preserve-3d]">
        <div className="border-beam absolute inset-0 overflow-hidden rounded-[2rem] bg-card">
          {photo ? (
            <img src={asset("avatar.jpg")} alt="Rahul Raj" className="h-full w-full object-cover object-top" onError={() => setPhoto(false)} />
          ) : (
            <Monogram />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
          <div className="scanlines absolute inset-0 opacity-30 mix-blend-overlay" />
          <motion.div
            className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-primary/25 to-transparent"
            animate={{ top: ["-30%", "110%"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
          />
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
            <span>ID://RAHUL5977</span>
            <span className="text-accent">● online</span>
          </div>
        </div>
        <div className="glass absolute -right-6 top-6 rounded-xl px-3 py-2 font-mono text-[10px] shadow-xl [transform:translateZ(60px)]">
          <div className="text-muted-foreground">building</div>
          <div className="text-primary">MiniClaw 🦀</div>
        </div>
        <div className="glass absolute -left-8 bottom-10 rounded-xl px-3 py-2 font-mono text-[10px] shadow-xl [transform:translateZ(80px)]">
          <div className="text-muted-foreground">streak</div>
          <div className="text-accent">1,430 commits/yr</div>
        </div>
      </motion.div>
    </div>
  );
}

export function Hero({ booted }: { booted: boolean }) {
  const role = useTypewriter(profile.roles, booted);
  const section = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 160]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const container: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
    show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <section id="home" ref={section} className="relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28">
      <motion.div style={{ y, opacity }} className="container grid items-center gap-14 lg:grid-cols-[1.25fr_1fr] [&>*]:min-w-0">
        <motion.div variants={container} initial="hidden" animate={booted ? "show" : "hidden"}>
          <motion.div variants={item} className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-3 py-1.5 font-mono text-xs text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-accent" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            open to SDE &amp; AI engineering roles
          </motion.div>

          <motion.p variants={item} className="mb-3 font-mono text-sm text-muted-foreground">
            <span className="text-primary">~/</span> hello world, I&apos;m
          </motion.p>

          <motion.h1 variants={item} className="font-display text-[clamp(3.4rem,11vw,8.5rem)] font-bold leading-[0.88] tracking-tighter">
            <span className="glitch block" data-text="RAHUL">
              {booted ? <ScrambleText text="RAHUL" trigger="mount" delay={200} speed={40} /> : "RAHUL"}
            </span>
            <span className="glitch block text-gradient" data-text="RAJ.">
              RAJ.
            </span>
          </motion.h1>

          <motion.div variants={item} className="mt-6 h-8 font-mono text-lg text-foreground/90 md:text-xl">
            <span className="text-accent">&gt;</span> <span className="caret">{role}</span>
          </motion.div>

          <motion.p variants={item} className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {profile.tagline} B.Tech in <span className="text-foreground">Data Science &amp; AI at IIT Bhilai</span>, building agents, RAG
            pipelines and backends that hold up in production.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-wrap items-center gap-4">
            <Magnetic>
              <button
                onClick={() => scrollToId("work")}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-7 py-3.5 font-medium text-primary-foreground shadow-[0_0_40px_-8px_hsl(var(--primary))]"
              >
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <Sparkles className="h-4 w-4" /> Explore my work
              </button>
            </Magnetic>
            <Magnetic>
              <button
                onClick={() => scrollToId("contact")}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-7 py-3.5 font-medium backdrop-blur transition hover:border-primary hover:text-primary"
              >
                Let&apos;s talk <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
              </button>
            </Magnetic>
            <div className="flex items-center gap-1">
              {[
                { href: profile.socials.github, icon: Github, label: "GitHub" },
                { href: profile.socials.linkedin, icon: Linkedin, label: "LinkedIn" },
                { href: `mailto:${profile.email}`, icon: Mail, label: "Email" },
              ].map(({ href, icon: Icon, label }) => (
                <Magnetic key={label} strength={0.5}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition hover:bg-primary/10 hover:text-primary"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </Magnetic>
              ))}
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -6 }}
          animate={booted ? { opacity: 1, scale: 1, rotate: 0 } : {}}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="px-6 sm:px-10 lg:px-0"
        >
          <HoloAvatar />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={booted ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, delay: 0.9 }}
          className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4 lg:col-span-2"
        >
          {stats.map((s) => (
            <div key={s.label} className="group bg-background/80 px-5 py-6 backdrop-blur transition hover:bg-card">
              <Counter to={s.value} suffix={s.suffix} className="font-display text-3xl font-bold text-foreground transition group-hover:text-primary md:text-4xl" />
              <div className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.button
        onClick={() => scrollToId("about")}
        initial={{ opacity: 0 }}
        animate={booted ? { opacity: 1 } : {}}
        transition={{ delay: 1.4 }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:flex"
        aria-label="Scroll to about"
      >
        scroll
        <motion.span animate={{ y: [0, 8, 0] }} transition={{ duration: 1.6, repeat: Infinity }}>
          <ArrowDown className="h-4 w-4" />
        </motion.span>
      </motion.button>
    </section>
  );
}
