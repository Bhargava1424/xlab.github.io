# Old site: tech stack & structure

Source repo: `D:\Projects\xlab-test-web` (git history preserved there, not copied here — go look at that repo directly if commit history is ever needed).

## Stack

- **Static site generator**: Hugo (`0.135.0` per `netlify.toml` / GH workflow), extended edition
- **Theme**: [Gokarna](https://github.com/526avijitgupta/gokarna) (`themes/gokarna/`, vendored in full as a subfolder — a generic blog/portfolio Hugo theme, not built for research labs). Project-level `layouts/` and `data/` extend it without modifying the theme itself.
- **Leftover from a prior stack**: `content/`, `config.backup/_default/*.yaml`, and the whole `authors`/`publication`/`post`/`event`/`people`/`tour` content structure are remnants of an earlier **Wowchemy / Hugo Academic / HugoBlox "Research Group" starter template** (see commit `e61faa1 Migrate content from React website to Hugo` and `5929408 Add X-Labs integration structure`). That migration to Gokarna was **in progress, not finished** — old Wowchemy demo content was never cleaned out, and the new Gokarna-based pages (About, Research, Open Source, News, Blog, Gallery) were never built. Only the Team page got a working Gokarna-based implementation (`layouts/team/list.html`).
- **Hosting target**: GitHub Pages via GitHub Actions (`.github/workflows/publish.yaml`) — builds with Hugo, deploys the `public/` folder using `actions/deploy-pages`. Intended custom domain was `xlab.cse.buffalo.edu` (see `baseURL` in `hugo.toml`), not a `github.io` subpath.
- **Also present but effectively unused**: `netlify.toml` and a Netlify-oriented GitHub Action (`import-publications.yml`, which auto-converts a `publications.bib` file to Markdown pages via a Python tool called `academic`) — leftover from the Wowchemy starter's default CI, not confirmed actually wired up to a live Netlify site.
- **Content management**: plain Markdown + YAML data files, no CMS wired up (Decap CMS module is imported in `config.backup/_default/module.yaml` but that's the stale pre-migration config).
- **Math rendering**: KaTeX, loaded via custom `<head>` HTML in `hugo.toml`.
- **Dark/light theme**: Gokarna's built-in toggle, extended with custom JS (`layouts/partials/theme-logo-switcher.html`) to swap the XLab logo image (black/white variants) based on theme.

## What was actually built vs. only scaffolded

| Page | Status |
|---|---|
| Team (`/team/`) | **Built** — real layout (`layouts/team/list.html`) rendering `data/team/*.yaml` into photo-card grid, grouped by Lab Lead / Staff / PhD / Grad / Undergrad / Alumni, with dark-mode CSS |
| Home (`/`) | **Placeholder only** — `layouts/index.html` just renders a centered `<h1>` title, nothing else |
| About Us, Research, Open Source, News & Media, Blog, Gallery | **Not built** — linked in the nav menu (`hugo.toml`) but no corresponding page templates or content exist. Underlying data for Research (`data/research/themes.yaml`) and Open Source (`data/opensource.yaml`) does exist and is extracted in this folder even though it was never rendered anywhere. |
| Contact | Wowchemy-era page exists (`content/contact/index.md`) but is 100% unmodified Stanford/Lorem-ipsum demo content |
| Publications | Wowchemy-era page/collection exists but all 3 sample entries are unmodified demo publications (fake DOIs, "Wowchemy Conference", Robert Ford as co-author) |

## Page inventory (every content file, verbatim list)

```
content/_index.md                              → Wowchemy demo homepage config (unused, superseded by layouts/index.html placeholder)
content/authors/admin/_index.md                → demo author "Nelson Bighetti" (Stanford robotics prof) — NOT REAL
content/authors/amir-nassereldine/avatar.png   → REAL photo, no _index.md profile page exists for them
content/authors/changjae-lee/avatar.png        → REAL photo, no _index.md profile page exists for them
content/authors/dancheng-liu/avatar.png        → REAL photo, no _index.md profile page exists for them
content/authors/jiajie-li/avatar.png           → REAL photo, no _index.md profile page exists for them
content/authors/yuting-hu/avatar.png           → REAL photo, no _index.md profile page exists for them
content/authors/吳恩達/_index.md                 → demo author "Alice Wu 吳恩達" — NOT REAL (folder name literally means "Andrew Ng" in Chinese, used as a Unicode-filename test case by the theme's original demo)
content/contact/index.md                       → Stanford/Lorem-ipsum demo — NOT REAL except the email happens to be overridden correctly elsewhere
content/event/_index.md                        → listing page config, no real content itself
content/event/ai-institute/index.md            → REAL news item
content/event/ieee-cloud-summit/index.md       → REAL news item
content/event/example/index.md                 → demo event "Wowchemy Conference" at Stanford, year 2030 — NOT REAL
content/people/index.md                        → Wowchemy "People" widget config, references non-existent user_groups; the ACTUAL team display is data/team/*.yaml + layouts/team/list.html instead
content/post/20-12-01-wowchemy-prize/index.md  → demo post, fictional person — NOT REAL
content/post/20-12-02-ICML-best-paper/index.md → demo post, fictional people — NOT REAL
content/post/llms-revolutionizing-communication/index.md → REAL blog post by Changjae Lee
content/post/llms-transforming-ai/index.md     → REAL blog post by Yuting Hu
content/publication/conference-paper/*         → demo publication — NOT REAL (includes a real-looking but fake PDF/bib)
content/publication/journal-article/*          → demo publication — NOT REAL
content/publication/preprint/*                 → demo publication — NOT REAL
content/team/_index.md                         → just front matter (title: Team, type: team), all real content comes from data/team/*.yaml via layouts/team/list.html
content/tour/index.md                          → Wowchemy "Tour" slider demo, Stanford stock photos — NOT REAL
```

## Known bugs worth knowing about (so the new site doesn't repeat them)

1. **Fuzzy photo-matching by filename is fragile.** `layouts/partials/personCard.html` guesses each person's photo by taking the first word of their name, lowercasing it, stripping hyphens, and regex-searching `static/team/` filenames. This silently failed for 2 of 17 people (hyphenated first name "Ji-Hyeon", and "Muhammad Ahmad Waseem" whose photo file uses his middle name "Ahmad") — confirmed by the site's own generated `static/team-validation.json`. **Recommendation for the new site: map each person to their photo explicitly in the data file itself, don't infer it.**
2. Several `banner`/`icon` image paths are referenced in YAML (`data/opensource.yaml`, `data/research/themes.yaml`, `data/home.yaml`) but the actual image files were never added to the repo — these are placeholders, not broken extraction on our part.
3. `repo:` URLs for 2 of the 3 open-source projects (SyncTREE, QuadraNet) point to a person's GitHub profile (`github.com/utkrshkmr`) rather than a project repo — almost certainly a "fill in later" placeholder that was never fixed.
