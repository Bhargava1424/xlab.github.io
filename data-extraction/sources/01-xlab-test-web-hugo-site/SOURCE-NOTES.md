# Source 01: xlab-test-web (old Hugo attempt)

**Origin**: `D:\Projects\xlab-test-web` — described by the user as "an old started website... very bad looking" that we need data from, not design/code.

**What this lab actually is**: X-Lab (also written "XLab" / "X-Labs"), led by **Prof. Jinjun Xiong**, in the **Department of Computer Science & Engineering at the University at Buffalo (UB)**. Focus: "Accelerating AI Systems & Solutions" — AI algorithms, AI solutions, AI systems, AI accelerators (hardware), AI security, AI development tools. This confirms the lab is **not** at the same institution as the poloclub.github.io reference site (Georgia Tech) — don't assume shared branding, courses, or department conventions.

**This is one of several planned sources.** Per the user: more sources are coming (other old materials, docs, etc.). Nothing in this folder should be treated as the final merged dataset — see the top-level `data-extraction/README.md` for how sources will eventually be reconciled.

## Folder contents

```
01-xlab-test-web-hugo-site/
├── SOURCE-NOTES.md              ← this file
├── site-structure-and-stack.md  ← tech stack, page-by-page real/demo inventory, known bugs
├── extracted/                   ← normalized YAML data pulled out of Hugo data files + content front matter
│   ├── site-meta.yaml
│   ├── lab-lead.yaml
│   ├── team-phd.yaml
│   ├── team-staff.yaml
│   ├── team-grads-undergrads-alumni-EMPTY.yaml
│   ├── research-themes.yaml
│   ├── opensource-projects.yaml
│   ├── socials.yaml
│   ├── news-events.yaml
│   ├── blog-posts.yaml
│   ├── hero-and-contact.yaml
│   └── static-team-validation.json   (copied verbatim from the old site)
├── assets/                      ← every image worth keeping, sorted by purpose
│   ├── logos/                   (xlab-black-logo.png, xlab-white-logo.png — the real lab logo, light/dark variants)
│   ├── team-photos/
│   │   ├── static-team/         (authoritative set: all 13 PhD + 3 staff photos + lead photo)
│   │   └── authors-backup/      (5 overlapping photos found in a second location — redundant copies, kept in case resolution/cropping differs)
│   ├── event-images/            (2 real news-item images)
│   ├── post-images/             (2 real blog-post images)
│   └── misc-stock/              (generic Wowchemy-theme stock photos + old screenshots — low value, see below)
├── demo-template-assets/        ← every demo/placeholder image, PDF, and .bib file from the
│                                   Wowchemy starter template, kept verbatim for completeness even
│                                   though none of it is real lab content (see below)
└── reference-docs/              ← original config/code copied verbatim, unmodified, for provenance
    ├── README.md, XLABS_INTEGRATION_README.md, LICENSE.md
    ├── hugo.toml, netlify.toml, theme.toml
    ├── gh-workflow-publish.yaml, gh-workflow-import-publications.yml
    ├── config.backup/           (5 files — the OLDER, superseded Wowchemy-era config; note its
    │                              menus.yaml has a different nav structure than the live hugo.toml —
    │                              historical only, not the source of truth)
    ├── css-scss/                (team.css, team-dark.css, template.scss — real hand-written styling
    │                              for the team page grid/cards, useful as a design reference even
    │                              though the new site won't reuse this CSS directly)
    └── layouts/                 (every custom Hugo template file: index.html, all partials,
                                   the callout shortcode, and team/list.html — the real page-building
                                   logic, including the personCard.html photo-matching bug described below)
```

### Completeness check

Every one of the 108 non-theme files in the old repo (everything except the vendored
`themes/gokarna/` third-party theme and `.git/`) is now accounted for in this folder as
exactly one of: (a) normalized into `extracted/*.yaml`, (b) copied verbatim into
`reference-docs/`, or (c) copied verbatim into `demo-template-assets/` if it was
starter-template demo content. The only files intentionally **not** copied anywhere are
zero-content tooling boilerplate: `.editorconfig`, `.gitignore`, `.hugo_build.lock`,
`.github/FUNDING.yml` (points to the Hugo Blox theme author's own sponsor page, not
ours), and empty `.gitkeep` placeholder files. These were opened and confirmed to carry
no lab-specific information before being excluded.

