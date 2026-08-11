# Job List — Getting to a Live Lab Website

Status check + task tracker. Read the "Honest assessment" section first — it answers the "was this overkill / any mistakes / can we use it" questions directly — then use the phased checklist below as the actual working plan. Check items off as they're done; keep this file current, don't let it drift like a stale doc.

## Honest assessment

**Where we actually are**: everything done so far is *preparation* — research, data modeling, data extraction, a small validated slice of real content, and a separate dev tool. **There is no running website yet.** No Next.js app exists — no `package.json`, no pages, no components, no visual design, nothing that renders in a browser. That's the single most important fact in this file: the next phase is the first phase where a visitor could actually see something.

**Was it overkill?** Partially, honestly. The schema design, the data extraction, and the content-placement mapping were all necessary and are directly usable (see below) — you can't populate a lab site without knowing what content exists and where it goes, and validating the schema against real data before mass-populating or building UI is cheaper than discovering schema flaws after 50 components depend on it. The one piece that went further than strictly required for a lab site of this size is `labbench/schema-visualizer` — a fully interactive ER diagram + data explorer + synthetic-data generator. It's genuinely useful (it already caught real bugs: a broken drag handler, an overlapping layout, unrelatable fake data, a missing author-linking gap) and it's a permanent asset now that it exists, but if the goal had been "fastest path to a live site," that tool wouldn't have been necessary to build it. Not asking to undo it — it's done, it works, keep it — just naming it honestly as the most "extra" part of the work so far.

