# Site Map

The page/route skeleton every entity doc in this folder hangs its placements off of. Builds on the real nav already committed in `content/site-meta.yaml` (Home / Research / Publications / Team / News) and fills in the gaps needed to place every entity somewhere concrete.

```
/                          Home — single long scroll, poloclub-style
  ├─ Hero                  SiteMeta.title/tagline/logo + computed stats strip
  ├─ Current team strip    Person (current members only) — small avatar row
  ├─ Latest News           Post (kind=news), most recent N, "See all →" to /news
  ├─ Research sections     ResearchTheme × N, each with its Project cards inline
  ├─ Featured Publications Publication (featured=true), cross-lab highlight strip
  ├─ Teaching               Course × all — consolidated table (see course.md)
  ├─ Sponsors               Sponsor × all — logo grid
  └─ Footer                SiteMeta.contact / socialLinks / copyright

/research                  Full version of Home's research sections — same
                            ResearchTheme + Project data, un-truncated, with
                            longDescription shown (Home only shows shortDescription)

/publications               Publication, category tabs (Patents / Journals /
                            Conferences / Workshops / Invited Papers / Book
                            Chapters), sorted by year desc within each tab

/team                       Person grid, grouped by personType, current vs
                            alumni split within each group (via labTenure)
  └─ /team/<slug>           Only for people with profile, affiliations history,
                            or any Recognition/ServiceRecord/Course records —
                            everyone else's card links straight to their
                            external links instead of an internal page
      ├─ Bio / profile      Person.bio, Person.profile.*
      ├─ Affiliations       Person.affiliations (full history)
      ├─ Recognitions       Recognition where personId = this person
      ├─ Service            ServiceRecord where personId = this person
      └─ Teaching           Course where personId = this person

/news                       Post (kind=news), full chronological archive
  └─ /news/<slug>            Only if Post.body is present — a short news item
                            with no body has nothing to show beyond the feed
                            entry, so no detail page is generated for it

/blog                        Post (kind=blog), full chronological archive
  └─ /blog/<slug>            Always — blog posts are expected to have a body

(no dedicated page)          Project — cards live inside their ResearchTheme's
                            section on Home/Research and link OUT via
                            links.{paperUrl,code,demo,video,poster,website};
                            matches poloclub's own pattern of never hosting
                            project detail pages itself

(no dedicated page)          Institution, Sponsor — referenced/displayed
                            inline wherever relevant, never browsable on
                            their own
```

## Open decisions this site map makes (not yet locked in)

1. **`/blog` as a separate route from `/news`.** The real nav today only lists `/news`. `Post.kind` already discriminates the two, so adding `/blog` is additive, not a schema change — but it's a nav decision someone should confirm before building it. Alternative: fold blog posts into `/news` with a kind filter toggle instead of a separate route.
2. **Publications nav.** `content/site-meta.yaml`'s nav currently shows only 2 example children (Patents, Journals) under Publications. The schema has 6 categories; this doc assumes all 6 become tabs/filters on one `/publications` page rather than 6 separate nav entries.
3. **Person detail pages are conditional**, not automatic for all ~17+ team members — only generated for people with enough content to justify a page (profile, multi-entry affiliation history, or any Recognition/Service/Course records). Everyone else is a card-only entry linking to their external site/email/scholar. This keeps the team page from having a sea of near-empty detail pages for every PhD student who's only ever had one line of data.
