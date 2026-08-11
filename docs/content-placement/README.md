# Content Placement — where every field ends up on the site

This is the missing link between the data model (`types/content.ts`, `docs/SCHEMA.md`) and the actual UI (`docs/PLAN.md`'s poloclub-inspired site plan). SCHEMA.md says *what exists and why*; this set of docs says *where the visitor actually sees it*.

One file per entity, every field accounted for — including fields that are deliberately **never shown** to a visitor (ids, sort weights, convenience-only FKs). Read `site-map.md` first for the page/section skeleton everything below hangs off of.

## Entities

| Entity | Doc | One-line placement summary |
|---|---|---|
| Institution | [institution.md](institution.md) | Never its own page — resolved inline wherever a `Person`/`Course` references it |
| Person | [person.md](person.md) | `/team` grid (all) + `/team/<slug>` detail page (only those with real content beyond the basics) |
| ResearchTheme | [research-theme.md](research-theme.md) | Home page research sections + `/research` |
| Project | [project.md](project.md) | Card grid inside its ResearchTheme's section — poloclub-style, links out, no internal detail page |
| Publication | [publication.md](publication.md) | `/publications` (category tabs) + a Featured strip on Home |
| Post | [post.md](post.md) | `/news` feed (kind=news) and `/blog` feed (kind=blog), each with `/news/<slug>` \| `/blog/<slug>` detail pages |
| SiteMeta | [site-meta.md](site-meta.md) | Nav bar, header, footer, `<head>` SEO tags — sitewide chrome, not page content |
| Recognition | [recognition.md](recognition.md) | Sub-section of the relevant `Person`'s detail page — not a standalone site page |
| ServiceRecord | [service-record.md](service-record.md) | Sub-section of the relevant `Person`'s detail page |
| Course | [course.md](course.md) | Sub-section of the relevant `Person`'s detail page **and** a consolidated Home "Teaching" section |
| Sponsor | [sponsor.md](sponsor.md) | Home page sponsor logo grid (bottom of page, matches poloclub) |

## Reading each entity doc

Every entity doc has the same shape:
- A short **placement summary** (where the record as a whole lives)
- A **field table**: `Field | Where it appears | How it's displayed`
- An **"Internal / never rendered"** callout for structural fields (ids, sort weights, etc.)
- **Open decisions** — anywhere this doc makes a call that isn't locked in yet, flagged explicitly so it doesn't get mistaken for a finalized spec

## The one big cross-cutting decision this makes

**Recognition, ServiceRecord, and Course all render on the owning `Person`'s detail page, not as their own site sections.** The real live site (`xlab-ub.com`, Source 02) shows these as top-level pages (a personal CV/portfolio site structure), but `docs/PLAN.md` chose a poloclub-style **lab-roster** structure instead — and poloclub has no CV pages at all. Since our schema already scopes all three entities to a `personId`, the natural fit in a lab-roster site is: they belong to *that person's* profile, not the site's top-level nav. In practice, today, that means they'll mostly show up on the lab lead's page (only person with rich profile content right now) — but the placement rule is generic, so it holds for anyone.
