// Publish from the browser: one atomic commit (post + media) through the GitHub Git Data API.
// The push to `main` triggers the Pages deploy workflow, so the post goes live in ~1–2 minutes.

export interface GithubSettings {
  token: string;
  repo: string; // "owner/name"
  branch: string;
}

export const DEFAULT_REPO = "Rahul5977/Its-me";

/* ───────── encrypted token vault ─────────
 * The token is never stored readable. It's encrypted with AES-256-GCM under a key derived from your
 * passphrase (PBKDF2-SHA256, 600k iterations); only the ciphertext lives in localStorage. The decrypted
 * token exists solely in this module's memory and disappears when the tab closes or you lock the studio.
 * localStorage on rahul5977.github.io is shared by every Pages site on that domain, so plaintext there
 * would be readable by any of them.
 */

const VAULT_KEY = "rr-blog-vault";
const LEGACY_KEY = "rr-blog-github";
const ITERATIONS = 600_000;
export const MIN_PASSPHRASE = 10;

interface Vault {
  v: 1;
  repo: string;
  branch: string;
  salt: string;
  iv: string;
  data: string;
}

let session: GithubSettings | null = null;

const b64 = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

// Older builds kept the token in plain text: delete it on sight.
try {
  localStorage.removeItem(LEGACY_KEY);
} catch {
  /* ignore */
}

function readVault(): Vault | null {
  try {
    const v = JSON.parse(localStorage.getItem(VAULT_KEY) ?? "null");
    return v?.v === 1 ? v : null;
  } catch {
    return null;
  }
}

async function deriveKey(passphrase: string, salt: Uint8Array) {
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(passphrase), "PBKDF2", false, ["deriveKey"]);
  return crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

export const hasVault = () => !!readVault();
export const vaultRepo = () => readVault()?.repo ?? DEFAULT_REPO;
/** The unlocked settings for this tab, or null when locked. */
export const getSession = () => session;
export const lockSession = () => {
  session = null;
};

export async function saveVault(settings: GithubSettings, passphrase: string) {
  if (passphrase.length < MIN_PASSPHRASE) throw new Error(`Passphrase must be at least ${MIN_PASSPHRASE} characters`);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(settings.token));
  const vault: Vault = { v: 1, repo: settings.repo, branch: settings.branch, salt: b64(salt), iv: b64(iv), data: b64(data) };
  localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
  session = settings;
}

export async function unlockVault(passphrase: string): Promise<GithubSettings> {
  const v = readVault();
  if (!v) throw new Error("No saved token on this device");
  try {
    const key = await deriveKey(passphrase, unb64(v.salt));
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(v.iv) }, key, unb64(v.data));
    session = { token: new TextDecoder().decode(plain), repo: v.repo, branch: v.branch };
    return session;
  } catch {
    throw new Error("Wrong passphrase");
  }
}

export function forgetVault() {
  session = null;
  try {
    localStorage.removeItem(VAULT_KEY);
  } catch {
    /* ignore */
  }
}

export interface PublishFile {
  path: string;
  /** base64 for binaries, utf-8 text otherwise */
  content: string;
  encoding: "utf-8" | "base64";
}

async function gh<T>(s: GithubSettings, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`https://api.github.com/repos/${s.repo}${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${s.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const hint =
      res.status === 401
        ? "token is invalid or expired"
        : res.status === 403 || res.status === 404
          ? "token needs Contents: read & write on this repo"
          : data.message;
    throw new Error(`GitHub ${res.status}: ${hint}`);
  }
  return data as T;
}

export async function verifyGithub(s: GithubSettings): Promise<string> {
  const r = await gh<{ full_name: string; permissions?: { push?: boolean } }>(s, "");
  // Strict: a token without confirmed push access (or an anonymous read) must not pass.
  if (!r.permissions?.push) throw new Error("this token can't push to the repo");
  return r.full_name;
}

export async function publishCommit(s: GithubSettings, files: PublishFile[], message: string): Promise<string> {
  const ref = await gh<{ object: { sha: string } }>(s, `/git/ref/heads/${s.branch}`);
  const head = await gh<{ tree: { sha: string } }>(s, `/git/commits/${ref.object.sha}`);
  const tree = await Promise.all(
    files.map(async (f) => {
      const blob = await gh<{ sha: string }>(s, "/git/blobs", {
        method: "POST",
        body: JSON.stringify({ content: f.content, encoding: f.encoding }),
      });
      return { path: f.path, mode: "100644", type: "blob", sha: blob.sha };
    }),
  );
  const newTree = await gh<{ sha: string }>(s, "/git/trees", {
    method: "POST",
    body: JSON.stringify({ base_tree: head.tree.sha, tree }),
  });
  const commit = await gh<{ sha: string; html_url: string }>(s, "/git/commits", {
    method: "POST",
    body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }),
  });
  await gh(s, `/git/refs/heads/${s.branch}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) });
  return commit.html_url;
}
