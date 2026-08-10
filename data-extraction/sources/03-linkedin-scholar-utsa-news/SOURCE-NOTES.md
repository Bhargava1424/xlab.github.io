# Source 03: LinkedIn (pasted by user) + Google Scholar + UTSA news article

**Origin**: Google Scholar profile (`scholar.google.com/citations?user=tRt1xPYAAAAJ`), a UTSA news article (Nov 2025), and Dr. Xiong's LinkedIn profile text pasted directly by the user. Fetched/received 2026-08-10.

## ⚠️ The headline fact: Dr. Xiong left University at Buffalo

**Jinjun Xiong is no longer primarily at UB.** As of **March 1, 2026**, he is **Founding Dean of the new College of AI, Cyber and Computing at UT San Antonio (UTSA)**. His UB role changed from full-time "Empire Innovation Professor" (Sep 2021–Feb 2026) to a part-time "Adjunct Professor" (Mar 2026–present). His "Director, Institute for Artificial Intelligence and Data Science" role at UB also ended in Feb 2026.

This is flagged at the top of this file, in `SOURCE-NOTES.md` for all sources, and called out directly to the user in-conversation, because **it may invalidate the entire premise of this site-building project** (an "X-Lab @ University at Buffalo" website) — see `data-extraction/README.md` for the cross-source flag and the open question this raises.

## Folder contents

```
03-linkedin-scholar-utsa-news/
├── SOURCE-NOTES.md              ← this file
└── extracted/
    └── career-timeline-and-metrics.yaml
```

## What's in the extracted data

- **Full employment timeline** (LinkedIn "Experience" section): UTSA Dean role, UB Adjunct + former Empire Innovation Professor roles, Scientific Director of the National AI Institute for Exceptional Education, Adjunct Research Professor at UIUC, former Director of UB's Institute for AI and Data Science — with exact start/end dates.
- **Full education timeline** (LinkedIn shows 5 entries, only 2 visible without expanding "Show all 5 educations" — UCLA PhD and UW-Madison MS confirmed; the other 3 almost certainly match Tsinghua BS/MS + possibly a duplicate/honorary entry already known from Source 02, but not directly confirmed here — see gap below).
- **Google Scholar metrics**: 12,031 total citations, h-index 52, i10-index 195, top 5 most-cited papers with exact citation counts. Notably, Scholar's listed homepage is still `xlab-ub.com` — not yet updated to anything UTSA-related as of this fetch.
- **UTSA news article facts**: official appointment announcement, effective date, background summary, a leadership quote, and the fact that the College of AI, Cyber and Computing itself only launched Sept 1, 2025 (i.e., it's a brand-new college, and Dr. Xiong is its first dean).
- **LinkedIn "About" summary + skills list**: paraphrased below (not reproduced verbatim) — largely overlaps Source 02's bio but is a slightly older snapshot (About text says "30+ journals, 40 patents, 100+ conference papers, 5 Best Paper Awards, 2 Best Poster Awards, 8 nominations" — Source 02's live xlab-ub.com site shows higher, more current counts: 40 journals, 58 patents, 141 conferences, 7 Best Paper Awards, 3 Best Poster Awards. Treat Source 02 as the more current publication-count snapshot; LinkedIn's About section appears stale relative to it).
- **Recent LinkedIn activity** (last ~2 months of posts, paraphrased): mostly UTSA College of AI, Cyber and Computing institutional news — a dean's-vision feature article, a "Founding Dean" interview about his "Earthly AI" philosophy (a term he says he coined with Dr. Wen-mei Hwu in a 2019 joint TEDx talk while running C3SR), UTSA's global research ranking (No. 296/2,250, top 13%), an IoT forensics lab visit/writeup, an Edge AI streaming event, and a UTSA faculty member's appointment to the Texas Quantum Initiative Advisory Committee. These are UTSA-institutional posts, not X-Lab-specific — flagged as context, not lab content.

## Gaps

1. Only 2 of 5 LinkedIn education entries were visible in the pasted text (collapsed behind "Show all 5 educations") — the other 3 are presumably the Tsinghua BS/MS already known from Source 02, but not independently confirmed here.
2. Didn't independently fetch the LinkedIn profile (it was pasted by the user, not crawled) — no LinkedIn post images, exact post dates (only relative "1mo"/"2mo"), or full post text beyond what was visible/pasted.
3. Google Scholar profile only shows top-5-by-citation publications on the default view — the full 301-entry publication list from Source 02 is far more complete for a full bibliography; Scholar is only useful here for citation-count metrics, not completeness.
