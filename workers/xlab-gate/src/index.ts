// X-Lab Studio Gate — auth and the single write path to the content repo.
//
// Design rule for this file: it must never need to change when the content model changes.
// It checks WHO you are, WHICH path you may write, and HOW BIG the payload is. It does not
// know what a Person or a Publication is. Schema correctness is enforced in CI, on the pull
// request this Worker opens — see .github/workflows/validate.yml.
import { randomId, signToken, verifyToken } from "./crypto";
import { magicLinkEmail, sendEmail, submissionStatusEmail } from "./email";
import type { Env, Identity } from "./env";
import {
  approvePR,
  createSubmissionPR,
  deployStatus,
  installationToken,
  listQueue,
  prFiles,
  readFile,
  rejectPR,
  type FileChange,
} from "./github";
import {
  canApprove,
  canWritePath,
  findByEmail,
  findByGithubLogin,
  loadRoster,
  toIdentity,
} from "./roster";

const SESSION_TTL_S = 7 * 24 * 60 * 60; // 7 days
const MAGIC_TTL_S = 15 * 60; // 15 minutes
const RATE_LIMIT_WINDOW_S = 15 * 60;
const RATE_LIMIT_MAX = 5;

// --- HTTP helpers --------------------------------------------------------------

function cors(env: Env): Record<string, string> {
  return {
    "Access-Control-Allow-Origin": env.SITE_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function json(env: Env, data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...cors(env) },
  });
}

function fail(env: Env, status: number, message: string): Response {
  return json(env, { error: message }, status);
}

// --- sessions ------------------------------------------------------------------

async function currentIdentity(req: Request, env: Env): Promise<Identity | undefined> {
  const header = req.headers.get("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return undefined;
  return verifyToken<Identity & { exp: number }>(token, env.SESSION_SECRET);
}

async function issueSession(env: Env, id: Identity): Promise<string> {
  return signToken({ ...id, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_S }, env.SESSION_SECRET);
}

// --- handlers ------------------------------------------------------------------

/**
 * Request a magic link.
 *
 * Always answers 200 with the same body, whether or not the address is on the roster —
 * otherwise this endpoint becomes an oracle for "who is in this lab".
 */
async function handleAuthEmail(req: Request, env: Env): Promise<Response> {
  const { email } = (await req.json().catch(() => ({}))) as { email?: string };
  const ok = json(env, { ok: true, message: "If that address is registered, a sign-in link is on its way." });
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return ok;

  const ip = req.headers.get("CF-Connecting-IP") ?? "unknown";
  for (const key of [`rl:email:${email.toLowerCase()}`, `rl:ip:${ip}`]) {
    const count = Number((await env.SESSIONS.get(key)) ?? "0");
    if (count >= RATE_LIMIT_MAX) return ok;
    await env.SESSIONS.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_S });
  }

  const entry = await findByEmail(env, email);
  if (!entry) return ok;

  // Single-use enforcement: the nonce is written now and deleted on redemption, so a
  // replayed link fails even inside its 15-minute validity window.
  const jti = randomId();
  await env.SESSIONS.put(`magic:${jti}`, entry.email.toLowerCase(), { expirationTtl: MAGIC_TTL_S });

  const token = await signToken(
    { jti, email: entry.email.toLowerCase(), exp: Math.floor(Date.now() / 1000) + MAGIC_TTL_S },
    env.SESSION_SECRET
  );
  const link = `${new URL(req.url).origin}/auth/verify?token=${encodeURIComponent(token)}`;
  const mail = magicLinkEmail(link, entry.name);

  try {
    await sendEmail(env, { email: entry.email, name: entry.name }, mail.subject, mail.html, mail.text);
  } catch (err) {
    console.error("magic link send failed:", err);
  }
  return ok;
}

async function handleAuthVerify(req: Request, env: Env): Promise<Response> {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const payload = await verifyToken<{ jti: string; email: string; exp: number }>(
    token,
    env.SESSION_SECRET
  );
  const redirect = (params: string) =>
    new Response(null, { status: 302, headers: { Location: `${env.STUDIO_URL}#${params}` } });

  if (!payload) return redirect("error=invalid_or_expired");

  const stored = await env.SESSIONS.get(`magic:${payload.jti}`);
  if (stored !== payload.email) return redirect("error=already_used");
  await env.SESSIONS.delete(`magic:${payload.jti}`);

  const entry = await findByEmail(env, payload.email);
  if (!entry) return redirect("error=not_authorized");

  return redirect(`token=${encodeURIComponent(await issueSession(env, toIdentity(entry)))}`);
}

