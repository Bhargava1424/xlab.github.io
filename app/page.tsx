// Placeholder home page — proves the Phase 2 pipeline (content -> Zod validation ->
// static export) works end to end. Real page-building per SPEC.md §5 is Phase 3.
import { getSiteMeta, getStats } from "@/lib/content";

export default function Home() {
  const site = getSiteMeta();
  const stats = getStats();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="text-sm font-medium uppercase tracking-widest text-neutral-500">
        {site.tagline}
      </p>
      <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
        {site.title}
      </h1>
      <p className="max-w-xl text-neutral-600 dark:text-neutral-400">
        {site.description}
      </p>
      <dl className="mt-8 grid grid-cols-3 gap-8 text-center">
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            Publications
          </dt>
          <dd className="text-2xl font-semibold">{stats.publicationCount}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            Lab members
          </dt>
          <dd className="text-2xl font-semibold">{stats.currentPeopleCount}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-neutral-500">
            Projects
          </dt>
          <dd className="text-2xl font-semibold">{stats.projectCount}</dd>
        </div>
      </dl>
      <p className="mt-12 text-xs text-neutral-400">
        Phase 2 scaffold — real pages land in Phase 3.
      </p>
    </main>
  );
}
