# SiteMeta → Placement

**Summary**: Not page content — this is the sitewide chrome (nav, header, footer, `<head>` tags) that wraps every other page. Singleton, one record for the whole site. See [site-map.md](site-map.md).

## Field table

| Field | Where it appears | How it's displayed |
|---|---|---|
| `title` | `<title>` tag, logo alt text, footer copyright line | |
| `tagline` | Hero section, directly under the logo | Matches poloclub's "Scalable. Interactive. Interpretable." placement exactly |
| `description` | `<meta name="description">` | SEO only, never visibly rendered |
| `keywords` | `<meta name="keywords">` | SEO only, never visibly rendered |
| `nav[]` (`label`, `path`, `children`) | Navigation bar | Drives the nav menu structure directly — top-level items, with `children` rendering as a dropdown (used today only by Publications' category children) |
| `contact.email` / `contact.phone` | Footer | Contact block |
| `contact.address` | Footer | Mailing address block — deliberately freeform text, not derived from `primaryInstitutionId` (see `docs/SCHEMA.md`) |
| `primaryInstitutionId` | Not directly rendered | Convenience-only reference (e.g. could drive which institution's logo to reuse somewhere) — never shown as visible address/branding text itself |
| `recruitingNotice` | Prominent banner/callout | Likely on Home (near the hero or team section) or on `/team` — exact placement TBD, see below |
| `socialLinks` | Header icon row + footer icon row | Matches poloclub's nav-bar social icons (GitHub/LinkedIn/HuggingFace/etc.) |
| `logo.light` / `logo.dark` | Header | Theme-aware swap between the two based on light/dark mode — mirrors the logo-switcher behavior found in the old site (`data-extraction/sources/01-*/reference-docs/layouts/partials/theme-logo-switcher.html`) |

## Internal / never rendered

- `primaryInstitutionId` — convenience/cross-reference only, by design (see `docs/SCHEMA.md`'s note on why this must never become the source of truth for address/branding).

## Open decisions

- Exact placement of `recruitingNotice` (Home banner vs. `/team` page vs. both) — not decided yet.
- `contact` and `primaryInstitutionId` are currently `null` in `content/site-meta.yaml` pending a real content decision (which institution's address represents the site) — see `docs/SCHEMA.md`'s "Deliberately deferred" section. Nothing in this doc resolves that; it only describes where the values *would* render once decided.
