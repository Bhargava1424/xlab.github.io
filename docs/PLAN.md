# Lab Website — Planning Notes

Living document capturing decisions made before any code is written. Update it as decisions change; don't let it drift from what's actually true.

## 1. Inspiration: analysis of poloclub.github.io

We studied [poloclub.github.io](https://poloclub.github.io/) (Polo Club of Data Science, Georgia Tech) as a reference for what a strong academic lab site looks like. Summary of findings:

**Stack**: Jekyll (GitHub Pages default) + Bootstrap 3, built on the free "Start Bootstrap: Agency" one-page template, Font Awesome 6 icons, Google Fonts (Roboto), particles.js for an animated hero background, Google Analytics. No JS framework, no build pipeline beyond Jekyll's own.

**Information architecture**: One long-scroll homepage (`index.html`) with anchor-linked nav, plus a couple of standalone pages (`faq.html`, `news.html` for the full archive). Interactive project demos are **not** embedded — each project lives in its own repo, deployed to its own `poloclub.github.io/<project>/` subsite, and the lab homepage just links out to it.

**Homepage sections, in order**:
1. Fixed navbar — lab name, research-area anchors, Members, Courses, Sponsors, external links (blog, YouTube, GitHub, socials).
2. Hero — particle-animated dark background, logo, one-line tagline, an "impact banner" of stat badges (users, downloads, GitHub stars, students taught, tools shipped, social reactions).
3. Current-team avatar strip directly under the hero.
4. "Latest News" — reverse-chronological, emoji-prefixed one-liners, each linking out to the relevant paper/person/press; "more news" link to the full archive page.
5. Research-thrust sections (they have four) — heading + one-paragraph description, then a grid of project/paper cards. Every card follows the same schema: thumbnail, title, one-line tagline, optional "Deployed" badge, optional "Collaboration with X" badge, row of icon link-buttons (PDF, code, live demo, video, poster).
6. Members section — current members + alumni, circular photo + name + degree + social icons, alumni annotated with current employer.
7. Courses section — table of taught courses with per-semester enrollment and a small bar visualization.
8. Sponsors — logo grid linking to funder sites, text blurb listing grant numbers.
9. Footer.

**Design system**: white/near-white sections alternating with light gray for rhythm, near-black hero, single gold/amber accent color, Roboto throughout, Bootstrap grid, consistent card shadow treatment, fully responsive via Bootstrap breakpoints.

**The architecturally smart part** (worth reusing) is that news items, projects, and team members are all short structured data entries (Jekyll data files) looped into a reusable card component via Liquid — not hand-written HTML per entry. That's what keeps the site cheap to update and lets it stay current with minimal effort. **This is the pattern we're borrowing — not the Bootstrap visual theme.**

## 2. Our decision: don't clone it

We are inspired by the *structure* (single long-scroll page, data-driven sections: hero/impact stats, news feed, research areas as project-card grids, team, sponsors) but the final design must be visually and structurally our own — different type/color system, different component design, and likely a different section flow once we know our actual content. The goal is a site that is clearly informed by poloclub.github.io but does not read as a reskin of it.

## 3. Stack decision

We're keeping the author's existing stack rather than adopting Jekyll/Bootstrap, since it's a better fit for building something visually distinct and it's the author's home turf:

- **Next.js** (React) — static export mode
- **Tailwind CSS**
- **shadcn/ui** for components
- **No FastAPI / no backend** for this site (see below)

Rationale: the site's content (team, papers, news, projects) is fundamentally static — nothing here needs a server per request. Next.js gives full component/design control (which Jekyll+Bootstrap doesn't, without deep theme surgery) while being a stack the author already knows well, so there's no ramp-up cost. The data-driven-cards idea from Poloclub's Jekyll setup translates directly: structured data files (JSON/YAML/MDX) feed reusable React components instead of Liquid loops — same maintainability win, different language.

FastAPI is explicitly out of scope for now. If a future need arises (e.g. an admin UI for adding news/projects without touching code, a contact form with server-side handling), that's a separate decision to revisit — not a default part of this build.

