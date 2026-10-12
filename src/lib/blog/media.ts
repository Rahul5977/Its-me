// Draft media for the studio: images live in IndexedDB until the post is published or saved,
// so a refresh never loses them. Markdown refers to them as `media/<name>`.
import { clear, createStore, del, entries, set } from "idb-keyval";
import { slugify } from "./frontmatter";

const store = createStore("rr-blog", "media");

export const listDraftMedia = () => entries<string, Blob>(store);
export const putDraftMedia = (name: string, blob: Blob) => set(name, blob, store);
export const deleteDraftMedia = (name: string) => del(name, store);
export const clearDraftMedia = () => clear(store);

const MAX_EDGE = 1800;

/** Downscale and re-encode photos to WebP. GIFs and SVGs pass through untouched so animation survives. */
export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || /gif|svg/.test(file.type)) return file;
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    const out = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", 0.85));
    return out && out.size < file.size ? out : file;
  } catch {
    return file;
  }
}

export function mediaName(file: File, blob: Blob): string {
  const base = slugify(file.name.replace(/\.[^.]+$/, "")).slice(0, 40) || "image";
  const ext = blob.type === "image/webp" ? "webp" : (file.name.split(".").pop() || "bin").toLowerCase().replace(/[^a-z0-9]/g, "");
  return `${base}-${Math.random().toString(36).slice(2, 6)}.${ext}`;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/** `media/<name>` references in a post (body + cover). */
export function referencedMedia(...sources: (string | undefined)[]): Set<string> {
  const out = new Set<string>();
  for (const s of sources) for (const m of (s ?? "").matchAll(/media\/([\w][\w.-]*)/g)) out.add(m[1]);
  return out;
}
