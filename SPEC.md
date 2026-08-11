# X-Lab Website — Spec

Single source of truth for what this site is, how it's built, and what goes where.

**Supersedes and replaces** `docs/PLAN.md`, `docs/SCHEMA.md`, `docs/content-placement/*` (12 files), and `content/README.md`. Those are deleted — don't recreate them, and don't split this back out into per-entity files. `types/content.ts` stays the literal field-level source of truth for data shapes; this doc explains what those fields mean and where they render on the site, it doesn't restate every field.

`JOBS.md` is the execution checklist that implements this spec, phase by phase. If the two ever disagree, this file wins — fix JOBS.md.

All decisions below are locked as of 2026-08-10 — §3.8 (Publication.id scheme) and §5 (`/research`/`/team` as Home-only anchors) were the last two open items and are now resolved.

---

## 1. What this is

X-Lab is an academic AI-systems research lab site. The PI's affiliation spans two institutions — University at Buffalo, and, as of March 2026, Founding Dean of UT San Antonio's new College of AI, Cyber and Computing. The site's institutional identity is **UTSA** (decision #1 below).

Structural inspiration is [poloclub.github.io](https://poloclub.github.io/) (Georgia Tech): one long-scroll homepage with anchor nav, data-driven cards fed by structured files instead of hand-written HTML per entry, and a couple of standalone pages for the handful of things that genuinely don't fit in a scroll. We're borrowing that structure, not poloclub's Bootstrap/gold visual theme — real visual design is a later phase, and the result should read as clearly ours.

## 2. Stack & hosting (locked)

- **Next.js**, static export (`output: 'export'`), TypeScript, App Router.
- **Tailwind CSS** + **shadcn/ui** (base theme for now — real design pass is a later phase).
- **GitHub Pages**, `xlab.github.io`, served at the domain root — no `basePath`.
- **Hard constraint: fully static.** No API routes, no server actions, no middleware, no ISR, no request-time SSR. Anything that needs to feel dynamic (search/filter, animations, stat counters) runs client-side against the static bundle, not a backend.
- No backend / FastAPI in scope. Revisit only if a genuine server-side need shows up later (e.g. a contact form) — don't let one creep in via a Next.js feature that assumes a server.
- `labbench/` (dev-only tooling, e.g. `schema-visualizer`) stays fully outside the root build/workspace — has its own `package.json`/`node_modules`, `next build` must never touch it.

## 3. Decisions

| # | Question | Decision |
|---|---|---|
| 1 | Which institution represents the live site's identity/address? | **UTSA.** `content/site-meta.yaml`: `primaryInstitutionId: utsa`, `contact.address` = UTSA's address. |
| 2 | Is `/blog` a separate route from `/news`? | **News has no route at all.** It's a Home-only section (`#news` anchor), recent items only, no archive page. **`/blog` is a real separate route** (+ always-generated `/blog/<slug>`), matching poloclub's own pattern of mixing in-page anchors with a couple of standalone pages in the same navbar. |
| 3 | Publications: tabs on one page, or separate nav entries? | Stays **one `/publications` page, 6 category tabs.** This is the one place a dedicated route is clearly justified — ~301 entries can't live in a home scroll. General rule going forward: default to Home content, poloclub-style; only add a route when content genuinely can't fit inline. The old `docs/content-placement` docs leaned toward a route per entity — don't keep following that instinct. |
| 4 | Team member detail pages — what's the threshold? | **No `/team/<slug>` pages, for anyone, for now.** Every card is a plain outbound redirect. Priority order: `links.website` → `links.linkedin` → `links.github` → `links.scholar` → fallback: auto-generated Google Scholar search for their name (`scholar.google.com/scholar?q=<name>`). Real links get collected and filled in over time; the fallback just means launch isn't blocked on having them all. |
| 5 | Where do Recognition / ServiceRecord / Course render, given #4? | Not on a per-person page — there isn't one. **Course** still gets its poloclub-equivalent: a consolidated Teaching table on Home, across everyone. **Recognition** and **ServiceRecord** have no site placement right now — this is *not* the `xlab-ub.com` CV-page structure. Possible future exception: a one-off dedicated page for the PI (Jinjun Xiong) that could use this data — a bespoke page, not a generic per-person template. Not in scope for Phases 1–3. |
| 6 | SyncTREE / QuadraNet have no real repo — what do the links do? | **Placeholder**, until real repos are known: point `links.code` at a Google search for `"<title> GitHub"` instead of the current (wrong) personal-profile URL. Swap for the real repo the moment it's confirmed. |
| 7 | Sponsor data? | `content/sponsors.yaml` gets **one placeholder entry: UTSA** — standing in until real grant sponsors are collected. |
| 8 | Publication.id scheme? | **Decided:** `{category}-{year}-{slug of the first ~5 significant words of the title}`, e.g. `conference-2023-quadranet-hardware-aware`. Year falls back to `filedDate`/`issuedDate` year for patents, or `undated` in the rare case no year exists at all. On a collision (two entries would generate the same id), append `-2`, `-3`, ... in encounter order. Simple, deterministic, human-readable in diffs — no reason to reach for anything fancier (hashes, sequence counters) for ~301 records. Frozen from first use in the Phase 1 bulk import. |

## 4. Content model

**"Mongo, not SQL"**: every relationship between entities is an optional id reference — never required, never validated for referential integrity at write time. A record can exist with the reference unset; content gets added incrementally, imported in bulk, and linked up later without a migration.

Entities (`types/content.ts` is the literal field source; this is what each one is *for*):

- **Institution** — lookup table for `Person`/`Course` references. Not a general org registry — award-granting orgs like "IBM Research" stay free text on `Recognition`.
- **Person** — one file per person, `content/people/<slug>.yaml`. `photo` is always an explicit path, never fuzzy-filename-matched. `labTenure` (is this person a current lab member) is independent of `affiliations` (which institution(s), historically) — collapsing the two breaks the moment someone's institutional tie outlives their lab involvement, or the reverse.
- **PersonProfile** — the rich bio extension (education, research philosophy, research agenda). No stored "150+ publications" summary field — derived at build time from `Publication`/`Recognition` counts so it can't drift.
- **ResearchTheme** — a titled research area, can hold zero or more `Project`s.
- **Project** — the poloclub card unit. `collaborationWith` is a free-text **external** org name; `contributors` is the actual `Person` link (lab members) — populate only when confirmed, never guessed.
- **Publication** — one shape across all 6 categories, discriminated by `category`. `id` is generated once, then immutable (§3.8) — other entities reference it. `authors` is `{name, personId?}[]`: `name` is always the display source of truth, `personId` is set only for confirmed lab members (mixed linked/plain-text author lists are normal, not a bug).
- **Post** — News and Blog unified via `kind`.
- **SiteMeta** — singleton, sitewide chrome (nav/header/footer/SEO), not page content.
- **Recognition** — the sole authority for "this won an award" (`Publication.note` is for non-award annotations only — "in press", "Spotlight" — so award facts never live in two places).
- **ServiceRecord** — `periodDisplay` is the required, real source of truth (irregular real periods like "2010–2012, 2015, 2018–2019"); `startYear`/`endYear` are best-effort only, populated only when a record cleanly parses as one range.
- **Course** — simple list, no invented enrollment data.
- **Sponsor** — logo grid entity.

File layout:

```
content/
  site-meta.yaml
  institutions.yaml
  people/<slug>.yaml
  research/themes.yaml
  projects/<slug>.yaml
  publications/{patents,journals,conferences,workshops,invited-papers,book-chapters}.yaml
  posts/<yyyy-mm-dd>-<slug>.mdx
  recognitions/{best-paper-awards,best-paper-nominations,best-poster-awards,international-competition-awards,professional-honor-awards}.yaml
  service.yaml
  teaching.yaml
  sponsors.yaml

public/images/
  people/<slug>.jpg
  projects/<slug>/thumbnail.jpg
  posts/<slug>.jpg
  logos/...
  sponsors/<slug>.png
```

Per-record files for `people/`/`projects/` (hand-curated, one edit at a time); per-category array files for `publications/`/`recognitions/` (bulk historical/imported data, no per-record editing benefit). YAML for hand-authored data, MDX for `posts/` where a real markdown body exists. `lib/content/` (built in Phase 2) validates every file against a Zod mirror of `types/content.ts`, failing the build on drift.

## 5. Information architecture

```
/                     Home — single long scroll, poloclub-style. Sections below are
                      in-page anchors (#id), not routes, unless noted otherwise.
  ├─ Hero             SiteMeta.title/tagline/logo + computed stats
  ├─ #research        ResearchTheme × N, each with its Project cards inline.
                      No separate /research page — short + long description
                      both live here (6 themes fit fine in a scroll).
  ├─ #team            Person, current + alumni together, poloclub-style — the full
                      roster, not just a "current member" preview strip. Every
                      card redirects out per decision #4.
                      No separate /team page, same reasoning as above.
  ├─ recruitingNotice  Banner, placed at/right after #team
  ├─ #news            Post (kind=news), most recent N. No archive, no route —
                      this is the entire News presence on the site (decision #2).
  ├─ Featured Publications   Publication (featured=true), highlight strip
  ├─ #teaching        Course × all — consolidated table, no invented enrollment data
  ├─ #sponsors        Sponsor × all — logo grid + grantNumbers blurb
  └─ Footer           SiteMeta.contact / socialLinks / copyright

/publications         Publication, 6 category tabs (Patents / Journals /
                      Conferences / Workshops / Invited Papers / Book Chapters),
                      sorted year-desc within each tab

/blog                 Post (kind=blog), full chronological archive
  └─ /blog/<slug>      Always generated — blog posts are expected to have a body

(no page)             Institution, Sponsor, Project — resolved/rendered inline
                      wherever referenced, never their own browsable route
```

Nav bar mixes anchor links (`#research`, `#team`, `#news`, `#teaching`, `#sponsors` — scroll within Home) with real routes (`/publications`, `/blog`) — same pattern poloclub uses in its own navbar. Exact `SiteMeta.nav` array gets finalized during Phase 3 (page-building), not here.

## 6. Page-by-page placement

**Institution** — lookup only, never its own page. Resolved inline in a Person's affiliation history and a Course's institution line. `shortName` in compact spots (team card tag), `name` elsewhere. `logo` has no UI slot currently.

**Person** — `#team` gets everyone, current + alumni, grouped by `personType`, current/alumni split via `labTenure.leftYear` (null/absent = current). Card: photo, name, roleTitle, institution `shortName` tag, tenure years, link-icon row — click target follows decision #4's priority order. `secondaryTitles`, `office`, `bio`, and all of `profile.*` (education/researchPhilosophy/researchInterests/researchAgenda/futureVision/quote) are collected but **not rendered anywhere right now**, since there's no detail page — kept in the schema for the possible future PI page (see §3.5). `sortWeight` is internal ordering only.

**ResearchTheme** — `#research` section: icon + title + `shortDescription` + `longDescription`, both together (no separate `/research` page, §5). A theme with zero `Project`s still renders fine as heading + description.

**Project** — a card inside its theme's grid. `title`/`tagline`/`thumbnail`, `status` badge ("Deployed"), `collaborationWith` badge ("🤝 Collaboration with X"), `contributors` (small linked-avatar row, populate only when confirmed), link-icon row (`paperUrl`/`publicationId` → PDF icon, `code`, `demo`, `video`, `poster`, `website`). `description` is not shown, matching poloclub's own card omission. **No detail page, ever** — cards link out.

**Publication** — `/publications`, one list per category tab, year-desc. Entry: title, authors (mixed linked/plain-text — only authors with a confirmed `personId` link out), venue (italic), year/`dateDisplay`/`month`, location (conference/workshop only), `note` badge ("Spotlight"/"in press" — never award info, see Recognition), doi/url/pdfUrl icons. Category-specific line: patent metadata / `volumeIssue` / book+editors+publisher. `featured` publications also appear in Home's Featured Publications strip, ordered there by `featuredOrder` (independent of the chronological `/publications` order).

**Post** — `kind=news` → Home `#news` only (decision #2): feed entry, no detail page ever, regardless of whether `body` is set. `kind=blog` → `/blog` archive + always-generated `/blog/<slug>`. Fields: `date`, `title`, `summary`, `body` (blog only), `image`, `authorId` ("by [Name]" byline — rare on news), `tags` (blog archive filter), `sourceUrl` ("Read more →"), `relatedPublicationId` (inline citation link).

**SiteMeta** — sitewide chrome, not page content. `title`/`logo` → `<title>` + header; `tagline` → hero; `description`/`keywords` → SEO meta only; `nav[]` → navbar (§5); `contact` → footer; `primaryInstitutionId` → `utsa`, convenience-only, never the literal source of the address text; `recruitingNotice` → banner near `#team`; `socialLinks` → header + footer icon row; `logo.light`/`logo.dark` → theme-aware header swap.

**Recognition / ServiceRecord** — no current placement. Data still gets extracted and populated (see `JOBS.md` Phase 1) but sits unused on the site until a future PI-specific page exists (§3.5). Don't build generic per-person rendering for these in Phases 1–3.

**Course** — Home `#teaching` consolidated table only (no per-person section — there's no per-person page). Columns: instructor (resolved `personId` → name), code + title, institution (resolved `institutionId`, or `institutionName` fallback for one-off courses taught outside the lab's own institutions), `termDisplay` raw text. No enrollment/attendance data invented.

**Sponsor** — Home `#sponsors` logo grid + `grantNumbers` text blurb underneath, bottom of the scroll. No dedicated page.

## 7. Deferred / open items

Things intentionally left for later — don't block on these, but don't lose track of them either:

- **Recognition attribution** — whose achievement is it when the PI isn't first author (e.g. "C. Li et al.")? Decide per-entry during the Phase 1 merge; don't default them all to the PI.
- **PhD students with no `joined`/`left` year in the source data** — backfill approximate years, or leave blank? Leaning: leave blank rather than invent; revisit if the Team section looks sparse.
- **Alumni "current employer" display** — schema has no dedicated field; poloclub shows this prominently. Add a field or infer from the most recent `affiliations` entry, during the Phase 1 merge.
- **`Institution.logo`** — no planned UI slot; revisit only if an "affiliated institutions" strip is ever wanted.
- **Real SyncTREE/QuadraNet repos** — replace the §3.6 placeholder once known.
- **Real sponsor data** beyond the UTSA placeholder (§3.7).
- **Possible future one-off PI bio page** (a bespoke route, not `/team/<slug>`) surfacing `PersonProfile`/`Recognition`/`ServiceRecord`/`Course` — not scheduled, not part of Phases 1–3.
