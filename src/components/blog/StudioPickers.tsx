import { useEffect, useRef, useState, type ReactNode } from "react";
import EmojiPicker, { EmojiStyle, Theme } from "emoji-picker-react";
import { Link2, Loader2, Search, Upload } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { STICKER_PACKS, stickerUrl } from "@/lib/blog/stickers";
import { cn } from "@/lib/utils";

// Optional: a free GIPHY key (developers.giphy.com) unlocks GIF + sticker search in the studio.
const GIPHY_KEY = import.meta.env.VITE_GIPHY_KEY as string | undefined;

interface GiphyItem {
  id: string;
  title: string;
  images: { fixed_width: { url: string }; downsized_medium?: { url: string }; original: { url: string } };
}

function useGiphy(kind: "gifs" | "stickers", query: string, enabled: boolean) {
  const [items, setItems] = useState<GiphyItem[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!GIPHY_KEY || !enabled) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      const q = query.trim();
      const url = q
        ? `https://api.giphy.com/v1/${kind}/search?api_key=${GIPHY_KEY}&q=${encodeURIComponent(q)}&limit=24&rating=pg-13`
        : `https://api.giphy.com/v1/${kind}/trending?api_key=${GIPHY_KEY}&limit=24&rating=pg-13`;
      try {
        const res = await fetch(url, { signal: ctrl.signal });
        const data = await res.json();
        setItems(data.data ?? []);
      } catch {
        /* aborted or offline */
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [kind, query, enabled]);
  return { items, loading };
}

function PickerShell({ trigger, children, className, open, onOpenChange }: { trigger: ReactNode; children: ReactNode; className?: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className={cn("glass w-[340px] rounded-2xl border-white/10 p-0 shadow-2xl", className)}>
        {children}
      </PopoverContent>
    </Popover>
  );
}

