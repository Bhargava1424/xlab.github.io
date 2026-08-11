// Zod mirror of types/content.ts. Every file under content/ is validated against
// this at build time (via lib/content/index.ts). Keep this in sync by hand whenever
// types/content.ts changes — there is no automated codegen between the two.
import { z } from "zod";

export const InstitutionSchema = z.object({
  id: z.string(),
  name: z.string(),
  shortName: z.string().optional(),
  url: z.string().optional(),
  logo: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
});
export type Institution = z.infer<typeof InstitutionSchema>;

export const AffiliationTypeSchema = z.enum([
  "primary",
  "adjunct",
  "visiting",
  "affiliate",
]);

export const AffiliationSchema = z.object({
  institutionId: z.string(),
  department: z.string().optional(),
  roleTitle: z.string(),
  type: AffiliationTypeSchema.optional(),
  startDate: z.string().optional(),
  endDate: z.string().nullable().optional(),
});
export type Affiliation = z.infer<typeof AffiliationSchema>;

export const PersonTypeSchema = z.enum([
  "lab-lead",
  "postdoc",
  "research-staff",
  "phd-student",
  "masters-student",
  "undergrad-student",
  "grad-collaborator",
]);

export const EducationEntrySchema = z.object({
  degree: z.string(),
  institution: z.string(),
  year: z.number().optional(),
  note: z.string().optional(),
});

export const ResearchAgendaItemSchema = z.object({
  project: z.string(),
  description: z.string(),
  representativeTechniques: z.array(z.string()),
});

export const PersonProfileSchema = z.object({
  education: z.array(EducationEntrySchema).optional(),
  researchPhilosophy: z.string().optional(),
  researchInterests: z.array(z.string()).optional(),
  researchAgenda: z.array(ResearchAgendaItemSchema).optional(),
  futureVision: z.string().optional(),
  quote: z.string().optional(),
});

export const PersonLinksSchema = z.object({
  email: z.string().optional(),
  scholar: z.string().optional(),
  website: z.string().optional(),
  universityProfile: z.string().optional(),
  linkedin: z.string().optional(),
  github: z.string().optional(),
});

export const PersonSchema = z.object({
  id: z.string(),
  name: z.string(),
  personType: PersonTypeSchema,
  roleTitle: z.string(),
  secondaryTitles: z.array(z.string()).optional(),
  photo: z.string().optional(),
  office: z.string().optional(),
  bio: z.string().optional(),
  profile: PersonProfileSchema.optional(),
  links: PersonLinksSchema.optional(),
  affiliations: z.array(AffiliationSchema).optional(),
  labTenure: z
    .object({
      joinedYear: z.number().optional(),
      leftYear: z.number().nullable().optional(),
    })
    .optional(),
  sortWeight: z.number().optional(),
});
export type Person = z.infer<typeof PersonSchema>;

export const ResearchThemeSchema = z.object({
  id: z.string(),
  icon: z.string().optional(),
  title: z.string(),
  shortDescription: z.string(),
  longDescription: z.string().optional(),
  order: z.number().optional(),
});
export type ResearchTheme = z.infer<typeof ResearchThemeSchema>;

export const ProjectStatusSchema = z.enum(["active", "deployed", "archived"]);

export const ProjectLinksSchema = z.object({
  paperUrl: z.string().optional(),
  publicationId: z.string().optional(),
  code: z.string().optional(),
  demo: z.string().optional(),
  video: z.string().optional(),
  poster: z.string().optional(),
  website: z.string().optional(),
});

