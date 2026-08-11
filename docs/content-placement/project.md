# Project → Placement

**Summary**: The poloclub card unit. Renders inside its `ResearchTheme`'s section (Home + `/research`, same cards in both — no separate "full" version, unlike theme descriptions). Deliberately has **no internal detail page** — matches poloclub's own pattern of every project card linking straight out to an external repo/demo/paper rather than hosting its own page on the lab site. See [site-map.md](site-map.md).

## Field table

| Field | Where it appears | How it's displayed |
|---|---|---|
| `id` | Internal | Used only for React keys / cross-references from `links.publicationId` elsewhere — no route uses it |
| `title` | Card | Main card heading (poloclub calls this field "brand") |
| `tagline` | Card | One-line subtitle directly under the title — this field was named to match poloclub's own `tagline` field exactly |
| `description` | Not shown on the compact card | Reserved for a "Read more" expand/tooltip if the design ever wants one; poloclub's cards don't show long descriptions either, so v1 can omit this entirely without losing fidelity to the reference |
| `thumbnail` | Card | Top image, matches poloclub's `paper-icon-wrapper` image |
| `themeId` | Internal (grouping) | Determines which `ResearchTheme` section the card renders inside — not rendered as visible text on the card itself |
| `status` | Card badge | `"deployed"` → a "Deployed" badge, directly matching poloclub's exact badge. `"active"`/`"archived"` get their own visual treatment (e.g. archived projects shown at reduced opacity or grouped into a "past projects" tail of the grid) |
| `collaborationWith` | Card badge | Small badge with a handshake icon, e.g. "🤝 Collaboration with IBM" — this field exists specifically to mirror poloclub's "Collaboration with X" badge. Free-text **external org name**, not a `Person` link |
| `contributors` | Card (small avatar stack) + detail context | The actual `Person` link poloclub doesn't have an equivalent for: which lab members worked on this project. Rendered as a compact row of small linked avatars/initials at the bottom of the card (space permitting) or a "Team: [Name], [Name]" line — distinct from `collaborationWith`, which is about an external partner, not lab members. Optional; only populated when confirmed, never guessed |
| `featured` | Determines extra placement | Featured projects also appear pulled forward/highlighted — e.g. sorted first within their theme's grid, or included in a cross-lab "Featured" strip if one exists |
| `order` | Internal | Manual sort order within the theme's card grid |
| `links.paperUrl` | Card icon row | PDF icon |
| `links.publicationId` | Card icon row | Resolves to that `Publication`'s `pdfUrl`/`url` for the same PDF icon slot — an alternative to `paperUrl`, not a second icon |
| `links.code` | Card icon row | Code/GitHub icon |
| `links.demo` | Card icon row | Live-demo icon |
| `links.video` | Card icon row | YouTube/video icon |
| `links.poster` | Card icon row | Poster icon |
| `links.website` | Card icon row | Generic external-link icon |

All the `links.*` fields render as the same row of small icon buttons at the bottom of the card, exactly matching poloclub's icon-link-button row — present only for whichever links actually exist on a given project (a project with zero links just shows an empty row / no row at all).

## Internal / never rendered

- `id`, `themeId`, `order` — structural only, no visible text form.

## Open decisions

- Whether `description` ever gets a UI slot (currently: no, matching poloclub's own omission of long project descriptions on cards).
