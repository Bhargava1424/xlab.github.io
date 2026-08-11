# ResearchTheme → Placement

**Summary**: Direct poloclub analog. Each theme becomes a full-width section — heading, subheading, then a grid of its `Project` cards inline. Shown (condensed) on Home and (full) on `/research`. See [site-map.md](site-map.md).

## Field table

| Field | Where it appears | How it's displayed |
|---|---|---|
| `id` | Internal | Anchor id for the section (e.g. `#research-ai-security`, matching poloclub's `#research-ai` pattern) so the nav can deep-link to a specific theme |
| `icon` | Section heading | Small icon next to the theme title, both on Home and `/research` |
| `title` | Section heading | e.g. "AI Security" |
| `shortDescription` | Section subheading | Shown on **both** Home and `/research` — this is the one-liner poloclub always shows regardless of page |
| `longDescription` | `/research` only | Home's version is condensed to just `shortDescription` to keep the scroll shorter, matching poloclub's homepage brevity; the full page gets the extended description |
| `order` | Internal | Controls section sequence top-to-bottom on both pages |

## Related

Each theme's `Project` cards render inline within its section — see [project.md](project.md). A theme with zero linked projects still renders fine as a heading + description with an empty (or hidden) card grid — this was a deliberate schema requirement, not an edge case to special-case away.

## Internal / never rendered

- `id` (anchor only, not visible text)
- `order` (sequencing only)

## Open decisions

None — this entity's placement is the most directly poloclub-equivalent of anything in the schema.
