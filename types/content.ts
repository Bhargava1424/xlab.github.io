// Content data schema for the lab website.
// See docs/SCHEMA.md for the rationale behind each design decision.
// Every file under content/ is validated against a Zod mirror of these types at build time.

export interface Institution {
  id: string;
  name: string;
  shortName?: string;
  url?: string;
  logo?: string;
  city?: string;
  state?: string;
  country?: string;
}

export type AffiliationType = "primary" | "adjunct" | "visiting" | "affiliate";

export interface Affiliation {
  institutionId: string; // FK -> Institution.id
  department?: string;
  roleTitle: string;
  type?: AffiliationType;
  startDate?: string; // "YYYY" or "YYYY-MM"
  endDate?: string | null; // null/absent = ongoing
}

export type PersonType =
  | "lab-lead"
  | "postdoc"
  | "research-staff"
  | "phd-student"
  | "masters-student"
  | "undergrad-student"
  | "grad-collaborator";

export interface EducationEntry {
  degree: string;
  institution: string; // free text, historical schools not normalized
  year?: number;
  note?: string;
}

export interface ResearchAgendaItem {
  project: string;
  description: string;
  representativeTechniques: string[];
}

export interface PersonProfile {
  education?: EducationEntry[];
  researchPhilosophy?: string; // markdown
  researchInterests?: string[];
  researchAgenda?: ResearchAgendaItem[];
  futureVision?: string; // markdown
  quote?: string;
}

export interface PersonLinks {
  email?: string;
  scholar?: string;
  website?: string;
  universityProfile?: string;
  linkedin?: string;
  github?: string;
}

export interface Person {
  id: string;
  name: string;
  personType: PersonType;
  roleTitle: string;
  secondaryTitles?: string[];
  photo?: string; // explicit, human-set path — never fuzzy-matched by filename
  office?: string;
  bio?: string;
  profile?: PersonProfile;
  links?: PersonLinks;
  affiliations?: Affiliation[];
  // Kept separate from `affiliations`: "current lab member" is derived solely from
  // labTenure.leftYear being null/absent, independent of which institution(s) this
  // person is currently affiliated with.
  labTenure?: { joinedYear?: number; leftYear?: number | null };
  sortWeight?: number;
}

export interface ResearchTheme {
  id: string;
  icon?: string;
  title: string;
  shortDescription: string;
  longDescription?: string; // markdown
  order?: number;
}

export type ProjectStatus = "active" | "deployed" | "archived";

export interface ProjectLinks {
  paperUrl?: string;
  publicationId?: string; // FK -> Publication.id
  code?: string;
  demo?: string;
  video?: string;
  poster?: string;
  website?: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  description?: string; // markdown
  thumbnail?: string;
  themeId?: string; // FK -> ResearchTheme.id, single/optional (not many-to-many)
  status?: ProjectStatus;
  collaborationWith?: string; // free-text EXTERNAL org/company name (e.g. "Apple") — not a Person link
  contributors?: string[]; // FK -> Person.id[] — lab members who worked on this project (optional, populate only when known)
  featured?: boolean;
  order?: number;
  links?: ProjectLinks;
}

export type PublicationCategory =
  | "patent"
  | "journal"
  | "conference"
  | "workshop"
  | "invited-paper"
  | "book-chapter";

export interface AuthorRef {
  name: string; // always present, exactly as it should display — this is the source of truth for display order/text
  personId?: string; // FK -> Person.id, set ONLY when this specific author is a known lab member
}

export interface Publication {
  id: string; // generated once at normalization time, then immutable — referenced by Project/Recognition
  category: PublicationCategory;
  title: string;
  authors: AuthorRef[]; // ordered list; most entries have no personId (external co-authors), see docs/SCHEMA.md
  venue?: string;
  year?: number;
  dateDisplay?: string;
  month?: string;
  location?: string;
  note?: string; // "in press", "Spotlight" — NOT award info, see Recognition
  doi?: string;
  url?: string;
  pdfUrl?: string;
  featured?: boolean;
  featuredOrder?: number;

  // patent-only
  patentNo?: string;
  docketNo?: string;
  applicationNo?: string;
  filedDate?: string;
  issuedDate?: string;
  jurisdiction?: string;

  // journal-only
  volumeIssue?: string;

  // book-chapter-only
  book?: string;
  editors?: string;
  publisher?: string;
  onlineIsbn?: string;
}

export type PostKind = "news" | "blog";

// News and Blog are unified: both are dated feed items, differing only in how much
// content exists per entry (body/authorId/tags are optional, effectively required
// for kind:"blog").
export interface Post {
  id: string;
  kind: PostKind;
  date: string; // ISO date
  title: string;
  summary: string;
  body?: string; // markdown
  image?: string;
  authorId?: string; // FK -> Person.id
  tags?: string[];
  sourceUrl?: string;
  relatedPublicationId?: string; // FK -> Publication.id
}

export interface NavItem {
  label: string;
  path: string;
  children?: NavItem[];
}

export interface SiteMeta {
  title: string;
  tagline: string;
  description: string;
  keywords?: string[];
  nav: NavItem[];
  contact?: {
    email?: string;
    phone?: string;
    // Deliberately freeform, NOT derived from primaryInstitutionId — a lab's mailing
    // address can outlive any single person's institutional affiliation.
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      zip?: string;
      country?: string;
    };
  };
  primaryInstitutionId?: string; // convenience only (e.g. reuse a logo), never source of truth
  recruitingNotice?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    huggingface?: string;
    twitter?: string;
    youtube?: string;
  };
  logo?: { light: string; dark: string };
}

// ---------------------------------------------------------------------------
// SECONDARY entities — structure defined now, content can launch partial or post-v1
// ---------------------------------------------------------------------------

export type RecognitionCategory =
  | "best-paper-award"
  | "best-paper-nomination"
  | "best-poster-award"
  | "international-competition-award"
  | "professional-honor-award";

export interface Recognition {
  id: string;
  category: RecognitionCategory;
  personId: string; // FK -> Person.id
  award: string;
  year?: number;
  dateDisplay?: string;
  title?: string;
  venue?: string;
  org?: string;
  publicationId?: string; // FK -> Publication.id — award facts live here, not duplicated on Publication.note
}

export type ServiceCategory =
  | "editorial"
  | "conference-leadership"
  | "technical-program-committee"
  | "community-service"
  | "university-service";

export interface ServiceRecord {
  id: string;
  personId: string; // FK -> Person.id
  category: ServiceCategory;
  role: string;
  org?: string;
  // Real data includes irregular periods ("2010–2012, 2015, 2018–2019", "Multiple
  // semesters") — periodDisplay is the required source of truth; start/endYear are
  // best-effort and only populated when a record cleanly parses as one range.
  periodDisplay: string;
  startYear?: number;
  endYear?: number;
  isOngoing?: boolean;
}

export interface Course {
  id: string;
  personId: string; // FK -> Person.id
  code?: string;
  title: string;
  institutionId?: string; // FK -> Institution.id
  institutionName?: string; // fallback free text if not a normalized Institution
  termDisplay: string; // raw text — no invented enrollment data
}

export interface Sponsor {
  id: string;
  name: string;
  logo: string;
  url?: string;
  grantNumbers?: string[];
}
