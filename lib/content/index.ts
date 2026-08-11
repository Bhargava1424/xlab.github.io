// Typed content getters for the app. Reads YAML/MDX from content/, validates every
// record against the Zod mirror in schema.ts, and fails the build (via
// ContentValidationError) with every problem found across the whole tree at once
// rather than stopping at the first bad file.
import {
  AffiliationSchema,
  CourseSchema,
  InstitutionSchema,
  PersonSchema,
  PostSchema,
  ProjectSchema,
  PublicationSchema,
  RecognitionSchema,
  ResearchThemeSchema,
  ServiceRecordSchema,
  SiteMetaSchema,
  SponsorSchema,
  type Course,
  type Institution,
  type Person,
  type Post,
  type Project,
  type Publication,
  type PublicationCategory,
  type Recognition,
  type ResearchTheme,
  type ServiceRecord,
  type SiteMeta,
  type Sponsor,
} from "./schema";
import {
  assertNoErrors,
  readMdxDir,
  readYaml,
  readYamlDir,
  validateOrCollect,
} from "./loader";

// Re-export the category type so callers of getPublicationsByCategory don't need to
// reach into ./schema directly.
export type { PublicationCategory } from "./schema";
export type {
  AuthorRef,
  Affiliation,
  Course,
  Institution,
  Person,
  Post,
  Project,
  Publication,
  Recognition,
  ServiceRecord,
  SiteMeta,
  Sponsor,
} from "./schema";

interface AllContent {
  siteMeta: SiteMeta;
  institutions: Institution[];
  people: Person[];
  researchThemes: ResearchTheme[];
  projects: Project[];
  publications: Publication[];
  posts: Post[];
  recognitions: Recognition[];
  service: ServiceRecord[];
  teaching: Course[];
  sponsors: Sponsor[];
}

let cached: AllContent | undefined;

function loadAll(): AllContent {
  if (cached) return cached;
  const errors: string[] = [];

  const siteMeta = validateOrCollect(
    SiteMetaSchema,
    readYaml("site-meta.yaml"),
    "site-meta.yaml",
    errors
  );

  const institutions = (
    (readYaml("institutions.yaml") as unknown[]) ?? []
  )
    .map((v, i) =>
      validateOrCollect(InstitutionSchema, v, `institutions.yaml[${i}]`, errors)
    )
    .filter((v): v is Institution => v !== undefined);

  const people = readYamlDir("people")
    .map(({ file, data }) => validateOrCollect(PersonSchema, data, file, errors))
    .filter((v): v is Person => v !== undefined);

  const researchThemes = (
    (readYaml("research/themes.yaml") as unknown[]) ?? []
  )
    .map((v, i) =>
      validateOrCollect(
        ResearchThemeSchema,
        v,
        `research/themes.yaml[${i}]`,
        errors
      )
    )
    .filter((v): v is ResearchTheme => v !== undefined);

  const projects = readYamlDir("projects")
    .map(({ file, data }) => validateOrCollect(ProjectSchema, data, file, errors))
    .filter((v): v is Project => v !== undefined);

  const publications = readYamlDir("publications").flatMap(({ file, data }) =>
    ((data as unknown[]) ?? [])
      .map((v, i) =>
        validateOrCollect(PublicationSchema, v, `${file}[${i}]`, errors)
      )
      .filter((v): v is Publication => v !== undefined)
  );

  const posts = readMdxDir("posts")
    .map(({ file, frontmatter, body }) =>
      validateOrCollect(
        PostSchema,
        { ...(frontmatter as object), body: body || undefined },
        file,
        errors
      )
    )
    .filter((v): v is Post => v !== undefined);

  const recognitions = readYamlDir("recognitions").flatMap(({ file, data }) =>
    ((data as unknown[]) ?? [])
      .map((v, i) =>
        validateOrCollect(RecognitionSchema, v, `${file}[${i}]`, errors)
      )
      .filter((v): v is Recognition => v !== undefined)
  );

  const service = (
    (readYaml("service.yaml") as unknown[]) ?? []
  )
    .map((v, i) =>
      validateOrCollect(ServiceRecordSchema, v, `service.yaml[${i}]`, errors)
    )
    .filter((v): v is ServiceRecord => v !== undefined);

  const teaching = (
    (readYaml("teaching.yaml") as unknown[]) ?? []
  )
    .map((v, i) =>
      validateOrCollect(CourseSchema, v, `teaching.yaml[${i}]`, errors)
    )
    .filter((v): v is Course => v !== undefined);

  const sponsors = (
    (readYaml("sponsors.yaml") as unknown[]) ?? []
  )
    .map((v, i) =>
      validateOrCollect(SponsorSchema, v, `sponsors.yaml[${i}]`, errors)
    )
    .filter((v): v is Sponsor => v !== undefined);

  assertNoErrors(errors, "content/**");

  cached = {
    siteMeta: siteMeta as SiteMeta,
    institutions,
    people,
    researchThemes,
    projects,
    publications,
    posts,
    recognitions,
    service,
    teaching,
    sponsors,
  };
  return cached;
}

