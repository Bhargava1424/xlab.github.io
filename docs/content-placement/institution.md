# Institution → Placement

**Summary**: Institution never has its own page or list view. It's a lookup table, resolved inline everywhere something references it (`Person.affiliations[]`, `Course.institutionId`, `SiteMeta.primaryInstitutionId`). See [site-map.md](site-map.md).

## Field table

| Field | Where it appears | How it's displayed |
|---|---|---|
| `id` | Internal only | Foreign-key value, never rendered as text |
| `name` | [Person](person.md) affiliation history, [Course](course.md) institution line | Full name, e.g. "University at Buffalo" |
| `shortName` | Compact contexts: Person card affiliation tag, table cells | Preferred over `name` wherever space is tight (e.g. a small "UTSA" badge on a team card); falls back to `name` if absent |
| `url` | Anywhere `name`/`shortName` is shown | Makes the institution name a clickable outbound link |
| `logo` | Not used in v1 | Reserved for a possible "affiliated institutions" logo strip if the design ever wants one (poloclub doesn't have this — its closest analog is the Sponsors grid, which is a separate entity). Not required for launch |
| `city` / `state` / `country` | Person detail page's affiliation history entries | Small supplementary text next to the institution name, e.g. "University at Buffalo — Buffalo, NY" — only if the affiliation entry benefits from location context (mainly useful for the cross-institution/international cases) |

## Internal / never rendered

None beyond `id` — every other field has a real display use, at least conditionally.

## Open decisions

- Whether `logo` ever gets used (currently: no planned UI slot for it).
