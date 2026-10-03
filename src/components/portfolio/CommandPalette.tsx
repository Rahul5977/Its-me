import { useEffect } from "react";
import { toast } from "sonner";
import { ArrowRight, Copy, ExternalLink, Github, Linkedin, Mail, Volume2 } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { scrollToId } from "@/components/fx/primitives";
import { featuredProjects, profile } from "@/data/portfolio";
import { sound } from "@/lib/sound";
import { SECTIONS } from "./Nav";

export function CommandPalette({ open, setOpen }: { open: boolean; setOpen: (o: boolean) => void }) {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        sound.play(open ? "close" : "open");
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  const run = (fn: () => void) => {
    setOpen(false);
    sound.play("click");
    setTimeout(fn, 120);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" className="font-mono" onValueChange={() => sound.play("key")} />
      <CommandList>
        <CommandEmpty>No results. Try “projects” or “mail”.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {SECTIONS.map((s) => (
            <CommandItem key={s.id} onSelect={() => run(() => scrollToId(s.id))}>
              <ArrowRight className="mr-2" /> Go to {s.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Projects">
          {featuredProjects.map((p) => (
            <CommandItem key={p.id} onSelect={() => run(() => window.open(p.links.live ?? p.links.github, "_blank", "noopener"))}>
              <ExternalLink className="mr-2" /> {p.name}
              <CommandShortcut>{p.status}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Connect">
          <CommandItem onSelect={() => run(() => scrollToId("contact"))}>
            <Mail className="mr-2" /> Send me an email
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                navigator.clipboard?.writeText(profile.email);
                toast.success("Email copied", { description: profile.email });
                sound.play("success");
              })
            }
          >
            <Copy className="mr-2" /> Copy email address
          </CommandItem>
          <CommandItem onSelect={() => run(() => window.open(profile.socials.github, "_blank", "noopener"))}>
            <Github className="mr-2" /> GitHub
          </CommandItem>
          <CommandItem onSelect={() => run(() => window.open(profile.socials.linkedin, "_blank", "noopener"))}>
            <Linkedin className="mr-2" /> LinkedIn
          </CommandItem>
          <CommandItem
            onSelect={() =>
              run(() => {
                sound.unlock();
                sound.setEnabled(!sound.enabled);
              })
            }
          >
            <Volume2 className="mr-2" /> Toggle sound effects
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