## Real vs. demo content — the single most important thing to know about this source

The old repo is a half-finished migration from a **Wowchemy/HugoBlox "Research Group" starter template** to a custom **Gokarna-based** site. The migration left a lot of **unmodified starter-template demo content** sitting right next to real lab content, with no visual distinction between them. Concretely:

**REAL (extracted, safe to reuse):**
- Lab identity: name, tagline, description, footer text, recruiting notice, contact email, meta keywords (`extracted/site-meta.yaml`)
- Lab lead: Prof. Jinjun Xiong, full titles and links (`extracted/lab-lead.yaml`)
- 13 PhD students + 3 postdoc/staff, each with role, email, Google Scholar link, personal website where available, and a matched photo (`extracted/team-phd.yaml`, `extracted/team-staff.yaml`)
- 6 research theme descriptions, lab-authored (`extracted/research-themes.yaml`)
- 3 open-source project blurbs (`extracted/opensource-projects.yaml`)
- 2 real news items about Dr. Xiong (AI Institute award, IEEE Cloud Summit talk) (`extracted/news-events.yaml`)
- 2 real full-length blog posts by PhD students Changjae Lee and Yuting Hu (`extracted/blog-posts.yaml`)
- Lab logo (black/white variants) — `assets/logos/`
- Real team photos — `assets/team-photos/static-team/`

**NOT REAL — unmodified starter-theme demo content, must not leak into the new site:**
- "Nelson Bighetti" and "Alice Wu 吳恩達" — fake Stanford AI professors used as theme demo authors
- "Richard Hendricks", "Jian Yang and Monica Hall" — Silicon Valley TV-show character names used in demo blog posts
- 3 sample publications (conference paper / journal article / preprint) — fake DOIs, Lorem ipsum abstracts, "Wowchemy Conference", co-author "Robert Ford"
- "Example Event" — fictional "Wowchemy Conference" dated the year 2030
- The entire Contact page body (Stanford's real street address, fake phone number, Lorem ipsum, generic Calendly link)
- The entire Tour page (Stanford stock photography, generic "Lunch & Learn" slider copy)

**Empty / genuine gaps (not extraction misses):**
- No graduate-collaborator, undergraduate, or alumni team data exists anywhere in the old site (`data/team/grads.yaml`, `undergrads.yaml`, `alumni.yaml` were all `[]`)
- Hero carousel, research-theme icons, and open-source project banners are referenced by filename in the YAML but the actual image files were never added to the repo — only the intended captions/metadata survive

## Assets worth a second look before reuse

- `assets/misc-stock/coders.jpg`, `contact.jpg`, `welcome.jpg` — generic stock photography bundled with the Wowchemy starter theme, used as decorative background images on demo pages (Tour, Contact, old homepage). Almost certainly **not lab-specific** — flagged, not deleted, in case the lab actually likes one of them, but don't assume they mean anything.
- `assets/misc-stock/root-screenshot.png`, `root-tn.png`, `site-preview.png`, `team-staff-banner.png` — old site screenshots/banners, kept for historical reference only, not source content.
- `assets/logos/icon-uncertain-source.png` (from `assets/media/icon.png` in the old repo) — unclear if this is a real lab icon/favicon or a leftover theme asset. Not confirmed either way; verify with the lab before using it as a favicon.

## Open questions / follow-ups for the user

1. Are the `github`/`repo` URLs pointing to `github.com/utkrshkmr` (a personal account) actually correct, or were they meant to be an org/project repo?
2. Do real hero-carousel photos exist anywhere (phone photos, university press photos) matching the 3 captions in `hero-and-contact.yaml` ("AI Institute...", "Research Collaboration Event", "Team Research Meeting")?
3. Should "Muhammad Ahmad Waseem" and "Ji-Hyeon Yoo" use `_phd7_Ahmad.png` / `_phd10_Ji-Hyeon.png` as their photos? (Very likely yes — the old site's own fuzzy-matching logic just had a bug — but worth a quick confirmation since these two were flagged as "missing" in the site's own validation report.)
4. Does the lab have any real publications to list, or a Google Scholar / DBLP profile per person that a future automated import could pull from? (The old repo's `import-publications.yml` GitHub Action expects a `publications.bib` file that was never created.)
5. Real contact address/office room for the department, if a Contact page is wanted on the new site.
