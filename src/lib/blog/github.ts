// Publish from the browser: one atomic commit (post + media) through the GitHub Git Data API.
// The push to `main` triggers the Pages deploy workflow, so the post goes live in ~1–2 minutes.

export interface GithubSettings {
  token: string;
  repo: string; // "owner/name"
  branch: string;
}

const KEY = "rr-blog-github";
export const DEFAULT_REPO = "Rahul5977/Its-me";

export function loadGithubSettings(): GithubSettings {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? "{}");
    return { token: s.token ?? "", repo: s.repo || DEFAULT_REPO, branch: s.branch || "main" };
  } catch {
    return { token: "", repo: DEFAULT_REPO, branch: "main" };
  }
}

export function saveGithubSettings(s: GithubSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
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
  if (r.permissions && !r.permissions.push) throw new Error("token can read but not push to this repo");
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
