# Sponsor → Placement

**Summary**: Home page logo grid, at the bottom of the scroll — directly matches poloclub's Sponsors section. No dedicated page; no real data populated yet (`content/sponsors.yaml` is currently empty). See [site-map.md](site-map.md).

## Field table

| Field | Where it appears | How it's displayed |
|---|---|---|
| `id` | Internal | No visible form |
| `name` | Logo grid | Alt text / tooltip on the logo image |
| `logo` | Logo grid | The actual grid image |
| `url` | Logo grid | Makes the logo clickable, outbound to the sponsor's site |
| `grantNumbers` | Below the logo grid | A small text blurb listing grant numbers, matching poloclub's "funded by grant numbers X, Y, Z" pattern under its sponsor grid |

## Internal / never rendered

- `id` (no visible form needed).

## Open decisions

- None on placement — the open item here is content, not UI: no real sponsor data exists in any `data-extraction/` source yet (see `data-extraction/sources/01-*/SOURCE-NOTES.md`), so this section can't actually be populated until that's collected.
