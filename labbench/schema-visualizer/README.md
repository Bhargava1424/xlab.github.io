# X-Lab Schema Visualizer

An interactive, drag/zoom/pan diagram of the site's content data schema (`../../types/content.ts`, documented in `../../docs/SCHEMA.md`). Built with React Flow — dark ER-diagram style, one card per entity, field-level connector lines for foreign keys, click a card for a full detail panel (fields, rationale, relationships, live record counts).

**This app is not part of the deployed site.** It never gets built, bundled, or deployed with `xlab.github.io` — it's a standalone dev tool that lives in `labbench/` specifically so it can't accidentally end up in the production build. See `labbench/README.md`.

## Run it

```bash
npm install
npm run dev
```

Opens on the usual Vite dev port. `npm run build` produces a static `dist/` you can open locally or drag into a static file server — still never deployed anywhere.

## How it stays accurate

- **Schema**: hand-encoded in `src/lib/schema-graph.ts`, mirroring `../../types/content.ts` and `../../docs/SCHEMA.md`. If the real schema changes, update this file to match — there's no automated sync (the real schema is TypeScript interfaces for a Next.js app that doesn't exist yet; this file is a deliberate, readable re-encoding of it for visualization, not a parser).
- **Record counts**: live. `scripts/scan-content.mjs` scans the real `../../content/` directory and writes `src/content-status.generated.json` — this runs automatically before both `dev` and `build` (via npm's `predev`/`prebuild` hooks), so the counts shown on each card always reflect the actual current state of `content/`, not a stale snapshot. Run `npm run scan` to refresh it manually.
- **Layout**: computed, not hand-placed. `src/lib/layout.ts` runs `@dagrejs/dagre` against the real field-derived card dimensions (`estimateNodeHeight` in `schema-graph.ts` mirrors `EntityCard`'s actual row math) and the FK edge graph, producing a hierarchical left-to-right arrangement with guaranteed no overlaps. Run `npm run verify-layout` after adding/removing entities or fields — it's a standalone numeric check (no browser needed) that prints every card's computed box and flags any overlap, so a layout regression is caught before you even open the app.

## Dragging and layout

Nodes are draggable (React Flow's `useNodesState`/`onNodesChange` wiring — dragging updates real component state, so it persists through search/filtering). The initial hierarchical layout is a starting point, not a cage: rearrange anything, it stays put. There's no "reset layout" button by design — reload the page to get back to the computed layout.

## What you get

- Every entity as a table-style card: header (name + tier badge + live record count), field rows (name, type, required/optional marker, PK/FK icon).
- Dashed connector lines from FK fields to the specific `id` row they reference (not just card-to-card).
- Click a card → detail panel: full field list with notes, the design rationale for that entity, and its incoming/outgoing relationships.
- Search box: filters/highlights entities and fields by name or type.
- Toggle: show/hide SECONDARY-tier entities (Recognition, ServiceRecord, Course, Sponsor) to focus on the CORE schema.
- Drag any card to rearrange; pan/zoom/minimap for navigating the whole graph.
