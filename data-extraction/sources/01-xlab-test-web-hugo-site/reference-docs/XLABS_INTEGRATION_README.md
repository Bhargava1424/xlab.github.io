# X‑Labs Hugo Integration Guide

This document explains the XLabs structure integration into the existing Hugo site. The integration is **non-destructive** — it extends the current Gokarna theme without replacing it.

## Current Status

✅ **Completed:**
- Created feature branch `feat/xlabs-structure`
- Set up data file structure (`data/team/`, `data/research/`, `data/socials.yaml`, `data/home.yaml`, `data/opensource.yaml`)
- Created image placeholder folders under `assets/images/`
- Extended `hugo.toml` with new menu items and parameters (tagline, recruiting_notice)
- Populated team data with current PhD students
- Populated research themes (6 areas)
- Added open source projects

🚧 **To Complete:**
- Create shortcodes (heroCarousel, newsCarousel, youtube, personCard)
- Create content pages (about, research, team, open-source, news, blog, gallery)
- Create archetypes for content types
- Prepare and copy images to placeholder folders
- Test site build

## Folder Structure

```
xlab-test-web/
├─ data/
│  ├─ home.yaml               # Hero carousel highlights
│  ├─ socials.yaml            # Social media links (GitHub, HuggingFace, LinkedIn)
│  ├─ opensource.yaml         # Open source project cards
│  ├─ publications.bib        # (placeholder for Google Scholar import)
│  ├─ team/
│  │  ├─ lead.yaml           # Professor/Lab Lead
│  │  ├─ staff.yaml          # Staff members
│  │  ├─ phd.yaml            # PhD students
│  │  ├─ grads.yaml          # Grad/undergrad collaborators
│  │  └─ alumni.yaml         # Alumni
│  └─ research/
│     └─ themes.yaml         # Research theme tiles
│
├─ assets/images/            # Image placeholders (add your images here)
│  ├─ branding/
│  │  ├─ logo-mark.svg           # Small logo for header
│  │  ├─ logo-full-light.svg     # Full logo for light theme
│  │  └─ logo-full-dark.svg      # Full logo for dark theme
│  ├─ professor/
│  │  ├─ professor-light.webp    # Professor portrait (light theme)
│  │  └─ professor-dark.webp     # Professor portrait (dark theme)
│  ├─ hero/
│  │  ├─ highlight-001.webp      # Hero carousel images
│  │  ├─ highlight-002.webp
│  │  └─ highlight-003.webp
│  ├─ icons/                     # SVG icons for research themes
│  │  ├─ ai-algorithms.svg
│  │  ├─ ai-solutions.svg
│  │  ├─ ai-systems.svg
│  │  ├─ ai-accelerators.svg
│  │  ├─ ai-security.svg
│  │  └─ ai-tools.svg
│  ├─ team/                      # Team member photos (rectangular, 4:5 aspect)
│  │  ├─ amir.webp
│  │  ├─ changjae.webp
│  │  ├─ yuting.webp
│  │  ├─ jiajie.webp
│  │  └─ dancheng.webp
│  ├─ news/                      # News post images
│  │  └─ <yyyy-mm>/<slug>/
│  ├─ gallery/                   # Gallery event images
│  │  └─ <event-slug>/
│  └─ opensource/                # Open source project banners
│     ├─ mlmodelscope/banner.webp
│     ├─ synctree/banner.webp
│     └─ quadranet/banner.webp
│
├─ layouts/                  # Project-level layouts (extend Gokarna)
│  ├─ partials/              # Custom partials (to be created)
│  │  ├─ hero-carousel.html
│  │  ├─ news-carousel.html
│  │  └─ person-card.html
│  └─ shortcodes/            # Custom shortcodes (to be created)
│     ├─ heroCarousel.html
│     ├─ newsCarousel.html
│     ├─ youtube.html
│     └─ personCard.html
│
├─ content/                  # Content pages (to be created)
│  ├─ about/_index.md
│  ├─ research/_index.md
│  ├─ team/_index.md
│  ├─ open-source/_index.md
│  ├─ news/_index.md
│  ├─ blog/_index.md
│  └─ gallery/_index.md
│
└─ archetypes/               # Content templates (to be created)
   ├─ news.md
   ├─ gallery.md
   ├─ project.md
   └─ blog.md
```

## Configuration

### New Parameters in `hugo.toml`

```toml
[params]
  tagline = "Accelerating AI Systems & Solutions"
  recruiting_notice = "We are recruiting PhD students..."
```

### New Menu Items

Added to existing menu:
- About Us (weight: 7)
- Research (weight: 8)
- Team (weight: 9)
- Open Source (weight: 10)
- News & Media (weight: 11)
- Blog (weight: 12)
- Gallery (weight: 13)

## Data File Schemas

### Team Members (`data/team/*.yaml`)

```yaml
- name: "Full Name"
  role: "Position/Title"
  photo: "images/team/slug.webp"
  links:
    linkedin: "https://linkedin.com/in/id"
    email: "email@university.edu"
    website: "https://personal-site.com"
  joined: 2022
  left: ~        # null for current, or year (2024) for alumni
```

**Display Rules:**
- Grid: 5 per row, last row centered
- Professor: omit years
- Current members: show as `YYYY-`
- Alumni: show as `YYYY-YYYY`
- Links: only show icons if URL is non-empty

### Research Themes (`data/research/themes.yaml`)

```yaml
themes:
  - id: "theme-id"          # For anchors
    icon: "images/icons/icon.svg"
    title: "Theme Title"
    short: "Brief description"
    long: "Expanded description"
```

### Open Source Projects (`data/opensource.yaml`)

