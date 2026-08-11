# Content

Real content data for the site, shaped to `types/content.ts` (see `docs/SCHEMA.md` for the rationale). **This is a partial, dry-run population**, not the finished dataset — it exists to validate the schema against real records before committing to it across all 301+ publications and the full team roster.

## Status

| Entity | Populated | Full source |
|---|---|---|
| `institutions.yaml` | Full (3: UB, UTSA, UIUC) | — |
| `site-meta.yaml` | Partial — `contact`/`primaryInstitutionId` deliberately left TBD, see `docs/SCHEMA.md` | — |
| `people/` | 2 of ~17 (lab lead + one sparse PhD student, chosen to stress-test the schema) | `data-extraction/sources/01-*/extracted/team-*.yaml`, `02-*/extracted/lab-lead-bio.yaml` |
| `research/themes.yaml` | Full (6) | `data-extraction/sources/01-*/extracted/research-themes.yaml` |
| `projects/` | Full (3 — all real open-source projects that exist) | `data-extraction/sources/01-*/extracted/opensource-projects.yaml` |
| `publications/patents.yaml` | 1 of 58 (dry-run) | `data-extraction/sources/02-*/extracted/publications-patents.yaml` |
| `publications/journals.yaml` | 1 of 40 (dry-run) | `data-extraction/sources/02-*/extracted/publications-journals.yaml` |
| `publications/conferences.yaml` | 1 of 141 (dry-run, chosen to test the Recognition cross-link) | `data-extraction/sources/02-*/extracted/publications-conferences.yaml` |
| `publications/workshops.yaml`, `invited-papers.yaml`, `book-chapters.yaml` | Not started | `data-extraction/sources/02-*/extracted/publications-*.yaml` |
| `recognitions/best-paper-awards.yaml` | 1 of 7 (dry-run) | `data-extraction/sources/02-*/extracted/recognitions.yaml` |
| `recognitions/` (other 4 category files) | Not started | same |
| `service.yaml`, `teaching.yaml` | Not started | `data-extraction/sources/02-*/extracted/services.yaml`, `teaching.yaml` |
| `posts/` | 2 (1 news, 1 blog — chosen to test that `Post` handles both shapes) | `data-extraction/sources/01-*/extracted/news-events.yaml`, `blog-posts.yaml` |
| `sponsors.yaml` | Empty — no real data exists in any source yet | — |

## Verification findings from this dry run

Captured inline as comments in the relevant files, summarized here:

1. **`labTenure` doesn't map cleanly onto a founder/PI** — there's no real "joined the lab" date distinct from "started the lab." Left blank for the lab lead rather than inventing one.
2. **Many PhD students have no `joined`/`left` year in the source data at all** (not just "still active" — genuinely never recorded). Worth deciding whether to backfill approximate years during the full merge.
3. **The Publication/Recognition boundary works as designed** — `conferences.yaml`'s XSP entry and `recognitions/best-paper-awards.yaml`'s matching entry stay in sync via `publicationId` instead of duplicating the award fact in `Publication.note`.
4. **Recognition attribution is a real open question**: the source presents all awards under the PI's own page, even for papers where he isn't first author (e.g. "C. Li et al."). Schema supports per-person attribution (`Recognition.personId`) — deciding *whose* achievement each entry really is is a content decision for the full merge pass, not resolved here.
5. **2 of 3 open-source projects have unverified repo links** (point at a person's GitHub profile, not a project repo) — carried forward from the extraction notes, not fixed here.
6. **`Post` correctly handles both News and Blog shapes** without needing separate entities — news items can optionally carry a short body (not just a one-liner), confirming the unification decision in `docs/SCHEMA.md`.
7. **`Publication.authors` was a plain string in the original schema — fixed to a structured `{name, personId?}[]` array.** The original design deliberately avoided linking authors to `Person` records at all, reasoning that most co-authors are external. That was wrong: it also meant the PI, who's on nearly every publication, never linked to his own `Person` record either. All 3 dry-run publications now link `"J. Xiong"` → `jinjun-xiong` wherever the source explicitly names him; the other (external) co-authors stay name-only. See `docs/SCHEMA.md`'s new "Mongo, not SQL" principle. `Project.contributors?: string[]` was added the same way (distinct from `collaborationWith`, which is an external org name, not a person) — not yet populated on the 3 real projects since we don't have confirmed contributor data for them.

## Next steps

1. Full merge pass across `data-extraction/sources/01-03` into this shape (the bulk of the 301 publications, full team roster, service/teaching/recognitions).
2. Resolve the deferred `site-meta.yaml` content decisions (contact address, `primaryInstitutionId`).
3. Pick and apply a permanent `Publication.id` generation scheme before bulk-importing the remaining ~298 publications.
