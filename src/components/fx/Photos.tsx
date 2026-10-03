import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { sound } from "@/lib/sound";
import { asset, cn } from "@/lib/utils";

export type Photo = { src: string; caption: string; alt: string; position?: string };

const TILTS = [-4, 3, -2, 4];

/** Polaroid-style photos that straighten on hover and open in a lightbox. */
export function PhotoStrip({ photos, id, className }: { photos: Photo[]; id: string; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <div className={cn("grid gap-6 sm:grid-cols-2 sm:gap-8", className)}>
        {photos.map((p, i) => (
          <motion.button
            key={p.src}
            layoutId={`${id}-${i}`}
            onClick={() => {
              setOpen(i);
              sound.play("open");
            }}
            initial={{ opacity: 0, y: 40, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: TILTS[i % TILTS.length] }}
            viewport={{ once: true, margin: "-60px" }}
            whileHover={{ rotate: 0, scale: 1.03, y: -6, zIndex: 10 }}
            transition={{ type: "spring", stiffness: 160, damping: 18, delay: i * 0.08 }}
            className="group relative block rounded-2xl border border-white/10 bg-card p-2.5 pb-12 text-left shadow-[0_30px_60px_-30px_rgba(0,0,0,0.9)]"
            aria-label={`Open photo: ${p.caption}`}
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
              <img src={asset(p.src)} alt={p.alt} loading="lazy" style={{ objectPosition: p.position ?? "center 30%" }} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 transition group-hover:opacity-100" />
            </div>
            <span className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span className="truncate">{p.caption}</span>
              <span className="text-primary opacity-0 transition group-hover:opacity-100">view ↗</span>
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            className="fixed inset-0 z-[150] flex items-center justify-center bg-background/90 p-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setOpen(null);
              sound.play("close");
            }}
          >
            <motion.figure layoutId={`${id}-${open}`} className="relative max-h-[88vh] max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-card p-2">
              <img src={asset(photos[open].src)} alt={photos[open].alt} className="max-h-[80vh] w-auto rounded-xl object-contain" />
              <figcaption className="px-2 py-2.5 font-mono text-xs text-muted-foreground">{photos[open].caption}</figcaption>
            </motion.figure>
            <button className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/60" aria-label="Close photo">
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