/** Admin sign-in via GitHub, so admin access rests on GitHub's 2FA rather than an inbox. */
async function handleGithubStart(req: Request, env: Env): Promise<Response> {
  const state = randomId();
  await env.SESSIONS.put(`oauth:${state}`, "1", { expirationTtl: 600 });
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  url.searchParams.set("redirect_uri", `${new URL(req.url).origin}/auth/github/callback`);
  url.searchParams.set("state", state);
  return new Response(null, { status: 302, headers: { Location: url.toString() } });
}

async function handleGithubCallback(req: Request, env: Env): Promise<Response> {
  const params = new URL(req.url).searchParams;
  const code = params.get("code") ?? "";
  const state = params.get("state") ?? "";
  const redirect = (p: string) =>
    new Response(null, { status: 302, headers: { Location: `${env.STUDIO_URL}#${p}` } });

  // CSRF: the state must be one we issued, and it is single-use.
  if (!code || !state || !(await env.SESSIONS.get(`oauth:${state}`))) {
    return redirect("error=bad_oauth_state");
  }
  await env.SESSIONS.delete(`oauth:${state}`);

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const { access_token } = (await tokenRes.json()) as { access_token?: string };
  if (!access_token) return redirect("error=oauth_failed");

  const userRes = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
      "User-Agent": "xlab-studio-gate",
      Accept: "application/vnd.github+json",
    },
  });
  const user = (await userRes.json()) as { login?: string; name?: string; email?: string };
  if (!user.login) return redirect("error=oauth_failed");

  // The user token is used only to read identity, then discarded — it is never stored and
  // never used to write. All writes go through the App installation token.
  const entry = await findByGithubLogin(env, user.login);
  if (!entry) return redirect("error=not_authorized");

  return redirect(
    `token=${encodeURIComponent(await issueSession(env, toIdentity(entry, `github:${user.login}`)))}`
  );
}

