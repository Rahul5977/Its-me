import { useLocation } from "react-router-dom";
import { NeuralBackground } from "@/components/fx/ambient";
import { asset } from "@/lib/utils";

const NotFound = () => {
  const location = useLocation();
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4">
      <NeuralBackground />
      <div className="text-center font-mono">
        <h1 className="glitch font-display text-[8rem] font-bold leading-none text-gradient" data-text="404">
          404
        </h1>
        <p className="mt-4 text-muted-foreground">
          <span className="text-destructive">error:</span> route <span className="text-foreground">{location.pathname}</span> not found
        </p>
        <a href={asset("")} className="mt-8 inline-block rounded-full border border-primary/50 px-6 py-2.5 text-sm text-primary transition hover:bg-primary hover:text-primary-foreground">
          cd ~
        </a>
      </div>
    </div>
  );
};

export default NotFound;
