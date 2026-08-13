# xlab-gate

The auth and repo-write gateway for X-Lab Studio. Runs on Cloudflare Workers (free tier).

This is the **only** component in the system that holds a GitHub credential. No human — not
even the site owner — needs write access to the repo.

## Why it is built the way it is

**It is deliberately schema-blind.** It checks who you are, which path you may write, and
how large the payload is. It knows nothing about Person, Publication, or any other content
type. Schema correctness is enforced in CI on the pull request it opens
(`.github/workflows/validate.yml`).

That is what makes "set it up once and never touch it again" literally true: adding a field
or a whole content type to the site never requires redeploying this Worker.

**Every write is a pull request.** There is no "commit straight to main" function in the
codebase, not even for admins. Every change is therefore reviewable, diffable, and
revertable by construction rather than by policy.

**A GitHub App, not a personal access token.** Fine-grained PATs expire after at most 366
days; App private keys do not. A PAT would mean the write path silently breaks a year after
setup, which is exactly the failure mode this project is meant to avoid.

## One-time setup

### 1. Cloudflare

```bash
npx wrangler login
```

Register a `workers.dev` subdomain (once per account) at
**Workers & Pages → Overview → Manage subdomain** in the dashboard. Until you do, the Worker
deploys successfully but its URL does not resolve.

The KV namespace is already created and bound in `wrangler.jsonc`. It holds only
short-lived state — magic-link nonces and rate-limit counters. The source of truth for
content and roster is the git repo, so losing this namespace costs nothing but in-flight
sign-in links.

### 2. GitHub App

Create at **github.com/settings/apps/new**:

| Setting | Value |
|---|---|
| Name | `X-Lab Studio Gate` |
| Homepage URL | your site URL |
| Callback / Redirect URI | `https://<worker-url>/auth/github/callback` |
| Expire user authorization tokens | unchecked |
| Webhook → Active | **unchecked** |
| Repository permission: Contents | Read and write |
| Repository permission: Pull requests | Read and write |
| Repository permission: **Workflows** | **No access** (deliberate — nothing here can alter CI) |
| Where can this be installed | Only on this account |

Then **Install App** onto `<owner>/<repo>` only, and collect: App ID, Client ID, a generated
client secret, and a generated private key (`.pem`).

The `.pem` GitHub gives you is PKCS#1. No conversion needed — the Worker wraps it into
PKCS#8 at runtime (`src/crypto.ts`), because Web Crypto only imports PKCS#8 and an
`openssl` step is easy to get wrong and easy to forget.

### 3. Email

Set `EMAIL_PROVIDER` in `wrangler.jsonc` to `brevo` or `resend`, and `EMAIL_FROM` to the
sending address.

- **brevo** — verifies a single sender *address* (a Gmail works). No domain required.
  300/day free.
- **resend** — requires a verified *domain you own* before it will mail arbitrary
  recipients. 3,000/month free.

Both are supported behind one interface (`src/email.ts`), so switching later is a config
change plus a new secret — not a code change.

### 4. Secrets

Run from this directory. These go straight from your machine into Cloudflare — they never
touch the repo, a build artifact, or a log line.

```bash
npx wrangler secret put GITHUB_APP_ID           # the numeric App ID
npx wrangler secret put GITHUB_APP_PRIVATE_KEY  # paste the whole .pem, BEGIN/END lines included
npx wrangler secret put GITHUB_CLIENT_ID
npx wrangler secret put GITHUB_CLIENT_SECRET
npx wrangler secret put EMAIL_API_KEY
npx wrangler secret put SESSION_SECRET          # any random 32+ char string
```

Generate a session secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

### 5. Roster

Edit `access/roster.json` in the repo root so it lists you with `"role": "admin"` and your
real email, then commit. Sign-in is checked against that file, so nobody can authenticate
until it is committed to `main`.

### 6. Deploy

```bash
npx wrangler deploy
```

## Endpoints

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/email` | — | Request a magic link. Always returns the same response whether or not the address is on the roster, so it cannot be used to enumerate lab members |
| GET | `/auth/verify` | — | Redeem a magic link (single-use, 15 min) and issue a session |
| GET | `/auth/github/start` · `/callback` | — | Admin sign-in via GitHub, so admin access rests on GitHub 2FA rather than an inbox |
| GET | `/me` | session | Current identity and role |
| POST | `/submit` | session | Open a submission PR |
| GET | `/queue` | session | Open submissions (members see only their own) |
| GET | `/queue/:n/files` | admin/editor | Field-level diff for one submission |
| POST | `/approve` · `/reject` | admin/editor | Merge or close, and email the submitter |
| GET | `/status` | session | Latest deploy run |

## Security properties

- No GitHub credential ever reaches a browser. Sessions are HMAC-signed bearer tokens.
- Path allowlist (`content/`, `public/images/`) plus traversal rejection is applied *before*
  any GitHub token is minted.
- Members may edit only their own person record; "is this a create?" is resolved
  server-side, never trusted from the client.
- Magic links are single-use — the nonce is burned in KV on redemption, so a replayed link
  fails even inside its validity window.
- OAuth uses single-use `state` values for CSRF protection.
- Approval refuses to merge a submission whose CI gate is failing.
- Rate limiting per email and per IP on the magic-link endpoint.
- Errors are logged in full but returned generically, so GitHub API internals are not echoed.

## Local development

```bash
npm run dev        # wrangler dev
npm run typecheck
npx tsx src/crypto.test.mts   # token forgery/expiry + PKCS#1 key import
npm run tail       # live production logs
```