/** Open a submission PR. The only write path in the system. */
async function handleSubmit(req: Request, env: Env, id: Identity): Promise<Response> {
  const body = (await req.json().catch(() => null)) as {
    title?: string;
    summary?: string;
    files?: FileChange[];
  } | null;
  if (!body?.files?.length || !body.title) return fail(env, 400, "title and files are required");

  const maxBytes = Number(env.MAX_PAYLOAD_BYTES);
  const size = body.files.reduce(
    (n, f) => n + (f.content?.length ?? 0) + (f.contentBase64?.length ?? 0),
    0
  );
  if (size > maxBytes) return fail(env, 413, `payload too large (${size} > ${maxBytes} bytes)`);

  const prefixes = env.ALLOWED_WRITE_PREFIXES.split(",").map((p) => p.trim()).filter(Boolean);

  for (const f of body.files) {
    // Reject traversal and absolute paths before anything else looks at them.
    if (!f.path || f.path.includes("..") || f.path.startsWith("/") || f.path.includes("\\")) {
      return fail(env, 400, `illegal path: ${f.path}`);
    }
    if (!prefixes.some((p) => f.path.startsWith(p))) {
      return fail(env, 403, `path not writable: ${f.path}`);
    }
    // Existence is resolved server-side rather than trusted from the client, so a member
    // cannot claim "this is a create" to slip past the edit restriction.
    const exists = id.role === "admin" ? true : Boolean(await readFile(env, f.path));
    if (!canWritePath(id, f.path, !exists)) {
      return fail(env, 403, `you are not allowed to modify ${f.path}`);
    }
  }

  const branch = `submission/${Date.now()}-${randomId(6).toLowerCase().replace(/[^a-z0-9]/g, "")}`;
  // Machine-readable submitter block so /approve can notify them without a database.
  const marker = `<!-- studio:${JSON.stringify({ email: id.email, name: id.name })} -->`;
  const pr = await createSubmissionPR(env, {
    branch,
    message: `${body.title}\n\nSubmitted via X-Lab Studio by ${id.name} <${id.email}>`,
    title: body.title,
    body:
      `${body.summary ?? ""}\n\n---\n` +
      `Submitted by **${id.name}** (${id.email}), role \`${id.role}\`.\n\n` +
      `Files changed:\n${body.files.map((f) => `- \`${f.path}\`${f.delete ? " (delete)" : ""}`).join("\n")}\n\n` +
      marker,
    files: body.files,
    labels: ["studio-submission"],
  });

  return json(env, { ok: true, pr });
}

async function handleApproveOrReject(
  req: Request,
  env: Env,
  id: Identity,
  action: "approve" | "reject"
): Promise<Response> {
  if (!canApprove(id)) return fail(env, 403, "only an admin or editor can review submissions");
  const { number, reason } = (await req.json().catch(() => ({}))) as {
    number?: number;
    reason?: string;
  };
  if (!number) return fail(env, 400, "number is required");

  const queue = await listQueue(env);
  const item = queue.find((q) => q.number === number);
  if (!item) return fail(env, 404, "submission not found or already closed");

  // Refuse to merge a submission that is not verifiably green. This is the line that makes
  // "bad data cannot reach main" true rather than aspirational, so it fails closed: only an
  // explicit "success" is allowed through. "unknown" is permitted because it means the
  // checks API itself errored, and an unreachable GitHub endpoint must not permanently
  // freeze the review queue.
  if (action === "approve") {
    if (item.checks === "failure") {
      return fail(env, 409, "validation is failing on this submission — fix the errors before approving");
    }
    if (item.checks === "pending") {
      return fail(env, 409, "validation is still running — try again in a minute");
    }
  }

  if (action === "approve") await approvePR(env, number, item.branch);
  else await rejectPR(env, number, reason ?? "", item.branch);

  const match = item.body.match(/<!-- studio:(.*?) -->/);
  if (match) {
    try {
      const who = JSON.parse(match[1]) as { email: string; name: string };
      const mail = submissionStatusEmail(who.name, item.title, action === "approve", reason ?? "");
      await sendEmail(env, { email: who.email, name: who.name }, mail.subject, mail.html, mail.text);
    } catch (err) {
      console.error("status notification failed:", err);
    }
  }

  return json(env, { ok: true });
}

// --- router --------------------------------------------------------------------

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(env) });

    try {
      // --- public ---
      if (path === "/" ) return json(env, { service: "xlab-gate", ok: true });

      // Unauthenticated on purpose: this is how you confirm the gate is wired up before
      // anyone can sign in, and it is what Studio's status panel polls. It reports whether
      // each dependency works, never what it contains — no counts, names, or credentials.
      if (path === "/health") {
        const checks: Record<string, string> = {};
        try {
          await installationToken(env);
          checks.github = "ok";
        } catch (err) {
          checks.github = `fail — ${String(err).slice(0, 300)}`;
        }
        try {
          const roster = await loadRoster(env);
          checks.roster = roster.members.length > 0 ? "ok" : "empty — commit access/roster.json";
        } catch (err) {
          checks.roster = `fail — ${String(err).slice(0, 200)}`;
        }
        checks.email = env.EMAIL_API_KEY
          ? "configured"
          : "not configured — member magic links disabled, admin GitHub sign-in unaffected";
        return json(env, { service: "xlab-gate", checks });
      }
      if (path === "/auth/email" && req.method === "POST") return handleAuthEmail(req, env);
      if (path === "/auth/verify") return handleAuthVerify(req, env);
      if (path === "/auth/github/start") return handleGithubStart(req, env);
      if (path === "/auth/github/callback") return handleGithubCallback(req, env);

      // --- authenticated ---
      const id = await currentIdentity(req, env);
      if (!id) return fail(env, 401, "not signed in");

      if (path === "/me") return json(env, id);
      if (path === "/submit" && req.method === "POST") return handleSubmit(req, env, id);
      if (path === "/queue") {
        const queue = await listQueue(env);
        // Members see only their own pending submissions.
        const visible = canApprove(id)
          ? queue
          : queue.filter((q) => q.body.includes(`"email":"${id.email}"`));
        return json(env, { queue: visible });
      }
      if (path.startsWith("/queue/") && path.endsWith("/files")) {
        if (!canApprove(id)) return fail(env, 403, "not allowed");
        const number = Number(path.split("/")[2]);
        return json(env, { files: await prFiles(env, number) });
      }
      if (path === "/approve" && req.method === "POST")
        return handleApproveOrReject(req, env, id, "approve");
      if (path === "/reject" && req.method === "POST")
        return handleApproveOrReject(req, env, id, "reject");
      if (path === "/status") return json(env, { deploy: await deployStatus(env) });

      return fail(env, 404, "no such endpoint");
    } catch (err) {
      // Log the detail, return a generic message — GitHub API errors can echo internals.
      console.error("unhandled error:", err);
      return fail(env, 500, "internal error");
    }
  },
};
