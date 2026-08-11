# Recognition → Placement

**Summary**: Renders entirely on the owning `Person`'s `/team/<slug>` detail page, as an "Awards & Recognition" section grouped by category — not a standalone site page (unlike the real `xlab-ub.com` site, which does give this its own top-level page; see the cross-cutting note in [README.md](README.md)). See [site-map.md](site-map.md).

## Field table

| Field | Where it appears | How it's displayed |
|---|---|---|
| `id` | Internal | No visible form |
| `category` | Section structure | Groups entries within the person's "Awards & Recognition" section — e.g. a "Best Paper Awards" sub-heading, then "Best Paper Nominations", etc. |
| `personId` | Routing | Determines whose detail page this entry renders on — not visible text on the entry itself (the person is already the page you're on) |
| `award` | List entry | Main heading text, e.g. "Best Paper Award" |
| `year` / `dateDisplay` | List entry | Shown alongside the award name |
| `title` | List entry | The associated paper/project title, when present — shown as a sub-line under the award name |
| `venue` / `org` | List entry | "at [venue/org]" supplementary text |
| `publicationId` | List entry | Makes the entry clickable through to the full `Publication` record when the awarded work is in the archive — see `docs/SCHEMA.md` for why this stays a cross-link rather than duplicating award info onto `Publication.note` |

## Internal / never rendered

- `id`, `personId` (routing/grouping only).

## Open decisions

- This doc assumes Recognition never gets its own top-level page. If that changes (e.g. to more closely match the real `xlab-ub.com` CV-style layout), this doc and [site-map.md](site-map.md) both need updating together.
