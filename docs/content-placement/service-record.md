# ServiceRecord → Placement

**Summary**: Renders on the owning `Person`'s `/team/<slug>` detail page, as a "Professional Service" section grouped by category — same placement pattern as [Recognition](recognition.md), not a standalone page. See [site-map.md](site-map.md).

## Field table

| Field | Where it appears | How it's displayed |
|---|---|---|
| `id` | Internal | No visible form |
| `personId` | Routing | Determines whose page this renders on |
| `category` | Section structure | Groups entries into sub-headings: Editorial, Conference Leadership, Technical Program Committee, Community Service, University Service |
| `role` | List entry | Main text, e.g. "Associate Editor" |
| `org` | List entry | "— [org]" |
| `periodDisplay` | List entry | Always shown as-is (required, source of truth) — e.g. "2019–present" or the irregular multi-range text real data sometimes has ("2010–2012, 2015, 2018–2019") |
| `startYear` / `endYear` | Not separately rendered | Only used if a future feature needs to sort/filter service entries by year — the visible text always comes from `periodDisplay`, never reconstructed from these |
| `isOngoing` | Possible visual cue | Could style ongoing roles slightly differently (e.g. a small "current" dot) — not required, `periodDisplay` already communicates this in text |

## Internal / never rendered

- `id`, `personId` (routing/grouping only)
- `startYear` / `endYear` — present for potential future sorting, not for display (see `docs/SCHEMA.md`'s note on why these are best-effort and `periodDisplay` stays the source of truth)

## Open decisions

- Same as [Recognition](recognition.md): assumes no standalone page, only person-scoped sections.
