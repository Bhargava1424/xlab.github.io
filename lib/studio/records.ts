// Turning edited records into file content, and auditing the content set for problems.
"use client";

import { stringify } from "yaml";
import type { EntityDef } from "./entities";
import type { SnapshotContent } from "./api";

// --- serialization -------------------------------------------------------------

/** Drop empty values so records stay minimal and diffs stay readable. */
function prune(value: unknown): unknown {
  if (Array.isArray(value)) {
    const arr = value.map(prune).filter((v) => v !== undefined);
    return arr.length ? arr : undefined;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      const p = prune(v);
      if (p !== undefined) out[k] = p;
    }
    return Object.keys(out).length ? out : undefined;
  }
  if (value === "" || value === undefined) return undefined;
  return value;
}

/**
 * Serialize a record to its on-disk representation.
 *
 * Posts are MDX: the markdown body lives below the frontmatter, not inside it, so the body
 * is split back out here. Everything else is plain YAML.
 */
export function serializeRecord(entity: EntityDef, record: Record<string, unknown>): string {
  const cleaned = (prune(record) ?? {}) as Record<string, unknown>;

  if (entity.ext === "mdx") {
    const { body, ...frontmatter } = cleaned as { body?: string };
    const yaml = stringify(frontmatter, { lineWidth: 0 }).trimEnd();
    return `---\n${yaml}\n---\n\n${(body ?? "").trim()}\n`;
  }
  return stringify(cleaned, { lineWidth: 0 });
}

// --- image preparation ---------------------------------------------------------

/**
 * Downscale and re-encode an image in the browser before it is committed.
 *
 * Uploads land in the git repo permanently, so a 6 MB phone photo would be carried in every
 * clone forever. Capping the long edge and re-encoding keeps member photos in the tens of
 * kilobytes. PNG input is preserved as PNG because logos and cutouts rely on transparency;
 * everything else becomes JPEG, which is far smaller for photographs.
 */
export async function prepareImage(
  file: File,
  maxEdge = 900
): Promise<{ base64: string; ext: "png" | "jpg"; bytes: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("could not process this image");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const keepAlpha = file.type === "image/png" || file.type === "image/webp";
  const dataUrl = keepAlpha
    ? canvas.toDataURL("image/png")
    : canvas.toDataURL("image/jpeg", 0.85);

  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return {
    base64,
    ext: keepAlpha ? "png" : "jpg",
    bytes: Math.round((base64.length * 3) / 4),
  };
}

// --- data health ---------------------------------------------------------------

export type IssueLevel = "error" | "warning";

export interface HealthIssue {
  level: IssueLevel;
  entity: string;
  id?: string;
  message: string;
}

/**
 * Client-side mirror of the checks in lib/content/validate.ts.
 *
 * This is a convenience view, NOT the enforcement point — CI is. It exists so problems are
 * visible while editing rather than only after a submission fails, and so the owner can see
 * at a glance what the content set is missing.
 */
export function auditContent(content: SnapshotContent): HealthIssue[] {
  const issues: HealthIssue[] = [];
  const ids = {
    people: new Set(content.people.map((p) => p.id)),
    themes: new Set(content.researchThemes.map((t) => t.id)),
    publications: new Set(content.publications.map((p) => p.id)),
    institutions: new Set(content.institutions.map((i) => i.id)),
  };

  const ref = (
    value: string | undefined | null,
    set: Set<string>,
    entity: string,
    id: string,
    field: string
  ) => {
    if (value && !set.has(value)) {
      issues.push({ level: "error", entity, id, message: `${field} "${value}" does not resolve` });
    }
  };

  for (const p of content.people) {
    for (const a of p.affiliations ?? []) {
      ref(a.institutionId, ids.institutions, "people", p.id, "affiliations.institutionId");
    }
    if (!p.photo) issues.push({ level: "warning", entity: "people", id: p.id, message: "no photo" });
    if (p.personType !== "lab-lead" && p.labTenure?.joinedYear === undefined) {
      issues.push({ level: "warning", entity: "people", id: p.id, message: "no joined year — cannot become alumni" });
    }
    if (!p.links?.email && !p.links?.website && !p.links?.scholar) {
      issues.push({ level: "warning", entity: "people", id: p.id, message: "no contact or profile links" });
    }
  }

  for (const p of content.publications) {
    for (const t of p.themeIds ?? []) ref(t, ids.themes, "publications", p.id, "themeIds");
    for (const a of p.authors ?? []) ref(a.personId, ids.people, "publications", p.id, "authors.personId");
    if (!p.themeIds?.length) {
      issues.push({ level: "warning", entity: "publications", id: p.id, message: "no research theme — hidden from the research browser" });
    }
  }

  for (const r of content.recognitions) {
    ref(r.personId, ids.people, "recognitions", r.id, "personId");
    ref(r.publicationId, ids.publications, "recognitions", r.id, "publicationId");
  }
  for (const p of content.projects) {
    for (const t of p.themeIds ?? []) ref(t, ids.themes, "projects", p.id, "themeIds");
    for (const c of p.contributors ?? []) ref(c, ids.people, "projects", p.id, "contributors");
    ref(p.links?.publicationId, ids.publications, "projects", p.id, "links.publicationId");
  }
  for (const p of content.posts) {
    ref(p.authorId, ids.people, "posts", p.id, "authorId");
    ref(p.relatedPublicationId, ids.publications, "posts", p.id, "relatedPublicationId");
  }
  for (const s of content.service) ref(s.personId, ids.people, "service", s.id, "personId");
  for (const c of content.courses) {
    ref(c.personId, ids.people, "courses", c.id, "personId");
    ref(c.institutionId, ids.institutions, "courses", c.id, "institutionId");
  }

  return issues;
}

/** 0–100 completeness for a person, used for the roster nudge list. */
export function personCompleteness(person: SnapshotContent["people"][number]): number {
  const checks = [
    Boolean(person.photo),
    Boolean(person.bio),
    Boolean(person.roleTitle),
    Boolean(person.links?.email),
    Boolean(person.links?.scholar || person.links?.website),
    Boolean(person.affiliations?.length),
    person.labTenure?.joinedYear !== undefined,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