## 4. Hosting: GitHub Pages, fully static — **hard constraint**

**The site must be fully static.** Hosting is GitHub Pages (this repo, `xlab.github.io`), not Vercel, per explicit preference. This has concrete implications for how the Next.js app must be built:

- Next.js must run in **static export mode** (`output: 'export'` in `next.config`).
- **No API routes, no server actions, no middleware, no ISR/on-demand revalidation, no server-side rendering at request time.** GitHub Pages only serves static files — anything that needs a live server is off the table for this deployment.
- Any dynamic-feeling behavior (search/filter, animations, stat counters, etc.) must be achieved client-side in the browser after a static HTML/JS bundle loads — not via a backend.
- If a genuine need for server-side logic emerges later, that requires a separate hosting decision (e.g. Vercel, or a small standalone API elsewhere) — it is out of scope for the current plan and should not silently creep in via a Next.js feature that assumes a server.

## 5. Content/data architecture — **decided**

Mirroring the good part of Poloclub's setup: content lives as structured data (YAML/MDX files), not hardcoded into JSX, so that adding a news item, project, or team member is a data edit, not a code edit.

The full schema (entity list, TypeScript types, file layout, and the reasoning behind each decision) is documented in **`docs/SCHEMA.md`**, with the types themselves in **`types/content.ts`**. The single most important property of the schema: nothing hardcodes one institution. The lab currently has people affiliated with more than one university simultaneously, and that's a real, ongoing situation — so affiliation is modeled per-person and historically (see `Institution`/`Affiliation`/`Person.labTenure` in `docs/SCHEMA.md`), not as a sitewide constant. Don't reintroduce a hardcoded institution anywhere in the app later; route everything through this model.

A partial, dry-run population of real data into this schema exists under `content/` — see `content/README.md` for what's populated vs. pending. It's there to validate the schema against real records, not as the finished dataset.

## 6. Data extraction — **done**

Three sources have been collected and organized under `data-extraction/sources/`:
1. The old half-built Hugo/Gokarna site (`xlab-test-web`) — team roster, lab identity, research themes, 2 real news items, 2 real blog posts, logo, team photos.
2. The current live site (`xlab-ub.com`) — the PI's full academic portfolio: rich bio, research agenda, 301 itemized publications, full recognitions/service/teaching records.
3. Google Scholar + a UTSA news article + LinkedIn — reveals the PI became Founding Dean of UT San Antonio's new College of AI, Cyber and Computing in March 2026, while remaining adjunct at UB. See `data-extraction/README.md` for the full breakdown, including what's real vs. leftover demo content in Source 1.

See `data-extraction/README.md` for the index and each source's `SOURCE-NOTES.md` for details, gaps, and open questions.

## 7. Next step: full data merge pass

`content/` currently holds a small validated slice (2 people, 3 projects, 3 publications, 1 recognition, 2 posts — see `content/README.md`). The next step is merging the full data from all three `data-extraction/` sources into this shape: the remaining ~15 team members, ~298 publications, full service/teaching/recognitions records, and resolving the deferred `site-meta.yaml` decisions (contact address, primary institution) noted in `docs/SCHEMA.md`. Next.js app scaffolding follows once that's in hand.

## 8. Content placement — **decided**

`docs/SCHEMA.md` says what data exists; **`docs/content-placement/`** says where each field actually renders — every entity's every field mapped to a specific page/section/component, with a page-hierarchy skeleton (`docs/content-placement/site-map.md`) tying it all together. Read that folder before building any page component, so the UI isn't invented ad hoc against the schema.

The one decision worth knowing up front: `Recognition`, `ServiceRecord`, and `Course` all render on the owning person's `/team/<slug>` page, not as standalone top-level site sections — a deliberate departure from how the real `xlab-ub.com` site presents them (as its own top-level pages), made to fit poloclub's lab-roster structure instead of a personal-CV structure. See `docs/content-placement/README.md` for the reasoning.
