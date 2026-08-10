# Data Extraction

Raw material collected from every source we have for the lab (old websites, docs, spreadsheets, whatever), before it gets normalized into the single dataset that will actually drive the new site. See `docs/PLAN.md` (repo root) for the overall site plan this feeds into.

**Nothing in here is final.** Each subfolder under `sources/` is one raw source, extracted and organized but not yet merged or deduplicated against the others. Once all sources are collected, a separate merge pass will reconcile conflicts (e.g. two sources disagreeing on someone's title) and produce the actual content data files the site consumes.

## Sources

| # | Folder | What it is | Status |
|---|---|---|---|
| 01 | [`sources/01-xlab-test-web-hugo-site/`](sources/01-xlab-test-web-hugo-site/SOURCE-NOTES.md) | Old half-built Hugo/Gokarna site at `D:\Projects\xlab-test-web` — team roster, lab identity, research themes, 2 real news items, 2 real blog posts, logo, team photos. Mixed with a lot of leftover Wowchemy-template demo content (flagged, not used). | Extracted |
| 02 | [`sources/02-xlab-ub-com-live-site/`](sources/02-xlab-ub-com-live-site/SOURCE-NOTES.md) | Current live site at `xlab-ub.com` (Google Sites) — the PI's full academic portfolio: rich bio, research agenda, 301 itemized publications (patents/journals/conferences/workshops/invited papers/book chapters), full recognitions/awards list, service record, teaching history, real contact address. No team-roster data (that's Source 01's job) and one image couldn't be auto-downloaded (Google CDN blocked it — needs manual save). | Extracted |
| 03 | [`sources/03-linkedin-scholar-utsa-news/`](sources/03-linkedin-scholar-utsa-news/SOURCE-NOTES.md) | Google Scholar profile + a UTSA news article + Dr. Xiong's LinkedIn (pasted by user). ⚠️ **Reveals Dr. Xiong left UB** — as of March 1, 2026 he's Founding Dean of UT San Antonio's new College of AI, Cyber and Computing, and only an adjunct/part-time professor at UB now. See the top of that source's SOURCE-NOTES.md and the flag below. | Extracted |

## ⚠️ Project-defining fact surfaced by Source 03 — needs your decision

Every source collected so far (01, 02) assumed the lab is **X-Lab @ University at Buffalo**, per `docs/PLAN.md`. Source 03 shows that's no longer accurate: **Dr. Jinjun Xiong became Founding Dean of UT San Antonio's brand-new College of AI, Cyber and Computing on March 1, 2026**, and is now only an adjunct (part-time) professor at UB. This wasn't asked about in chat yet — flagging it here so it isn't silently absorbed into the data model. It affects things like: which institution the new site should represent, whether "X-Lab" is even the right brand going forward (a dean of a whole college is a different kind of website than a PI's research-lab page), and whether Source 01/02's UB-branded content (address, logo, `xlab.cse.buffalo.edu`/`xlab-ub.com` identity) is still the target or now historical.

## Convention for adding a new source

When extracting a new source, add a folder `sources/NN-short-name/` containing:
- `SOURCE-NOTES.md` — what the source is, what's real vs. placeholder/demo, gaps, open questions for the user
- `extracted/` — normalized YAML/JSON/Markdown pulled out of the source, organized by content type (team, research, news, etc.), not by the source's original file layout
- `assets/` — every image/file worth keeping, sorted by purpose, with low-confidence items flagged rather than silently dropped
- `reference-docs/` (optional) — original config/docs copied verbatim for provenance, if the source is code-like (e.g. a config-driven site)

Then add a row to the table above.