**Any mistakes?** One real one, already fixed: `Publication.authors` and `Project` originally had no way to link to real `Person` records at all (see the conversation where this got caught and corrected — `docs/SCHEMA.md`'s "Mongo, not SQL" principle). Beyond that, no structural mistakes found, but **one real unverified risk**: the schema has only ever been checked by hand-inspection and by `labbench`'s manually-maintained JS re-encoding of it (`labbench/schema-visualizer/src/lib/schema-graph.ts`, which is *not* automatically synced with `types/content.ts` — see that tool's own README). It has never been exercised by an actual data-loading pipeline (YAML parsing, Zod validation, a real Next.js app importing `types/content.ts`). That's unverified until Phase 1 below happens — treat it as the highest-value next check, not a confirmed problem.

**Can we use everything we've built? Yes — concretely:**
| Artifact | How it gets used |
|---|---|
| `types/content.ts` | Imported directly by the Next.js app once it exists — this *is* application code, not just documentation |
| `docs/SCHEMA.md`, `docs/content-placement/` | Read while building each page/component — they already specify what each page needs and why |
| `content/` (the dry-run slice) | Real seed data — build the first working pages against this small real set rather than waiting for full population |
| `data-extraction/` | Source material for the full content merge (Phase 2 below) |
| `labbench/schema-visualizer` | Stays as a permanent dev tool — verify data changes against it, never touches the deployed site |

Nothing needs to be thrown away or redone. The plan doesn't change — it just hasn't been executed as actual application code yet.

## Consolidated open decisions (blocking or worth resolving before/during the phases below)

Pulled from across `docs/SCHEMA.md`, `content/README.md`, and `docs/content-placement/*.md` into one place so they don't get lost in 13 separate files:

1. **Which institution's identity/address represents the live site** (`content/site-meta.yaml`'s `contact`/`primaryInstitutionId` are currently `null` on purpose) — the lab currently spans UB and UTSA; this needs an actual decision, not a schema fix.
2. **Is `/blog` a separate nav route from `/news`**, or folded into one feed with a kind filter? (`docs/content-placement/site-map.md`)
3. **Publications nav**: all 6 categories as tabs on one `/publications` page (assumed in the docs) vs. separate nav entries?
4. **Person detail-page threshold**: proposed rule is "profile OR 2+ affiliations OR any Recognition/Service/Course records" — confirm before the team page is built, since it determines who gets a `/team/<slug>` page vs. a card-only entry.
5. **Recognition/ServiceRecord/Course placement**: currently designed to render on the owning person's page, not as top-level site sections (a deliberate departure from how the real `xlab-ub.com` site presents them) — confirm this is still the intended structure.
6. **Real repo URLs for 2 of 3 open-source projects** (SyncTREE, QuadraNet currently point at a person's GitHub profile, not a project repo) — `content/projects/synctree.yaml`, `quadranet.yaml`.
7. **Real sponsor data** — `content/sponsors.yaml` is empty; no source has any yet.
8. **`Publication.id` generation scheme** — needs to be picked once and frozen before the full ~301-entry import (Phase 2), since `Project`/`Recognition` cross-links depend on ids being stable.

None of these block starting Phase 1 (app scaffolding) — they matter before/during Phase 2–3 (content population and page-building for the specific pages they affect).

---

## Phase 1 — Scaffold the actual application

Nothing below Phase 1 can be *seen* until this is done. This is the highest-priority phase.

- [ ] Initialize Next.js at repo root (`create-next-app` or manual — static export mode, TypeScript, App Router). Keep it at repo root alongside `content/`, `types/`, `docs/` — not nested in a subfolder.
- [ ] Set `next.config` to `output: 'export'`. No `basePath` needed — `xlab.github.io` is a user/org-level GitHub Pages site served at the domain root, not a project page under a subpath.
- [ ] Install and configure Tailwind CSS.
- [ ] Install and configure shadcn/ui (base theme only — real design work is Phase 4, don't design now).
- [ ] **Explicitly exclude `labbench/` from the root build/workspace.** It has its own `package.json`/`node_modules` — if npm/pnpm workspaces get configured at root, make sure `labbench` is not swept in. Confirm `next build` never touches that folder.
- [ ] Build `lib/content/` — the real data-loading layer: read YAML (`js-yaml`) and MDX (`gray-matter`) from `content/`, validate every record against a Zod schema mirroring `types/content.ts`, export typed getters (`getAllPeople()`, `getPersonBySlug(id)`, `getPublications()`, `getProjectsByTheme(themeId)`, etc.). **This is the step that actually tests whether the schema/content designed so far is real or theoretical.**
- [ ] Fix whatever the Zod validation pass turns up (expect at least minor surprises — that's the point of doing this now, on 15 real records, instead of after Phase 2's ~350).
- [ ] Add `.github/workflows/deploy.yml` — build + deploy to GitHub Pages on push to `main` (reference pattern: `data-extraction/sources/01-*/reference-docs/gh-workflow-publish.yaml`, adapted from Hugo to Next.js static export).
- [ ] Verify: a real (even blank/placeholder) page builds, exports statically, and deploys — confirm the pipeline works end to end before building real pages on top of it.

## Phase 2 — Build real pages against the small real dataset

Deliberately build against the *existing* small `content/` slice (2 people, 3 projects, 3 publications, etc.) rather than waiting for full population — catches component/data mismatches early, on data you already know is correct.

- [ ] Root layout: nav bar from `SiteMeta.nav`, footer (`docs/content-placement/site-meta.md`).
- [ ] Home page, section by section, in the order specified in `docs/content-placement/site-map.md`: Hero → current-team strip → Latest News → Research sections w/ Project cards → Featured Publications → Teaching → Sponsors.
- [ ] `/research` (full version of the Home research sections).
- [ ] `/publications` with category tabs.
- [ ] `/team` grid + `/team/<slug>` detail pages (apply the threshold rule from open decision #4 once confirmed).
- [ ] `/news` + `/blog` feeds and detail pages (resolve open decision #2 first).
- [ ] Copy real image assets from `data-extraction/sources/*/assets/` into `public/images/...`, matching the paths already referenced in `content/` (e.g. `content/people/jinjun-xiong.yaml`'s `photo: /images/people/jinjun-xiong.jpg`).
- [ ] Smoke-test every page in a real browser, not just a successful build — check the golden path and empty/sparse-data states (e.g. `ji-hyeon-yoo`'s minimal record should render cleanly, not break).

## Phase 3 — Full content merge

Now that pages exist and are proven against the small slice, scale up the data. This is bulk data work, not design work — can happen in parallel with Phase 4.

- [ ] Merge the remaining ~15 team members from `data-extraction/sources/01-*/extracted/team-*.yaml` into `content/people/`.
- [ ] Merge all ~301 publications from `data-extraction/sources/02-*/extracted/publications-*.yaml` into `content/publications/*.yaml` (resolve open decision #8 — the id scheme — before bulk-importing).
- [ ] Merge full recognitions/service/teaching records.
- [ ] Resolve open decision #1 (site identity/address) and populate `content/site-meta.yaml` for real.
- [ ] Re-run the Phase 1 Zod validation against the full dataset — expect to find a few more edge cases at this volume that 15 records didn't surface.
- [ ] Cross-check in `labbench/schema-visualizer`'s Data Explorer-style thinking (not the tool itself, since it only reads synthetic data — just the same "does every field make sense" instinct) as a sanity pass on the real merged data.

## Phase 4 — Design & polish

The part that makes it *not* a poloclub reskin — see `docs/PLAN.md` section 2.

- [ ] Real visual design pass: type system, color palette, spacing — distinct from poloclub's Bootstrap/gold-accent look.
- [ ] Responsive/mobile pass on every page built in Phase 2.
- [ ] Accessibility pass (contrast, focus states, alt text — `Person.photo` alt text especially, given every image needs one).
- [ ] Dark mode, if wanted (the schema already carries `SiteMeta.logo.{light,dark}` for this).
- [ ] SEO: meta tags, favicon, social share card image.
- [ ] Performance check: image optimization, bundle size (Next.js static export + image `next/image` doesn't work in static export without a loader config — confirm image handling strategy early, not at the end).

## Phase 5 — Launch

- [ ] Final full-site review against `docs/content-placement/` — every field accounted for, nothing silently dropped.
- [ ] Confirm GitHub Pages deployment is live and correct at the real domain.
- [ ] Decide on custom domain vs. default `xlab.github.io` (ties back to open decision #1).
- [ ] Post-launch: revisit `labbench/schema-visualizer` if the schema changes — keep `schema-graph.ts` in sync manually (documented, known drift risk).
