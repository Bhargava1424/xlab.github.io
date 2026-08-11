# Course → Placement

**Summary**: Renders in **two** places (the only entity with a genuine dual placement): a "Teaching" section on the owning `Person`'s detail page, *and* a consolidated table across the whole lab — matching poloclub's dedicated Courses section — likely on Home. See [site-map.md](site-map.md).

## Field table

| Field | Where it appears | How it's displayed |
|---|---|---|
| `id` | Internal | No visible form |
| `personId` | Both placements | On the person's page: implicit (it's their page). On the consolidated table: resolved to the instructor's name as a table column |
| `code` | Both placements | Course code, e.g. "CSE 510", shown alongside title when present |
| `title` | Both placements | Course name |
| `institutionId` | Both placements | Resolved to institution name + link (see [institution.md](institution.md)) |
| `institutionName` | Both placements | Fallback plain text when the course was taught somewhere not in our `Institution` table (a real pattern — see `docs/SCHEMA.md`: the PI genuinely taught a one-off course at Columbia University, which isn't one of the lab's own institutions) |
| `termDisplay` | Both placements | Raw text, e.g. "Fall 2021" — no enrollment/attendance data is invented beyond what's here |

## Internal / never rendered

- `id` (no visible form needed).

## Open decisions

- Whether the consolidated Home "Teaching" table needs poloclub's enrollment-count/bar-chart treatment — our schema deliberately does **not** carry that kind of longitudinal enrollment data (see `docs/SCHEMA.md`'s note on `Course` not inventing data we don't have), so the consolidated table will be simpler than poloclub's course table, more like a plain list.
