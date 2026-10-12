import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

// giscus stores each thread as a GitHub Discussion in this repo, keyed by `term`.
// Visitors sign in with GitHub, so every entry carries a real name and avatar.
export const GISCUS = {
  repo: "Rahul5977/Its-me",
  repoId: "R_kgDOPikwFw",
  category: "General",
  categoryId: "DIC_kwDOPikwF84DG7v3",
};

export function GiscusThread({ term, className }: { term: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    host.innerHTML = "";
    const s = document.createElement("script");
    s.src = "https://giscus.app/client.js";
    s.async = true;
    s.crossOrigin = "anonymous";
    Object.entries({
      "data-repo": GISCUS.repo,
      "data-repo-id": GISCUS.repoId,
      "data-category": GISCUS.category,
      "data-category-id": GISCUS.categoryId,
      "data-mapping": "specific",
      "data-term": term,
      "data-strict": "1",
      "data-reactions-enabled": "1",
      "data-emit-metadata": "0",
      "data-input-position": "top",
      "data-theme": "transparent_dark",
      "data-lang": "en",
      "data-loading": "lazy",
    }).forEach(([k, v]) => s.setAttribute(k, v));
    host.appendChild(s);
  }, [term]);

  return <div ref={ref} data-lenis-prevent className={cn("giscus min-h-[220px]", className)} />;
}
