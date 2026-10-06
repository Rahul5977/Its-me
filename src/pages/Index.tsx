import { useEffect, useState } from "react";
import { BootLoader, Cursor, NeuralBackground, ScrollProgress } from "@/components/fx/ambient";
import { useSmoothScroll } from "@/components/fx/primitives";
import { About } from "@/components/portfolio/About";
import { Achievements } from "@/components/portfolio/Achievements";
import { CommandPalette } from "@/components/portfolio/CommandPalette";
import { Contact } from "@/components/portfolio/Contact";
import { Footer } from "@/components/portfolio/Footer";
import { ForTheStudents } from "@/components/portfolio/ForTheStudents";
import { Hero } from "@/components/portfolio/Hero";
import { InterIIT } from "@/components/portfolio/InterIIT";
import { Internship } from "@/components/portfolio/Internship";
import { Journey } from "@/components/portfolio/Journey";
import { Nav } from "@/components/portfolio/Nav";
import { Stack } from "@/components/portfolio/Stack";
import { Terminal } from "@/components/portfolio/Terminal";
import { Work } from "@/components/portfolio/Work";
import { sound } from "@/lib/sound";

/** Play subtle UI sounds for every interactive element without wiring each one by hand. */
function useGlobalUiSounds() {
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

const BOOTED_KEY = "rr-booted";

const Index = () => {
  const [booted, setBooted] = useState(() => {
    try {
      return sessionStorage.getItem(BOOTED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [palette, setPalette] = useState(false);

  useSmoothScroll();
  useGlobalUiSounds();

  useEffect(() => {
    document.documentElement.style.overflow = booted ? "" : "hidden";
  }, [booted]);

  return (
    <div className="noise relative min-h-screen">
      {!booted && (
        <BootLoader
          onDone={() => {
            setBooted(true);
            try {
              sessionStorage.setItem(BOOTED_KEY, "1");
            } catch {
              /* ignore */
            }
          }}
        />
      )}
      <NeuralBackground />
      <Cursor />
      <ScrollProgress />
      <Nav onOpenPalette={() => setPalette(true)} />
      <CommandPalette open={palette} setOpen={setPalette} />
      <main>
        <Hero booted={booted} />
        <About />
        <Work />
        <ForTheStudents />
        <Internship />
        <InterIIT />
        <Achievements />
        <Journey />
        <Stack />
        <Terminal />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
