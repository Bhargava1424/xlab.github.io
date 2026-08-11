# Job List — Getting to a Live Lab Website

Execution checklist only. What/why/decisions live in **`SPEC.md`** — read that first, this file just tracks doing it. Check items off as they're done; keep this current, don't let it drift.

**Order changed on 2026-08-10**: full data extraction now happens *before* app scaffolding, not after. Old Phase 1 (scaffold) is now Phase 2; old Phase 3's merge work is pulled forward to the new Phase 1.

`SPEC.md` is fully locked (reviewed and confirmed 2026-08-10). Phase 1 is underway.

## Honest assessment

**Where we actually are**: everything done so far is *preparation* — research, data modeling, data extraction, a small validated slice of real content, and a separate dev tool. **There is no running website yet.** No Next.js app exists — no `package.json`, no pages, no components, no visual design, nothing that renders in a browser.

**Can we use everything we've built? Yes:**

| Artifact | How it gets used |
|---|---|
| `types/content.ts` | Imported directly by the Next.js app once it exists — this *is* application code |
| `SPEC.md` | Read while merging data (Phase 1) and building each page/component (Phase 3) |
| `content/` (the dry-run slice) | Real seed data — gets fully populated in Phase 1, ahead of any app code |
| `data-extraction/` | Source material for the full content merge (Phase 1) |
| `labbench/schema-visualizer` | Permanent dev tool — sanity-check data changes against it, never touches the deployed site |

Nothing needs to be thrown away or redone.

---

## Phase 1 — Full data extraction & content population

Do this first, in full, before any app code exists. Bulk data work — no Next.js app is needed to fill in YAML/MDX files.

