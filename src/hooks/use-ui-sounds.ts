import { useEffect } from "react";
import { sound } from "@/lib/sound";

/** Play subtle UI sounds for every interactive element without wiring each one by hand. */
export function useGlobalUiSounds() {
  useEffect(() => {
    let last: Element | null = null;
    const SEL = "a, button, [role='button'], [role='option']";
    const over = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const el = (e.target as Element).closest(SEL);
      if (el && el !== last) sound.play("hover");
      last = el;
    };
    const down = (e: PointerEvent) => {
      sound.unlock();
      if ((e.target as Element).closest(SEL)) sound.play("click");
    };
    const key = () => sound.unlock();
    document.addEventListener("pointerover", over);
    document.addEventListener("pointerdown", down);
    document.addEventListener("keydown", key, { once: true });
    return () => {
      document.removeEventListener("pointerover", over);
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("keydown", key);
    };
  }, []);
}
