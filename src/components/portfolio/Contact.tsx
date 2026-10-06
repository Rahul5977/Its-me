import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowUpRight, Check, Copy, Github, Linkedin, Mail, PenLine, Send, Trophy } from "lucide-react";
import { Magnetic, Reveal, SectionHeading } from "@/components/fx/primitives";
import { profile } from "@/data/portfolio";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";
import { Guestbook } from "./Guestbook";

const TOPICS = ["Hiring / internship", "Collaboration", "Freelance project", "Just saying hi 👋"];

// Delivery: Web3Forms when VITE_WEB3FORMS_KEY is set, otherwise FormSubmit (no key; one-time activation
// email to the inbox). If delivery fails, we fall back to the visitor's mail client, pre-filled.
const WEB3FORMS_KEY = import.meta.env.VITE_WEB3FORMS_KEY as string | undefined;

async function deliver(payload: { name: string; email: string; topic: string; message: string; subject: string }) {
  const res = WEB3FORMS_KEY
    ? await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: WEB3FORMS_KEY, from_name: payload.name, ...payload }),
      })
    : await fetch(`https://formsubmit.co/ajax/${profile.email}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...payload, _subject: payload.subject, _replyto: payload.email, _template: "table", _captcha: "false" }),
      });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !(data.success === true || data.success === "true")) throw new Error(data.message ?? "delivery failed");
}

type Phase = "idle" | "encrypting" | "sending" | "sent";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="group block">
      <span className="mb-2 block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition group-focus-within:text-primary">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/10 bg-background/60 px-4 py-3 text-sm outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:bg-background focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.12)]";

function IstClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <span>
      {now.toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", second: "2-digit" })} IST
    </span>
  );
}

export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "", topic: TOPICS[0], botcheck: "" });
  const [phase, setPhase] = useState<Phase>("idle");
  const [copied, setCopied] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    sound.play("key");
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      sound.play("success");
      toast.success("Email copied to clipboard", { description: profile.email });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phase !== "idle") return;
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email) || form.message.trim().length < 10) {
      sound.play("error");
      toast.error("Almost there", { description: "Add your name, a valid email and a message of at least 10 characters." });
      return;
    }
    if (form.botcheck) return;

    setPhase("encrypting");
    sound.play("open");
    await new Promise((r) => setTimeout(r, 700));
    setPhase("sending");

    const subject = `[Portfolio] ${form.topic} from ${form.name}`;
    try {
      await deliver({ name: form.name, email: form.email, topic: form.topic, message: form.message, subject });
      toast.success("Message delivered 🚀", { description: "Thanks! I usually reply within a day." });
      setPhase("sent");
      sound.play("success");
      setTimeout(() => {
        setPhase("idle");
        setForm({ name: "", email: "", message: "", topic: TOPICS[0], botcheck: "" });
      }, 3200);
    } catch {
      // Never lose a message: hand it to the visitor's mail client instead.
      const body = `${form.message}\n\n— ${form.name} (${form.email})`;
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setPhase("idle");
      sound.play("error");
      toast.message("Opening your mail app instead ✉", { description: "Direct delivery hiccuped. Your message is pre-filled, so just hit send." });
    }
  };

  const label: Record<Phase, string> = {
    idle: "Send message",
    encrypting: "Encrypting…",
    sending: "Transmitting…",
    sent: "Delivered",
  };

  return (
    <section id="contact" className="relative py-28 md:py-36">
      <div className="container">
        <SectionHeading
          index="10"
          label="open.channel"
          title={
            <>
              Let&apos;s build something
              <br />
              <span className="text-gradient">worth shipping.</span>
            </>
          }
          sub="Hiring for SDE / AI engineering roles, have a wild product idea, or just want to talk agents? My inbox is open."
        />

        <div className="grid gap-8 lg:grid-cols-[1fr_1.35fr] [&>*]:min-w-0">
          {/* left: direct channels */}
          <div className="space-y-5">
            <Reveal>
              <div className="border-beam glass relative overflow-hidden rounded-2xl p-6">
                <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">direct line</div>
                <a href={`mailto:${profile.email}`} className="block break-all font-display text-xl font-semibold transition hover:text-primary md:text-2xl">
                  {profile.email}
                </a>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Magnetic>
                    <button
                      onClick={copyEmail}
                      className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-sm text-primary transition hover:bg-primary hover:text-primary-foreground"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={String(copied)} initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }}>
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </motion.span>
                      </AnimatePresence>
                      {copied ? "Copied!" : "Copy email"}
                    </button>
                  </Magnetic>
                  <Magnetic>
                    <a
                      href={`mailto:${profile.email}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm transition hover:border-primary hover:text-primary"
                    >
                      <Mail className="h-4 w-4" /> Open mail app
                    </a>
                  </Magnetic>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { href: profile.socials.linkedin, icon: Linkedin, label: "LinkedIn", sub: "rahul-raj-iitbh" },
                  { href: profile.socials.github, icon: Github, label: "GitHub", sub: "@Rahul5977" },
                  { href: profile.socials.leetcode, icon: Trophy, label: "LeetCode", sub: "350+ solved" },
                  { href: profile.socials.hashnode, icon: PenLine, label: "Blog", sub: "Hashnode" },
                ].map(({ href, icon: Icon, label: l, sub }) => (
                  <motion.a
                    key={l}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    whileHover={{ y: -4 }}
                    className="glass group flex flex-col rounded-xl p-4 transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-muted-foreground transition group-hover:text-primary" />
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                    </div>
                    <div className="mt-3 font-medium">{l}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
                  </motion.a>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="glass flex items-center justify-between rounded-xl px-5 py-4 font-mono text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> {profile.location}
                </span>
                <IstClock />
              </div>
            </Reveal>
          </div>

          {/* right: form */}
          <Reveal delay={0.1}>
            <form onSubmit={submit} className="glass relative overflow-hidden rounded-2xl p-6 md:p-8" noValidate>
              <div className="mb-6 flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>
                  <span className="text-accent">$</span> compose --to rahul
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> secure
                </span>
              </div>

              <div className="mb-5 flex flex-wrap gap-2">
                {TOPICS.map((t) => (
                  <button
                    type="button"
                    key={t}
                    onClick={() => {
                      setForm((f) => ({ ...f, topic: t }));
                      sound.play("toggle");
                    }}
                    className={cn(
                      "rounded-full border px-3.5 py-1.5 text-xs transition",
                      form.topic === t ? "border-primary bg-primary/15 text-primary" : "border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground",
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Your name">
                  <input className={inputCls} value={form.name} onChange={set("name")} placeholder="Ada Lovelace" autoComplete="name" />
                </Field>
                <Field label="Your email">
                  <input className={inputCls} type="email" value={form.email} onChange={set("email")} placeholder="ada@company.com" autoComplete="email" />
                </Field>
              </div>
              <div className="mt-5">
                <Field label="Message">
                  <textarea
                    className={cn(inputCls, "min-h-[150px] resize-y")}
                    value={form.message}
                    onChange={set("message")}
                    placeholder="Hey Rahul, I saw MiniClaw and…"
                    data-lenis-prevent
                  />
                </Field>
              </div>
              <input type="checkbox" className="hidden" tabIndex={-1} autoComplete="off" checked={!!form.botcheck} onChange={(e) => setForm((f) => ({ ...f, botcheck: e.target.checked ? "1" : "" }))} />

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <span className="font-mono text-[11px] text-muted-foreground">{form.message.length} chars · I usually reply within 24h</span>
                <Magnetic>
                  <button
                    type="submit"
                    disabled={phase !== "idle"}
                    className={cn(
                      "group relative inline-flex min-w-[190px] items-center justify-center gap-2 overflow-hidden rounded-full px-7 py-3.5 font-medium transition",
                      phase === "sent" ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground shadow-[0_0_40px_-8px_hsl(var(--primary))]",
                    )}
                  >
                    {(phase === "encrypting" || phase === "sending") && (
                      <motion.span
                        className="absolute inset-y-0 left-0 bg-white/25"
                        initial={{ width: "0%" }}
                        animate={{ width: phase === "encrypting" ? "45%" : "100%" }}
                        transition={{ duration: 0.7 }}
                      />
                    )}
                    <AnimatePresence mode="wait">
                      <motion.span key={phase} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }} className="relative flex items-center gap-2">
                        {phase === "sent" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <motion.span animate={phase === "sending" ? { x: [0, 40], y: [0, -20], opacity: [1, 0] } : {}} transition={{ duration: 0.6, repeat: phase === "sending" ? Infinity : 0 }}>
                            <Send className="h-4 w-4 transition group-hover:-rotate-12" />
                          </motion.span>
                        )}
                        {label[phase]}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                </Magnetic>
              </div>
            </form>
          </Reveal>
        </div>

        <Guestbook />
      </div>
    </section>
  );
}
