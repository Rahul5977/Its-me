import { useState } from "react";
import { toast } from "sonner";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { DEFAULT_REPO, forgetVault, hasVault, MIN_PASSPHRASE, saveVault, unlockVault, vaultRepo, verifyGithub, type GithubSettings } from "@/lib/blog/github";
import { sound } from "@/lib/sound";
import { cn } from "@/lib/utils";

const inputCls =
  "w-full rounded-xl border border-white/10 bg-background/60 px-3 py-2 font-mono text-sm outline-none transition placeholder:text-muted-foreground/50 focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary)/0.12)]";
const btnCls =
  "inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:shadow-[0_0_24px_hsl(var(--primary)/0.5)] disabled:opacity-40 disabled:hover:shadow-none";

/**
 * Unlock the saved (encrypted) token with your passphrase, or set one up on a new device.
 * Either way the token is checked against GitHub first: it must be able to push to the repo.
 */
export function OwnerAccess({ onReady }: { onReady: (s: GithubSettings) => void }) {
  const [mode, setMode] = useState<"unlock" | "setup">(hasVault() ? "unlock" : "setup");
  const [token, setToken] = useState("");
  const [repo, setRepo] = useState(vaultRepo());
  const [branch, setBranch] = useState("main");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [busy, setBusy] = useState(false);

  const fail = (msg: string) => {
    sound.play("error");
    toast.error("Not unlocked", { description: msg });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "unlock") {
        const s = await unlockVault(pass);
        // A token revoked or expired on GitHub locks the studio again.
        await verifyGithub(s).catch((err) => {
          forgetVault();
          setMode("setup");
          throw new Error(`Saved token no longer works (${err.message}). Set up a new one.`);
        });
        onReady(s);
      } else {
        if (pass.length < MIN_PASSPHRASE) throw new Error(`Passphrase needs at least ${MIN_PASSPHRASE} characters`);
        if (pass !== pass2) throw new Error("Passphrases don't match");
        const s = { token: token.trim(), repo: repo.trim() || DEFAULT_REPO, branch: branch.trim() || "main" };
        await verifyGithub(s);
        await saveVault(s, pass);
        onReady(s);
      }
      sound.play("success");
    } catch (err) {
      fail((err as Error).message);
    } finally {
      setBusy(false);
      setPass("");
      setPass2("");
      setToken("");
    }
  };

  if (mode === "unlock") {
    return (
      <form onSubmit={submit} className="space-y-3 text-left">
        <input type="password" autoFocus value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Passphrase" autoComplete="current-password" className={inputCls} />
        <button disabled={busy || !pass} className={btnCls}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Unlock
        </button>
        <button
          type="button"
          onClick={() => {
            forgetVault();
            setMode("setup");
          }}
          className="block w-full text-center font-mono text-[11px] text-muted-foreground transition hover:text-destructive"
        >
          forgot passphrase? remove the saved token
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3 text-left">
      <label className="block">
        <span className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          GitHub token
          <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noreferrer" className="normal-case tracking-normal text-primary hover:underline">
            create one ↗
          </a>
        </span>
        <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="github_pat_…" autoComplete="off" className={inputCls} />
      </label>
      <div className="grid grid-cols-[1fr_90px] gap-2">
        <input value={repo} onChange={(e) => setRepo(e.target.value)} aria-label="Repository" className={inputCls} />
        <input value={branch} onChange={(e) => setBranch(e.target.value)} aria-label="Branch" className={inputCls} />
      </div>
      <input
        type="password"
        value={pass}
        onChange={(e) => setPass(e.target.value)}
        placeholder={`New passphrase (${MIN_PASSPHRASE}+ characters)`}
        autoComplete="new-password"
        className={inputCls}
      />
      <input type="password" value={pass2} onChange={(e) => setPass2(e.target.value)} placeholder="Repeat passphrase" autoComplete="new-password" className={inputCls} />
      <button disabled={busy || !token.trim() || !pass || !pass2} className={btnCls}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Verify &amp; encrypt
      </button>
      <p className={cn("text-xs leading-relaxed text-muted-foreground")}>
        Use a fine-grained token: <span className="text-foreground">only the {repo.split("/")[1] || "blog"} repo</span>,{" "}
        <span className="text-foreground">Contents: Read and write</span>, short expiry. It&apos;s encrypted with your passphrase before it&apos;s saved, and only
        ever decrypted in this tab&apos;s memory.
      </p>
    </form>
  );
}
