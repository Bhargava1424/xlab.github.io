# Source 02: xlab-ub.com (live site)

**Origin**: `https://www.xlab-ub.com/`, the lab's current live website, fetched 2026-08-10. Hosted on Google Sites (server-rendered — the real content is present in the initial HTML, unlike a JS-only SPA, so full-page fetches worked cleanly).

**This is the current, authoritative source.** Where it disagrees with Source 01 (the old half-built Hugo attempt), trust this one — it's live and presumably more recently maintained by Dr. Xiong directly.

## What this site actually is

Unlike Source 01 (which was structured as a lab-roster site with a Team page), this live site is structured entirely as **Dr. Jinjun Xiong's individual academic portfolio/CV**: Home, Research, Publications (6 sub-categories), Recognitions, Services, Teaching. **There is no Team/People page at all** — no PhD students, postdocs, or lab members are listed anywhere on this site. All roster data still comes only from Source 01.

## Folder contents

```
02-xlab-ub-com-live-site/
├── SOURCE-NOTES.md            ← this file
└── extracted/
    ├── site-meta.yaml              (nav structure, real contact address/phone/email)
    ├── lab-lead-bio.yaml           (education, career history, research philosophy/agenda — much richer than source 01)
    ├── recognitions.yaml           (58 awards across 5 categories: best paper, nominations, poster, competition, professional)
    ├── services.yaml               (editorial roles, conference leadership, TPC memberships, community + university service)
    ├── teaching.yaml                (3 courses across 3 institutions)
    ├── publications-patents.yaml            (58 patents, 2000–2021)
    ├── publications-journals.yaml           (40 journal articles, 2003–2021)
    ├── publications-conferences.yaml        (141 conference papers, 2000–2022)
    ├── publications-workshops.yaml          (47 workshop papers, 2004–2021)
    ├── publications-invited-papers.yaml     (12 invited papers, 2004–2021)
    └── publications-book-chapters.yaml      (3 book chapters, 2011–2019, + 1 flagged ambiguous entry)
```

No `assets/` or `reference-docs/` folder this time — see gaps below.

## Content quality vs. Source 01

This source is dramatically more complete and current for **the PI specifically**:
- Real full bio (education timeline, career history at IBM/UIUC before UB)
- Real research philosophy and a 3-pronged research agenda with citations, not just short theme blurbs
- A full, itemized publication record — **301 total entries** across patents/journals/conferences/workshops/invited papers/book chapters — vs. zero real publications in Source 01 (which only had 3 fake demo entries)
- Real professional service record (22 years of editorial/TPC/community/university service)
- Real contact address (316 Davis Hall, Buffalo NY) vs. Source 01's leftover Stanford placeholder address

But it contributes **nothing** about team members, research-group identity/branding (no tagline like "Accelerating AI Systems & Solutions" tied to a lab logo — wait, actually the tagline IS present here too, see site-meta.yaml), news items, or blog posts — those remain Source 01's contribution.

## Gaps / things not captured

1. **One image found, couldn't be downloaded.** The homepage has exactly one `<img>` (likely a profile or lab photo), hosted on Google's signed-URL CDN (`lh3.googleusercontent.com/sitesv/...`). Direct download via curl got HTTP 403 (Google blocks hotlinking/unauthenticated access to these signed URLs). **Action needed**: open the page in a browser and manually right-click-save the image, or use Google Sites' own export/publish tools, since only someone with browser access (and possibly edit rights on the Site) can retrieve it cleanly.
2. **No links to individual publications** were present for invited papers or book chapters (per the site itself) — only patents/journals/conferences/workshops occasionally had inline detail; no DOIs or PDF links were captured anywhere, since the site doesn't appear to provide them.
3. Two possible duplicate entries in `publications-workshops.yaml` (two papers both titled things that also appear at "NATW 2009" and again at "ACM/IEEE International Workshop on Timing Issues" the same month) — flagged inline in that file, not resolved. Could be the same paper presented twice, or a genuine site data-entry duplication. Worth a quick check against the PI's actual CV if one exists elsewhere.
4. "Mastering Flash 4, Illustrated" (2000) is listed on the Book Chapters page but is actually a full authored book, not a chapter — flagged separately in `publications-book-chapters.yaml`, not filed as a chapter.
5. Didn't crawl beyond the 12 pages linked in the nav (Home + Research + Publication index + 6 pub subpages + Recognitions + Services + Teaching). If the Google Site has any unlinked pages (drafts, old pages not in the nav), those weren't discovered — Google Sites doesn't expose a sitemap.xml by default that was checked here.

## Open questions for the user

1. Can you grab the one homepage image directly (browser save) since it couldn't be fetched programmatically?
2. Do you have edit access to this Google Site? If so, exporting/checking for any unpublished draft pages would ensure total completeness beyond what the public nav exposes.
3. Should the new site include the PI's full publication history (301 entries) prominently, or a curated/recent-highlights subset with a link to a full CV/Google Scholar page? Worth deciding before building the Publications page — 301 entries is a lot to render as cards in the poloclub-style layout we discussed.
4. Resolve the 2 duplicate-looking workshop entries noted above.
