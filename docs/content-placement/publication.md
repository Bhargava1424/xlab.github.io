# Publication → Placement

**Summary**: Full itemized archive lives on `/publications`, organized into category tabs/filters (not 6 separate nav pages). A curated `featured` subset also surfaces on Home as a highlight strip, echoing poloclub's per-project paper links rather than dumping the whole archive on the landing page. See [site-map.md](site-map.md).

## Field table

| Field | Where it appears | How it's displayed |
|---|---|---|
| `id` | Internal | Cross-referenced by `Project.links.publicationId`, `Recognition.publicationId`, `Post.relatedPublicationId` — never shown as text |
| `category` | `/publications` structure | Determines which tab/filter this entry falls under |
| `title` | List entry | Main heading text of the entry |
| `authors[].name` | List entry | Directly under/beside the title, smaller text — rendered in array order |
| `authors[].personId` | List entry, inline | When set, that specific author's name becomes a link to their `/team/<slug>` page instead of plain text — most authors have no `personId` (external co-authors) and stay plain text in the same list; mixed linked/plain-text author lists are the normal case, not a bug |
| `venue` | List entry | Italicized, citation-style, next to title/authors |
| `year` | List entry + sort key | Entries sorted year-descending within each category tab; year shown as a label |
| `dateDisplay` / `month` | List entry | Supplementary date text where a bare year isn't precise enough (mainly conference/workshop entries) |
| `location` | List entry (conference/workshop only) | Supplementary "— City, State" text |
| `note` | List entry badge | Small annotation badge, e.g. "Spotlight" or "in press" — **not** award info (see [recognition.md](recognition.md) for why those stay separate) |
| `doi` | List entry | Small DOI link/icon |
| `url` / `pdfUrl` | List entry | Outbound link icon(s) — PDF icon specifically for `pdfUrl` |
| `featured` | Determines extra placement | Included in the Home page's Featured Publications strip, and implicitly in any `Project` that links to it via `links.publicationId` |
| `featuredOrder` | Internal | Manual ordering within the Featured strip specifically — independent of the chronological order used in the full `/publications` list |
| `patentNo` / `docketNo` / `applicationNo` / `filedDate` / `issuedDate` / `jurisdiction` | List entry, Patents tab only | Extra metadata line under the title, e.g. "Patent No. P202102159US01 · Filed June 2021" |
| `volumeIssue` | List entry, Journals tab only | Appended to the venue text, e.g. "*Nature Communications*, Vol. 12, No. 579" |
| `book` / `editors` / `publisher` / `onlineIsbn` | List entry, Book Chapters tab only | Supplementary metadata line: book title, editors, publisher |

## Internal / never rendered

- `id` (cross-reference key only)
- `featuredOrder` (ordering only, distinct from the visible `year`)

## Open decisions

- Exact UI for the Featured strip on Home (card row? inline list? — not designed yet, just confirmed the data supports it).
- Whether `/publications` needs pagination given the real dataset will eventually hold ~300 entries once the full merge pass from `data-extraction/` happens.