```yaml
projects:
  - slug: "project-slug"
    title: "Project Title"
    banner: "images/opensource/slug/banner.webp"
    repo: "https://github.com/org/repo"
    desc: "Short description"
```

### Hero Highlights (`data/home.yaml`)

```yaml
highlights:
  - src: "images/hero/highlight-001.webp"
    alt: "Alt text description"
```

### Social Links (`data/socials.yaml`)

```yaml
github: "https://github.com/org-or-user"
huggingface: "https://huggingface.co/org"
linkedin_prof: "https://www.linkedin.com/in/handle/"
```

## Image Specifications

### Formats & Sizes
- **Format:** Prefer `.webp` for size optimization
- **Max dimension:** 1920px for banners/hero images
- **Team portraits:** 3:4 or 4:5 aspect ratio, rectangular
- **Object-fit:** Use `object-fit: cover` in CSS

### Naming Conventions
- **Logos:** `logo-mark.svg`, `logo-full-light.svg`, `logo-full-dark.svg`
- **Professor:** `professor-light.webp`, `professor-dark.webp`
- **Hero:** `highlight-###.webp` (001, 002, ...)
- **News:** `assets/images/news/<yyyy-mm>/<slug>/NNN.webp`
- **Gallery:** `assets/images/gallery/<event-slug>/NNN.webp`
- **Open Source:** `assets/images/opensource/<project-slug>/banner.webp`

## Shortcodes to Implement

### 1. `{{< heroCarousel >}}`
Renders hero carousel from `data/home.yaml.highlights`
- 50% opacity images
- Autoplay every 5s
- Left/right arrows
- Optional dots

### 2. `{{< newsCarousel max=6 >}}`
Renders latest N news posts
- Shows title + thumb + date
- Clickable to full post
- Horizontal slider

### 3. `{{< youtube id="video-id" >}}`
Embeds YouTube video
- Responsive iframe
- Standard YouTube embed

### 4. `{{< personCard .person >}}`
Renders a team member card
- Photo, name, role
- Links (LinkedIn, email, website) - only if present
- Years (formatted per rules)

## Content Page Front Matter

### Home (`content/_index.md`)
```yaml
---
title: "Home"
hero:
  show_logo_full: true
intro:
  heading: "Welcome to our Lab"
  short: "Brief intro paragraph"
  more_link: "/about/"
professor:
  portrait_light: "images/professor/professor-light.webp"
  portrait_dark: "images/professor/professor-dark.webp"
news:
  show_carousel: true
  max_items: 6
callouts:
  recruiting: true
---
```

### About (`content/about/_index.md`)
```yaml
---
title: "About Us"
sections:
  - id: "professor"
    title: "Our Lab Lead"
    body: "<Markdown content>"
  - id: "campus"
    title: "Our Campus"
    body: "<Markdown content>"
---
```

### Research (`content/research/_index.md`)
```yaml
---
title: "Research"
themes_from: "data/research/themes.yaml"
publications:
  source: "data/publications.bib"
  note: "Imported from Google Scholar later."
---
```

### Team (`content/team/_index.md`)
```yaml
---
title: "Team"
# Team renders from data/team/*.yaml files
---
```

### News Post (`content/news/<slug>/index.md`)
```yaml
---
title: "News Headline"
date: 2025-01-01
summary: "Brief blurb"
thumb: "images/news/2025-01/<slug>/thumb.webp"
youtube: "https://youtu.be/id"  # optional
banner: "images/news/2025-01/<slug>/banner.webp"
images:
  - "images/news/2025-01/<slug>/001.webp"
tags: [event, talk]
---
```

### Gallery Event (`content/gallery/<event-slug>/index.md`)
```yaml
---
title: "Event Title"
date: 2025-01-01
images:
  - src: "images/gallery/<event-slug>/001.webp"
    caption: "Caption text"
---
```

## Theming (Light/Dark)

CSS should use `data-theme="light|dark"` attribute on `<html>`:

```css
:root {
  --bg: #ffffff;
  --fg: #111111;
  --muted: #666;
}

:root[data-theme='dark'] {
  --bg: #0e0e0f;
  --fg: #efefef;
  --muted: #9aa0a6;
}

/* Swap images based on theme */
[data-theme='light'] .logo-full-light { display: block; }
[data-theme='light'] .logo-full-dark { display: none; }
[data-theme='dark'] .logo-full-light { display: none; }
[data-theme='dark'] .logo-full-dark { display: block; }
```

## Grid Layouts

```css
/* Team: 5 per row, centered last row */
.people-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 1rem;
  justify-content: center;
}

/* Open Source: 3 per row */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

/* Gallery: 4 per row */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}
```

## Next Steps

1. **Copy Images:** Place your images in the `assets/images/` folders following the naming conventions above

2. **Create Shortcodes:** Implement the four shortcodes in `layouts/shortcodes/`

3. **Create Content Pages:** Add the content pages using the front matter schemas above

4. **Create Archetypes:** Add archetypes for easy content creation with `hugo new`

5. **Test Build:**
   ```bash
   cd /home/csgrad/utkarshk/projects/xlab-web/xlab-test-web
   hugo server -D
   ```

6. **Commit and Push:**
   ```bash
   git add -A
   git commit -m "Integrate X‑Labs structure and data files"
   git push origin feat/xlabs-structure
   ```

## Development Command

To run the site in development mode:

```bash
cd /home/csgrad/utkarshk/projects/xlab-web/xlab-test-web
hugo server -D
```

The site will be available at `http://localhost:1313`

## Support

This integration extends the existing Gokarna theme without replacing it. All customizations are additive and placed in project-level directories (`layouts/`, `data/`, `assets/`).

---

**Branch:** `feat/xlabs-structure`
**Status:** Data files and configuration complete. Layouts, shortcodes, and content pages pending.

