# Post → Placement

**Summary**: One entity, two feeds — `kind=news` populates `/news`, `kind=blog` populates `/blog`. Both are dated, reverse-chronological lists on Home (News only, condensed) and their own full archive pages. See [site-map.md](site-map.md) for the open question about whether `/blog` should really be a separate route from `/news`.

## Field table

| Field | Where it appears | How it's displayed |
|---|---|---|
| `id` | Internal | URL slug for `/news/<id>` or `/blog/<id>` |
| `kind` | Routing | Determines which feed/archive this post belongs to |
| `date` | Feed entry + detail page | Poloclub-style date tag ("2026 Aug") on the feed entry; full date on the detail page |
| `title` | Feed entry + detail page H1 | Main heading |
| `summary` | Feed entry | The feed list entry's body text for News (often the *entire* visible content for a short item); a teaser/excerpt above the fold for Blog |
| `body` | Detail page only | Full article content — **only rendered if present**. A `kind=news` item with no body has no detail page at all (see below); the feed entry is the complete content for that item |
| `image` | Feed entry thumbnail + detail page hero | |
| `authorId` | Byline | Resolves to a `Person`; shown as "by [Name]" — realistically populated for Blog posts, rare for News items (which more often reference people inline within `body`/`summary` text rather than crediting a single author) |
| `tags` | Detail page + `/blog` archive filter | Chip list; used to filter the Blog archive by topic |
| `sourceUrl` | Feed entry + detail page | Outbound "Read more →" / "Read the announcement" link — mainly a News-item pattern (external press coverage, official announcements) |
| `relatedPublicationId` | Detail page | Inline citation/link, "Related paper: [Title]", resolving to that `Publication`'s title/link |

## Detail-page generation rule

A `/news/<slug>` or `/blog/<slug>` page is only generated when `body` is present. Short news items (title + summary + maybe a `sourceUrl`, no `body`) exist only as feed entries — there's nothing more to show on a dedicated page, so none is built. This mirrors the real extracted news data (`data-extraction/sources/01-*/extracted/news-events.yaml`), where every real news item is a one- or two-sentence blurb with an external link, not a standalone article.

## Internal / never rendered

- `id` (URL slug only)

## Open decisions

- Whether `/blog` is really a separate top-level nav item, or folded into `/news` with a kind filter (see [site-map.md](site-map.md)).
- Whether News items ever need their own `authorId`-driven byline UI, given the real data so far never uses it that way.