export const ProjectSchema = z.object({
  id: z.string(),
  title: z.string(),
  tagline: z.string(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  themeId: z.string().nullable().optional(),
  status: ProjectStatusSchema.optional(),
  collaborationWith: z.string().optional(),
  contributors: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  order: z.number().optional(),
  links: ProjectLinksSchema.optional(),
});
export type Project = z.infer<typeof ProjectSchema>;

export const PublicationCategorySchema = z.enum([
  "patent",
  "journal",
  "conference",
  "workshop",
  "invited-paper",
  "book-chapter",
]);
export type PublicationCategory = z.infer<typeof PublicationCategorySchema>;

export const AuthorRefSchema = z.object({
  name: z.string(),
  personId: z.string().optional(),
});
export type AuthorRef = z.infer<typeof AuthorRefSchema>;

export const PublicationSchema = z.object({
  id: z.string(),
  category: PublicationCategorySchema,
  title: z.string(),
  authors: z.array(AuthorRefSchema),
  venue: z.string().optional(),
  year: z.number().optional(),
  dateDisplay: z.string().optional(),
  month: z.string().optional(),
  location: z.string().optional(),
  note: z.string().optional(),
  doi: z.string().optional(),
  url: z.string().optional(),
  pdfUrl: z.string().optional(),
  featured: z.boolean().optional(),
  featuredOrder: z.number().optional(),

  // patent-only
  patentNo: z.string().optional(),
  docketNo: z.string().optional(),
  applicationNo: z.string().optional(),
  filedDate: z.string().optional(),
  issuedDate: z.string().optional(),
  jurisdiction: z.string().optional(),

  // journal-only
  volumeIssue: z.string().optional(),

  // book-chapter-only
  book: z.string().optional(),
  editors: z.string().optional(),
  publisher: z.string().optional(),
  onlineIsbn: z.string().optional(),
});
export type Publication = z.infer<typeof PublicationSchema>;

export const PostKindSchema = z.enum(["news", "blog"]);

export const PostSchema = z.object({
  id: z.string(),
  kind: PostKindSchema,
  date: z.string(),
  title: z.string(),
  summary: z.string(),
  body: z.string().optional(),
  image: z.string().optional(),
  authorId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  sourceUrl: z.string().optional(),
  relatedPublicationId: z.string().optional(),
});
export type Post = z.infer<typeof PostSchema>;

export const NavItemSchema: z.ZodType<{
  label: string;
  path: string;
  children?: { label: string; path: string; children?: unknown[] }[];
}> = z.lazy(() =>
  z.object({
    label: z.string(),
    path: z.string(),
    children: z.array(NavItemSchema).optional(),
  })
);

export const SiteMetaSchema = z.object({
  title: z.string(),
  tagline: z.string(),
  description: z.string(),
  keywords: z.array(z.string()).optional(),
  nav: z.array(NavItemSchema),
  contact: z
    .object({
      email: z.string().optional(),
      phone: z.string().nullable().optional(),
      address: z
        .object({
          line1: z.string().optional(),
          line2: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          zip: z.string().optional(),
          country: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  primaryInstitutionId: z.string().optional(),
  recruitingNotice: z.string().optional(),
  socialLinks: z
    .object({
      github: z.string().nullable().optional(),
      linkedin: z.string().nullable().optional(),
      huggingface: z.string().nullable().optional(),
      twitter: z.string().nullable().optional(),
      youtube: z.string().nullable().optional(),
    })
    .optional(),
  logo: z
    .object({
      light: z.string(),
      dark: z.string(),
    })
    .optional(),
});
export type SiteMeta = z.infer<typeof SiteMetaSchema>;

export const RecognitionCategorySchema = z.enum([
  "best-paper-award",
  "best-paper-nomination",
  "best-poster-award",
  "international-competition-award",
  "professional-honor-award",
]);

export const RecognitionSchema = z.object({
  id: z.string(),
  category: RecognitionCategorySchema,
  personId: z.string(),
  award: z.string(),
  year: z.number().optional(),
  dateDisplay: z.string().optional(),
  title: z.string().optional(),
  venue: z.string().optional(),
  org: z.string().optional(),
  publicationId: z.string().optional(),
});
export type Recognition = z.infer<typeof RecognitionSchema>;

export const ServiceCategorySchema = z.enum([
  "editorial",
  "conference-leadership",
  "technical-program-committee",
  "community-service",
  "university-service",
]);

export const ServiceRecordSchema = z.object({
  id: z.string(),
  personId: z.string(),
  category: ServiceCategorySchema,
  role: z.string(),
  org: z.string().optional(),
  periodDisplay: z.string(),
  startYear: z.number().optional(),
  endYear: z.number().optional(),
  isOngoing: z.boolean().optional(),
});
export type ServiceRecord = z.infer<typeof ServiceRecordSchema>;

export const CourseSchema = z.object({
  id: z.string(),
  personId: z.string(),
  code: z.string().optional(),
  title: z.string(),
  institutionId: z.string().optional(),
  institutionName: z.string().optional(),
  termDisplay: z.string(),
});
export type Course = z.infer<typeof CourseSchema>;

export const SponsorSchema = z.object({
  id: z.string(),
  name: z.string(),
  logo: z.string(),
  url: z.string().optional(),
  grantNumbers: z.array(z.string()).optional(),
});
export type Sponsor = z.infer<typeof SponsorSchema>;
