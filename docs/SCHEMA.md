# Content Data Schema

The content model the site is built against. TypeScript source of truth: `types/content.ts`. This doc explains the *why* behind the shape; see that file for the exact fields.

Designed against two constraints established while planning this (see `docs/PLAN.md`):
1. Modeled on what a poloclub-style lab site structurally needs (people, research areas with project cards, publications, news, courses, sponsors) — not just whatever fields happened to exist in the raw data we collected.
2. Nothing hardcodes a single institution. The lab's affiliation situation is real, ongoing, and multi-institutional, so affiliation is a per-person, historical concept, not a sitewide constant.

## Entities

### Core

- **`Institution`** — lookup table so `Affiliation` records reference an institution instead of retyping strings. Scoped narrowly: only for places people are affiliated with, not a general org registry (award-granting orgs like "IBM Research" stay free text on `Recognition`).
- **`Affiliation`** — embedded in `Person`, not its own file. A person can hold several concurrently (e.g. a primary role at one institution, adjunct at another).
- **`Person`** — one file per person. Two things worth knowing:
  - `photo` is always an explicit, human-set path, never inferred from filename matching. The old Hugo site's fuzzy filename-matcher silently failed for 2 of 17 people — a bug class this schema closes off entirely.
  - `labTenure` (joined/left year) is kept **separate** from `affiliations`. "Is this person currently active in the lab" is answered only by `labTenure.leftYear` being null/absent — independent of which institution(s) they're affiliated with. Collapsing these two concepts into one breaks the moment someone's institutional affiliation is ongoing but their lab involvement has ended, or the reverse.
- **`PersonProfile`** — the rich academic-bio extension (education, research philosophy, research agenda). Structure is core even though today only the lab lead has one populated. Deliberately has no stored "150+ publications, 7 Best Paper Awards" summary field — that's derived at build time from `Publication`/`Recognition` counts so it can't drift out of sync with the actual data.
- **`ResearchTheme`** — a titled research area with a description. Can contain zero or more `Project`s; a theme with none still renders fine as description-only.
- **`Project`** — the poloclub-style card unit: title, tagline, thumbnail, optional links (paper/code/demo/video/poster), optional single `themeId`. This is expected to be the fastest-growing entity over time as more tools/demos exist.
- **`Publication`** — one unified shape across all 6 categories (patent/journal/conference/workshop/invited-paper/book-chapter), discriminated by `category`, with category-specific optional fields rather than 6 parallel types. `id` is generated once at normalization and then treated as immutable, since other entities reference it. `authors` stays free text rather than linked `Person` records — most co-authors will never be lab members, so partial linking would be worse UX than consistent plain text.
- **`Post`** — News and Blog unified into one entity with a `kind` discriminator. Both are dated, chronologically-sorted feed items; the real difference in the data is just how much content exists per entry, which is naturally optional fields (`body`, `authorId`, `tags`) rather than duplicated feed/pagination logic for two separate types.
- **`SiteMeta`** — singleton: title, tagline, nav, contact, socials, logo. `contact.address` is deliberately freeform and NOT derived from `primaryInstitutionId` — a lab's mailing address can outlive any one person's institutional affiliation.

### Secondary (structure defined now, content can launch partial)

- **`Recognition`** — awards/honors. The sole authority for "this won an award" — `Publication.note` is reserved for non-award annotations ("in press", "Spotlight") so award facts aren't duplicated in two places that can drift apart.
- **`ServiceRecord`** — editorial/TPC/community/university service roles. Real periods are irregular ("2010–2012, 2015, 2018–2019", "Multiple semesters") — `periodDisplay` is required raw text and the source of truth; `startYear`/`endYear` are best-effort, only populated when a record cleanly parses as a single range.
- **`Course`** — teaching history. Simple list, no invented enrollment data.
- **`Sponsor`** — logo grid entity, no real data yet.

## File layout

```
content/
  site-meta.yaml
  institutions.yaml
  people/<slug>.yaml            # one file per person
  research/themes.yaml
  projects/<slug>.yaml          # one file per project
  publications/
    patents.yaml
    journals.yaml
    conferences.yaml
    workshops.yaml
    invited-papers.yaml
    book-chapters.yaml
  posts/<yyyy-mm-dd>-<slug>.mdx
  recognitions/
    best-paper-awards.yaml
    best-paper-nominations.yaml
    best-poster-awards.yaml
    international-competition-awards.yaml
    professional-honor-awards.yaml
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

Why per-record files for `people/` and `projects/` but per-category array files for `publications/` and `recognitions/`: the first two are hand-curated and change one record at a time (a clean single-file diff per edit); the latter are bulk historical/imported data, not edited record-by-record, so one array file per category avoids hundreds of tiny files with no editing-workflow benefit.

YAML for hand-authored data, MDX for `posts/` where a real markdown body exists. A `lib/content/` loader should validate every file against a Zod mirror of `types/content.ts`, failing the build on drift — the static-export equivalent of the old site's one-off `team-validation.json` check, done continuously instead of once.

## Deliberately deferred (content decisions, not schema decisions)

- Which institution's address/branding populates `SiteMeta` at launch, and how the lab lead's `affiliations` array should actually be filled in — stays open until the merge pass across `data-extraction/sources/01-03`.
- The exact `Publication.id` generation scheme (e.g. `{category}-{year}-{slugified-title-prefix}`) needs to be picked once during normalization, then frozen.
