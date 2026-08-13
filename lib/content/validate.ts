// Cross-record integrity checks — the constraints a relational database would have given
// us for free, and which content/ had none of before v2.
//
// Per-record shape validation lives in schema.ts and runs during load. This file covers the
// rules a single record cannot express:
//
//   * REFERENTIAL INTEGRITY — every foreign key resolves. Previously a dangling personId or
//     themeId passed validation and silently rendered nothing, which is the worst kind of
//     bug: invisible in CI, invisible on the page, discovered by a visitor.
//   * ASSET INTEGRITY — every referenced image actually exists on disk.
//   * KEY UNIQUENESS — enforced structurally by filename===id (see loader.ts), re-asserted
//     here as a defence in depth.
//
// Warnings are reported but never fail the build; errors fail it.
import fs from "fs";
import path from "path";
import { loadAllRecords, type AllContent } from "./index";
import { ContentValidationError } from "./loader";

export interface ValidationReport {
  errors: string[];
  warnings: string[];
  counts: Record<string, number>;
}

const PUBLIC_ROOT = path.join(process.cwd(), "public");

function assetExists(assetPath: string): boolean {
  return fs.existsSync(path.join(PUBLIC_ROOT, assetPath.replace(/^\//, "")));
}

/** Collect every image path referenced anywhere in the content tree. */
function referencedAssets(c: AllContent): Map<string, string[]> {
  const refs = new Map<string, string[]>();
  const add = (p: string | undefined, where: string) => {
    if (!p) return;
    refs.set(p, [...(refs.get(p) ?? []), where]);
  };
  add(c.siteMeta.logo?.light, "site.yaml logo.light");
  add(c.siteMeta.logo?.dark, "site.yaml logo.dark");
  for (const x of c.people) add(x.photo, `people/${x.id}.yaml photo`);
  for (const x of c.projects) add(x.thumbnail, `projects/${x.id}.yaml thumbnail`);
  for (const x of c.publications) add(x.thumbnail, `publications/${x.id}.yaml thumbnail`);
  for (const x of c.posts) add(x.image, `posts/${x.id}.mdx image`);
  for (const x of c.institutions) add(x.logo, `institutions/${x.id}.yaml logo`);
  for (const x of c.sponsors) add(x.logo, `sponsors/${x.id}.yaml logo`);
  return refs;
}

export function validateContent(): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];

  let content: AllContent;
  try {
    content = loadAllRecords();
  } catch (err) {
    if (err instanceof ContentValidationError) {
      // Schema errors block the integrity pass — there is no reliable data to check FKs
      // against until shapes are correct. Report them and stop.
      return {
        errors: err.message.split("\n").slice(1).map((l) => l.replace(/^\s*-\s*/, "")),
        warnings: ["integrity checks skipped — fix the schema errors above first"],
        counts: {},
      };
    }
    throw err;
  }

  // --- id uniqueness (defence in depth; filename===id already enforces this) ----
  const idSets: Record<string, Set<string>> = {};
  const checkUnique = (kind: string, records: { id: string }[]) => {
    const seen = new Set<string>();
    for (const r of records) {
      if (seen.has(r.id)) errors.push(`${kind}: duplicate id "${r.id}"`);
      seen.add(r.id);
    }
    idSets[kind] = seen;
  };
  checkUnique("institutions", content.institutions);
  checkUnique("people", content.people);
  checkUnique("themes", content.researchThemes);
  checkUnique("projects", content.projects);
  checkUnique("publications", content.publications);
  checkUnique("posts", content.posts);
  checkUnique("recognitions", content.recognitions);
  checkUnique("service", content.service);
  checkUnique("courses", content.courses);
  checkUnique("sponsors", content.sponsors);

  // --- referential integrity ---------------------------------------------------
  const ref = (
    value: string | undefined | null,
    target: keyof typeof idSets,
    where: string
  ) => {
    if (value === undefined || value === null) return;
    if (!idSets[target].has(value)) {
      errors.push(`${where}: "${value}" does not resolve to any ${target} record`);
    }
  };

  if (content.siteMeta.primaryInstitutionId) {
    ref(content.siteMeta.primaryInstitutionId, "institutions", "site.yaml primaryInstitutionId");
  }

  for (const p of content.people) {
    for (const [i, a] of (p.affiliations ?? []).entries()) {
      ref(a.institutionId, "institutions", `people/${p.id}.yaml affiliations[${i}].institutionId`);
    }
  }

  for (const p of content.projects) {
    for (const [i, t] of p.themeIds.entries()) {
      ref(t, "themes", `projects/${p.id}.yaml themeIds[${i}]`);
    }
    for (const [i, c] of p.contributors.entries()) {
      ref(c, "people", `projects/${p.id}.yaml contributors[${i}]`);
    }
    ref(p.links?.publicationId, "publications", `projects/${p.id}.yaml links.publicationId`);
  }

  for (const p of content.publications) {
    for (const [i, t] of p.themeIds.entries()) {
      ref(t, "themes", `publications/${p.id}.yaml themeIds[${i}]`);
    }
    for (const [i, a] of p.authors.entries()) {
      ref(a.personId, "people", `publications/${p.id}.yaml authors[${i}].personId`);
    }
  }

  for (const p of content.posts) {
    ref(p.authorId, "people", `posts/${p.id}.mdx authorId`);
    ref(p.relatedPublicationId, "publications", `posts/${p.id}.mdx relatedPublicationId`);
  }

  for (const r of content.recognitions) {
    ref(r.personId, "people", `recognitions/${r.id}.yaml personId`);
    ref(r.publicationId, "publications", `recognitions/${r.id}.yaml publicationId`);
  }

  for (const s of content.service) {
    ref(s.personId, "people", `service/${s.id}.yaml personId`);
  }

  for (const c of content.courses) {
    ref(c.personId, "people", `courses/${c.id}.yaml personId`);
    ref(c.institutionId, "institutions", `courses/${c.id}.yaml institutionId`);
  }

  // --- asset integrity ---------------------------------------------------------
  const refs = referencedAssets(content);
  for (const [assetPath, wheres] of refs) {
    if (!assetExists(assetPath)) {
      errors.push(`missing image "${assetPath}" referenced by ${wheres.join(", ")}`);
    }
  }

  // Images on disk that nothing points at. A warning, not an error — the repo may keep
  // originals deliberately — but it is how "uploaded a photo, forgot to set the field"
  // gets noticed.
  const imagesRoot = path.join(PUBLIC_ROOT, "images");
  if (fs.existsSync(imagesRoot)) {
    const walk = (dir: string): string[] =>
      fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = path.join(dir, e.name);
        return e.isDirectory() ? walk(full) : [full];
      });
    for (const file of walk(imagesRoot)) {
      const rel = "/" + path.relative(PUBLIC_ROOT, file).split(path.sep).join("/");
      if (!refs.has(rel)) warnings.push(`unreferenced image on disk: ${rel}`);
    }
  }

  // --- data-quality warnings ---------------------------------------------------
  for (const p of content.people) {
    if (p.personType !== "lab-lead" && p.labTenure?.joinedYear === undefined) {
      // Not an error: 16 records have no sourced joined year and this project's rule is
      // never to invent data. Studio requires it for new and edited records.
      warnings.push(`people/${p.id}.yaml: no labTenure.joinedYear`);
    }
    if (!p.photo) warnings.push(`people/${p.id}.yaml: no photo`);
  }
  const untagged = content.publications.filter((p) => p.themeIds.length === 0).length;
  if (untagged) {
    warnings.push(
      `${untagged}/${content.publications.length} publications have no themeIds — they will not appear in the research browser`
    );
  }

  return {
    errors,
    warnings,
    counts: {
      institutions: content.institutions.length,
      people: content.people.length,
      themes: content.researchThemes.length,
      projects: content.projects.length,
      publications: content.publications.length,
      posts: content.posts.length,
      recognitions: content.recognitions.length,
      service: content.service.length,
      courses: content.courses.length,
      sponsors: content.sponsors.length,
    },
  };
}
