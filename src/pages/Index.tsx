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
import { LatestPostPopout } from "@/components/portfolio/LatestPostPopout";
import { Journey } from "@/components/portfolio/Journey";
import { Nav } from "@/components/portfolio/Nav";
import { Stack } from "@/components/portfolio/Stack";
import { Terminal } from "@/components/portfolio/Terminal";
import { Work } from "@/components/portfolio/Work";
import { Writing } from "@/components/portfolio/Writing";
import { useGlobalUiSounds } from "@/hooks/use-ui-sounds";

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
      <LatestPostPopout ready={booted} />
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
        <Writing />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