// --- SiteMeta -----------------------------------------------------------------
export function getSiteMeta(): SiteMeta {
  return loadAll().siteMeta;
}

// --- Institution ----------------------------------------------------------------
export function getAllInstitutions(): Institution[] {
  return loadAll().institutions;
}
export function getInstitutionById(id: string): Institution | undefined {
  return loadAll().institutions.find((i) => i.id === id);
}

// --- Person -----------------------------------------------------------------
export function getAllPeople(): Person[] {
  return loadAll().people;
}
export function getPersonById(id: string): Person | undefined {
  return loadAll().people.find((p) => p.id === id);
}
export function getCurrentPeople(): Person[] {
  return loadAll().people.filter(
    (p) => p.labTenure?.leftYear === undefined || p.labTenure?.leftYear === null
  );
}
export function getAlumniPeople(): Person[] {
  return loadAll().people.filter(
    (p) => p.labTenure?.leftYear !== undefined && p.labTenure?.leftYear !== null
  );
}

// --- ResearchTheme ------------------------------------------------------------
export function getResearchThemes(): ResearchTheme[] {
  return [...loadAll().researchThemes].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
}
export function getResearchThemeById(id: string): ResearchTheme | undefined {
  return loadAll().researchThemes.find((t) => t.id === id);
}

// --- Project ------------------------------------------------------------------
export function getAllProjects(): Project[] {
  return loadAll().projects;
}
export function getProjectById(id: string): Project | undefined {
  return loadAll().projects.find((p) => p.id === id);
}
export function getProjectsByTheme(themeId: string): Project[] {
  return loadAll().projects.filter((p) => p.themeId === themeId);
}

// --- Publication ----------------------------------------------------------------
export function getPublications(): Publication[] {
  return loadAll().publications;
}
export function getPublicationById(id: string): Publication | undefined {
  return loadAll().publications.find((p) => p.id === id);
}
export function getPublicationsByCategory(
  category: PublicationCategory
): Publication[] {
  return loadAll()
    .publications.filter((p) => p.category === category)
    .sort((a, b) => (b.year ?? 0) - (a.year ?? 0));
}
export function getFeaturedPublications(): Publication[] {
  return loadAll()
    .publications.filter((p) => p.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
}

// --- Post (news + blog) ---------------------------------------------------------
export function getAllPosts(): Post[] {
  return [...loadAll().posts].sort((a, b) => (a.date < b.date ? 1 : -1));
}
export function getPostsByKind(kind: "news" | "blog"): Post[] {
  return getAllPosts().filter((p) => p.kind === kind);
}
export function getPostById(id: string): Post | undefined {
  return loadAll().posts.find((p) => p.id === id);
}

// --- Recognition ----------------------------------------------------------------
export function getAllRecognitions(): Recognition[] {
  return loadAll().recognitions;
}
export function getRecognitionsByPerson(personId: string): Recognition[] {
  return loadAll().recognitions.filter((r) => r.personId === personId);
}

// --- ServiceRecord --------------------------------------------------------------
export function getAllServiceRecords(): ServiceRecord[] {
  return loadAll().service;
}

// --- Course -----------------------------------------------------------------
export function getAllCourses(): Course[] {
  return loadAll().teaching;
}

// --- Sponsor ------------------------------------------------------------------
export function getAllSponsors(): Sponsor[] {
  return loadAll().sponsors;
}

// --- Derived stats (avoid a stored "150+ publications" field that could drift) --
export function getStats() {
  const all = loadAll();
  return {
    publicationCount: all.publications.length,
    peopleCount: all.people.length,
    currentPeopleCount: getCurrentPeople().length,
    projectCount: all.projects.length,
    recognitionCount: all.recognitions.length,
  };
}
