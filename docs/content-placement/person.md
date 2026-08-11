# Person → Placement

**Summary**: Every person gets a card in the `/team` grid, grouped by `personType` then split into current vs. alumni (via `labTenure`). Only people with enough content to justify it (profile, multi-entry affiliation history, or any linked Recognition/ServiceRecord/Course records) get a `/team/<slug>` detail page — everyone else's card links straight out to their own site/email/scholar instead. Current members also appear as a small avatar strip on Home. See [site-map.md](site-map.md).

## Field table

| Field | Where it appears | How it's displayed |
|---|---|---|
| `id` | Internal | URL slug for `/team/<id>` |
| `name` | Card (Home strip + `/team` grid), detail page H1, anywhere this person is referenced (Post byline, Recognition/ServiceRecord/Course entries) | Primary heading text |
| `personType` | `/team` grid structure | Drives which group section the card sits in ("Lab Lead", "Postdocs", "PhD Students", etc.) and default sort order between groups |
| `roleTitle` | Card (under name) + detail page | Single line, e.g. "PhD Candidate, 4th Year, Computer Science & Engineering" — poloclub's equivalent is its "degree" field, ours carries more text |
| `secondaryTitles` | Detail page only | Small sub-lines under `roleTitle` — not shown on the compact card (no room); if a card-only person has these, they're part of why they'd get promoted to a detail page |
| `photo` | Card + detail page hero | Explicit path, **never inferred from filename** (see `docs/SCHEMA.md` — this is the specific bug the schema was designed to prevent). Falls back to a generic avatar placeholder if absent |
| `office` | Detail page only | Small "📍 Office" line, matches the pattern used for the real lab-lead data |
| `bio` | Detail page only | Short intro paragraph, directly under name/role, above the `profile` sections |
| `profile.education` | Detail page | An "Education" list, most recent first |
| `profile.researchPhilosophy` | Detail page | A "Research Philosophy" prose section |
| `profile.researchInterests` | Detail page | Tag/chip list under a "Research Interests" heading |
| `profile.researchAgenda` | Detail page | "Research Agenda" section; each entry gets its own sub-block: project name as a mini-heading, `description` as prose, `representativeTechniques` as a small inline tag list |
| `profile.futureVision` | Detail page | A closing "Looking Ahead" prose section |
| `profile.quote` | Detail page, near the top | Pull-quote style, directly under the name/role block — a personal motto, not buried in a list |
| `links.email` | Card (icon) + detail page (icon) | `mailto:` link |
| `links.scholar` | Card + detail page | Google Scholar icon link |
| `links.website` | Card + detail page | Personal site icon link |
| `links.universityProfile` | Detail page only | Not compact-card-worthy; an outbound "University Profile" link |
| `links.linkedin` / `links.github` | Card + detail page | Icon links, same row as email/scholar/website |
| `affiliations[]` | Card (condensed) + detail page (full) | Card: just the institution `shortName` of the current/primary affiliation as a small tag. Detail page: full history — each entry shows institution name + department + roleTitle + type + date range. **This is the section where the multi-institution/overlapping-history cases actually matter visually** — see the founder-style example in the synthetic dataset |
| `labTenure.joinedYear` / `labTenure.leftYear` | Card + detail page | Small tenure tag, "2020–present" or "2020–2023". `leftYear` absent/null is also what determines the current-vs-alumni grouping split on `/team` |
| `sortWeight` | Internal only | Manual ordering override within a `personType` group — never rendered as visible text |

## Reverse relationships (also render on this person's detail page)

These aren't fields on `Person` itself, but they're what the detail page's extra sections are built from:

| Source entity | Shown as | Doc |
|---|---|---|
| `Post` where `authorId` = this person | "Blog Posts by [Name]" section (only `kind=blog` posts realistically — news rarely credits a specific author) | [post.md](post.md) |
| `Recognition` where `personId` = this person | "Awards & Recognition" section | [recognition.md](recognition.md) |
| `ServiceRecord` where `personId` = this person | "Professional Service" section | [service-record.md](service-record.md) |
| `Course` where `personId` = this person | "Teaching" section | [course.md](course.md) |

## Internal / never rendered

- `id` (URL slug only)
- `sortWeight` (ordering only)

## Open decisions

- Exact threshold for "gets a detail page" — proposed rule is profile OR 2+ affiliations OR any Recognition/Service/Course records, but this needs a final call once the real team roster is fully populated.
- Whether alumni cards on `/team` show their **current** employer (poloclub does this prominently) — our schema doesn't have a dedicated "current employer" field for alumni; would need to either add one or infer it from their most recent `affiliations` entry.