- [x] Merge the remaining ~15 team members from `data-extraction/sources/01-*/extracted/team-*.yaml` into `content/people/`. Done 2026-08-11 — 15 new files, 17 people total.
- [x] Merge all ~301 publications from `data-extraction/sources/02-*/extracted/publications-*.yaml` into `content/publications/*.yaml`, generating ids per the scheme in SPEC.md §3.8. Done 2026-08-11 — 301 entries across 6 files, all ids unique.
- [x] Merge full recognitions (all 5 categories) into `content/recognitions/*.yaml`. Done 2026-08-11 — 54 entries; 25 cross-link to a real `publicationId` (verified resolvable), the rest (competition-contest submissions and non-paper professional awards) have none by design.
- [x] Merge full service records into `content/service.yaml`. Done 2026-08-11 — 52 entries across all 5 `ServiceCategory` values.
- [x] Merge full teaching records into `content/teaching.yaml`. Done 2026-08-11 — 3 courses.
- [x] Populate `content/site-meta.yaml` for real: `primaryInstitutionId: utsa`, `contact.address`/`contact.email` = UTSA's (SPEC.md §3.1). Done 2026-08-11 — address uses UTSA's public main-campus address (no department-specific address exists in any source); `contact.email` still uses his real UB email pending a UTSA-specific one, flagged inline.
- [x] Populate `content/sponsors.yaml` with one UTSA placeholder entry (SPEC.md §3.7). Done 2026-08-11.
- [x] Point `content/projects/synctree.yaml` and `quadranet.yaml`'s `links.code` at the Google-search placeholder instead of the wrong personal-profile URL (SPEC.md §3.6). Done 2026-08-11. Also assigned all 3 projects a `themeId` (previously `null` on all of them) — inferred, flagged inline, not sourced.
- [x] Copy real image assets (people, project thumbnails, logos) from `data-extraction/sources/*/assets/` into `public/images/...`, matching the paths already referenced in `content/` (e.g. `content/people/jinjun-xiong.yaml`'s `photo: /images/people/jinjun-xiong.jpg`). `public/` can be created now — it doesn't require the Next.js app to exist yet. Done 2026-08-11 — 22 real files copied (17 people + 2 logos + 3 post images before the 2 new posts brought it to 4); extension mismatches in the pre-existing dry-run files fixed to match actual formats. Still missing: a real sponsor logo (no UTSA logo image in any source) and all 3 project thumbnails (never existed in any source) — not fabricated, left as pre-existing gaps.
- [x] Resolve the `joined`/`left`-year gaps for PhD students with no recorded tenure dates — backfill or leave blank, per SPEC.md §7. Resolved as "leave blank" (the SPEC's own leaning) for all 15 new people — none had source data to backfill from.
- [ ] Resolve Recognition attribution for entries where the PI isn't first author (SPEC.md §7) — decide per-entry, don't default to the PI. Still open — all 54 entries currently carry `personId: jinjun-xiong`, matching how the source itself presents them (not re-attributed).
- [ ] Decide alumni "current employer" handling — new field vs. inferred from most recent `affiliations` entry (SPEC.md §7). Still open, currently moot — no one's `labTenure.leftYear` is set yet (see above), so there are no alumni cards to have this problem yet.
- [x] Manual sanity pass over the full merged dataset — no Zod loader exists yet (that's Phase 2), so this is a by-hand check plus the same "does every field make sense" instinct `labbench/schema-visualizer` encourages. Done 2026-08-11 — verified 0 broken `personId`/`institutionId`/`themeId`/`publicationId` cross-references across all of `content/`.

## Phase 2 — Scaffold the application

Nothing below this can be *seen* until it's done.

- [x] Initialize Next.js at repo root (manual scaffold — static export mode, TypeScript, App Router). Done 2026-08-11 — Next.js 16.3, React 19.2, at repo root alongside `content/`, `types/`, not nested.
- [x] Set `next.config` to `output: 'export'`. No `basePath`. Done 2026-08-11 — `next.config.ts`, also pins `outputFileTracingRoot` so `labbench/`'s own lockfile doesn't confuse workspace-root inference.
- [x] Install and configure Tailwind CSS. Done 2026-08-11 — Tailwind v4 (CSS-first, `@tailwindcss/postcss`), confirmed compiling real utility CSS into the static export.
- [x] Install and configure shadcn/ui (base theme only — real design work is Phase 5). Done 2026-08-11 — `components.json` (new-york/neutral), `lib/utils.ts` (`cn`), `components/ui/{button,card,badge}.tsx` via the shadcn CLI, theme CSS vars (light+dark) hand-added to `app/globals.css` since the CLI didn't inject them into a pre-existing minimal globals.css.
- [x] **Explicitly exclude `labbench/` from the root build/workspace.** Done 2026-08-11 — excluded in `tsconfig.json`, root `next build` never lists/touches any `labbench/` file (confirmed in build output); it keeps its own `package.json`/`node_modules` untouched.
- [x] Build `lib/content/` — read YAML (`js-yaml`) and MDX (`gray-matter`) from `content/`, validate every record against a Zod schema mirroring `types/content.ts`, export typed getters. Done 2026-08-11 — `lib/content/schema.ts` (Zod mirror) + `lib/content/loader.ts` (fs/YAML/MDX readers, errors collected across *all* files instead of failing on the first) + `lib/content/index.ts` (`getSiteMeta`, `getAllPeople`/`getPersonById`/`getCurrentPeople`/`getAlumniPeople`, `getPublications`/`getPublicationsByCategory`/`getFeaturedPublications`, `getAllProjects`/`getProjectsByTheme`, `getResearchThemes`, `getAllPosts`/`getPostsByKind`, `getAllRecognitions`/`getRecognitionsByPerson`, `getAllServiceRecords`, `getAllCourses`, `getAllSponsors`, `getAllInstitutions`/`getInstitutionById`, `getStats()` for the derived-count fields SPEC.md §4 calls for instead of a storable summary field).
- [x] Fix whatever the Zod validation pass turns up. Done 2026-08-11 — ran against the full Phase 1 dataset (301 publications, 17 people, 54 recognitions, etc.): zero validation errors, nothing needed fixing. Cross-checked separately (by hand, ahead of this) that every `personId`/`institutionId`/`themeId`/`publicationId` reference across all of `content/` resolves — also zero broken links.
- [x] Add `.github/workflows/deploy.yml` — build + deploy to GitHub Pages on push to `main`. Done 2026-08-11 — adapted from the Hugo reference (`data-extraction/sources/01-*/reference-docs/gh-workflow-publish.yaml`): `npm ci` + `npm run build` (root lockfile only, never touches `labbench/`) + `actions/upload-pages-artifact` on `./out` + `actions/deploy-pages`.
- [x] Verify: a real (even blank/placeholder) page builds, exports statically, and deploys. Done 2026-08-11 — `npm run build` produces `out/index.html` etc.; confirmed the rendered static HTML shows real Phase-1 numbers pulled live through the Zod-validated loader (301 publications / 17 lab members / 3 projects), not placeholders. Actual GitHub Pages deploy not triggered yet (needs a push to `main` + Pages enabled on the repo — outside what a local build can confirm).

## Phase 3 — Build real pages

Against the full dataset from Phase 1. IA and per-entity placement: `SPEC.md` §5–6.

- [ ] Root layout: nav bar (anchor links + real routes, per `SPEC.md` §5), footer.
- [ ] Home, section by section: Hero → `#research` → `#team` (current + alumni together, redirect-out cards) → recruitingNotice banner → `#news` → Featured Publications → `#teaching` → `#sponsors` → Footer.
- [ ] `/publications` with 6 category tabs.
- [ ] `/blog` archive + `/blog/<slug>` detail pages.
- [ ] Team card redirect logic: `links.website` → `linkedin` → `github` → `scholar` → Google Scholar search fallback (`SPEC.md` §3.4).
- [ ] Confirm image assets from Phase 1 render correctly across all pages.
- [ ] Smoke-test every page/section in a real browser, not just a successful build — golden path and empty/sparse-data states (e.g. a minimal person record should render cleanly, not break).

## Phase 4 — Data/content QA pass

- [ ] Re-run the Phase 2 Zod validation against the fully-populated dataset once more after Phase 3's page-building surfaces any real-world rendering issues.
- [ ] Cross-check in `labbench/schema-visualizer`'s Data Explorer-style thinking (not the tool itself — it only reads synthetic data) as a final sanity pass on the real merged data.

## Phase 5 — Design & polish

The part that makes it *not* a poloclub reskin — `SPEC.md` §1.

- [ ] Real visual design pass: type system, color palette, spacing — distinct from poloclub's Bootstrap/gold-accent look.
- [ ] Responsive/mobile pass on every page built in Phase 3.
- [ ] Accessibility pass (contrast, focus states, alt text — `Person.photo` alt text especially).
- [ ] Dark mode, if wanted (`SiteMeta.logo.{light,dark}` already supports this).
- [ ] SEO: meta tags, favicon, social share card image.
- [ ] Performance check: image optimization, bundle size (Next.js static export + `next/image` needs a loader config for static export — confirm image handling strategy early).

## Phase 6 — Launch

- [ ] Final full-site review against `SPEC.md` §6 — every field accounted for, nothing silently dropped.
- [ ] Confirm GitHub Pages deployment is live and correct at the real domain.
- [ ] Decide on custom domain vs. default `xlab.github.io`.
- [ ] Post-launch: revisit `labbench/schema-visualizer` if the schema changes — keep `schema-graph.ts` in sync manually (documented, known drift risk).