function Tabs({ value, onChange, tabs }: { value: string; onChange: (t: string) => void; tabs: { id: string; label: string }[] }) {
  return (
    <div className="flex gap-1 border-b border-white/10 p-2">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn("rounded-full px-3 py-1 font-mono text-[11px] transition", value === t.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="relative m-2 flex items-center">
      <Search className="pointer-events-none absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/10 bg-background/60 py-2 pl-8 pr-3 text-sm outline-none focus:border-primary"
      />
    </label>
  );
}

function GiphyGrid({ kind, onPick }: { kind: "gifs" | "stickers"; onPick: (url: string, title: string) => void }) {
  const [q, setQ] = useState("");
  const { items, loading } = useGiphy(kind, q, true);
  return (
    <>
      <SearchBox value={q} onChange={setQ} placeholder={`Search GIPHY ${kind}…`} />
      <div data-lenis-prevent className="grid max-h-72 grid-cols-3 gap-1.5 overflow-y-auto px-2 pb-2">
        {loading && !items.length && <Loader2 className="col-span-3 mx-auto my-8 h-5 w-5 animate-spin text-primary" />}
        {items.map((g) => (
          <button
            key={g.id}
            onClick={() => onPick((g.images.downsized_medium ?? g.images.original).url, g.title)}
            className="aspect-square overflow-hidden rounded-lg bg-white/5 transition hover:ring-2 hover:ring-primary"
          >
            <img src={g.images.fixed_width.url} alt={g.title} loading="lazy" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      <div className="border-t border-white/5 px-3 py-1.5 text-right font-mono text-[10px] text-muted-foreground">powered by GIPHY</div>
    </>
  );
}

function LinkOrUpload({ label, accept, onLink, onUpload }: { label: string; accept: string; onLink: (url: string) => void; onUpload: (f: File) => void }) {
  const [url, setUrl] = useState("");
  const file = useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-3 p-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (/^https?:\/\//.test(url.trim())) onLink(url.trim());
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={`Paste a ${label} URL`}
            className="w-full rounded-lg border border-white/10 bg-background/60 py-2 pl-8 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <button className="rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground">add</button>
      </form>
      <button
        onClick={() => file.current?.click()}
        className="flex w-full flex-col items-center gap-1 rounded-xl border border-dashed border-white/15 py-6 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
      >
        <Upload className="h-5 w-5" />
        upload from device
        <span className="font-mono text-[10px] opacity-70">{accept.replace(/image\//g, "").replace(/,/g, " · ")}</span>
      </button>
      <input
        ref={file}
        type="file"
        accept={accept}
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ───────── public pickers ───────── */

export function EmojiPopover({ trigger, onPick }: { trigger: ReactNode; onPick: (emoji: string) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <PickerShell trigger={trigger} open={open} onOpenChange={setOpen} className="w-auto overflow-hidden">
      <div data-lenis-prevent>
        <EmojiPicker
            theme={Theme.DARK}
            emojiStyle={EmojiStyle.NATIVE}
            lazyLoadEmojis
            width={340}
            height={400}
            previewConfig={{ showPreview: false }}
            onEmojiClick={(e) => {
              onPick(e.emoji);
              setOpen(false);
            }}
            style={{ background: "transparent", border: "none", "--epr-bg-color": "transparent", "--epr-category-label-bg-color": "hsl(220 25% 7% / 0.95)" } as React.CSSProperties}
        />
      </div>
    </PickerShell>
  );
}

export function StickerPopover({ trigger, onPick, onUpload }: { trigger: ReactNode; onPick: (url: string, name: string) => void; onUpload: (f: File) => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"emoji" | "giphy" | "custom">("emoji");
  const [q, setQ] = useState("");
  const pick = (url: string, name: string) => {
    onPick(url, name);
    setOpen(false);
  };
  const tabs: { id: typeof tab; label: string }[] = [{ id: "emoji", label: "animated" }, ...(GIPHY_KEY ? [{ id: "giphy" as const, label: "giphy" }] : []), { id: "custom", label: "custom" }];
  return (
    <PickerShell trigger={trigger} open={open} onOpenChange={setOpen}>
      <Tabs value={tab} onChange={(t) => setTab(t as typeof tab)} tabs={tabs} />
      {tab === "emoji" && (
        <>
          <SearchBox value={q} onChange={setQ} placeholder="Find a sticker…" />
          <div data-lenis-prevent className="max-h-80 overflow-y-auto px-2 pb-2">
            {STICKER_PACKS.map((pack) => {
              const items = pack.items.filter((s) => s.name.includes(q.toLowerCase().trim()));
              if (!items.length) return null;
              return (
                <div key={pack.label} className="mb-2">
                  <div className="px-1 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{pack.label}</div>
                  <div className="grid grid-cols-6 gap-1">
                    {items.map((s) => (
                      <button key={s.code} title={s.name} onClick={() => pick(stickerUrl(s.code), s.name)} className="rounded-lg p-1 transition hover:scale-110 hover:bg-white/5">
                        <img src={stickerUrl(s.code)} alt={s.name} loading="lazy" className="h-10 w-10" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      {tab === "giphy" && <GiphyGrid kind="stickers" onPick={(url, t) => pick(url, t || "giphy")} />}
      {tab === "custom" && (
        <LinkOrUpload
          label="sticker"
          accept="image/png,image/webp,image/gif,image/svg+xml"
          onLink={(url) => pick(url, "custom")}
          onUpload={(f) => {
            onUpload(f);
            setOpen(false);
          }}
        />
      )}
    </PickerShell>
  );
}

export function GifPopover({ trigger, onPick, onUpload }: { trigger: ReactNode; onPick: (url: string, title: string) => void; onUpload: (f: File) => void }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"search" | "link">(GIPHY_KEY ? "search" : "link");
  const tabs: { id: typeof tab; label: string }[] = [...(GIPHY_KEY ? [{ id: "search" as const, label: "search" }] : []), { id: "link", label: "link / upload" }];
  return (
    <PickerShell trigger={trigger} open={open} onOpenChange={setOpen}>
      <Tabs value={tab} onChange={(t) => setTab(t as typeof tab)} tabs={tabs} />
      {tab === "search" && (
        <GiphyGrid
          kind="gifs"
          onPick={(url, t) => {
            onPick(url, t);
            setOpen(false);
          }}
        />
      )}
      {tab === "link" && (
        <>
          <LinkOrUpload
            label="GIF"
            accept="image/gif,image/webp,video/mp4"
            onLink={(url) => {
              onPick(url, "");
              setOpen(false);
            }}
            onUpload={(f) => {
              onUpload(f);
              setOpen(false);
            }}
          />
          {!GIPHY_KEY && (
            <p className="px-3 pb-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
              tip: set <span className="text-accent">VITE_GIPHY_KEY</span> to search GIPHY right here.
            </p>
          )}
        </>
      )}
    </PickerShell>
  );
}
