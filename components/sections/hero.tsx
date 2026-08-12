import Image from "next/image";
import Link from "next/link";

import { AnimatedCounter } from "@/components/animated-counter";
import { TeamCard } from "@/components/team-card";
import {
  getAllRecognitions,
  getCurrentPeople,
  getSiteMeta,
  getStats,
  type RecognitionCategory,
} from "@/lib/content";
import { publicFileExists } from "@/lib/content/assets";
import { personTypeShortLabel, sortPeople } from "@/lib/team";

function countRecognitions(category: RecognitionCategory): number {
  return getAllRecognitions().filter((r) => r.category === category).length;
}

// One-viewport block: headline + stat grid on top, a live "lab, today" preview band
// (satellite member tiles flanking the PI) on the bottom. All 6 stat cells and every
// member tile are real data — none of the mockup's invented figures ($10M grant,
// "40 faculty grown") carried over, since we have no stored field backing those.
export function Hero() {
  const site = getSiteMeta();
  const stats = getStats();

  const [, ...rest] = site.title.split("-");
  const wordmark = rest.length > 0 ? rest.join("-").toUpperCase() : site.title.toUpperCase();
  const hasLogo =
    !!site.logo && publicFileExists(site.logo.light) && publicFileExists(site.logo.dark);

  const statCells = [
    { n: stats.publicationCount, label: "Publications" },
    { n: stats.currentPeopleCount, label: "Lab members" },
    { n: countRecognitions("best-paper-award"), label: "Best Paper Awards" },
    { n: countRecognitions("best-paper-nomination"), label: "Best Paper nominations" },
    {
      n: countRecognitions("international-competition-award"),
      label: "International competition awards",
    },
    { n: stats.projectCount, label: "Open-source projects" },
  ];

  const current = getCurrentPeople();
  const pi = current.find((p) => p.personType === "lab-lead");
  // Mockup's band is a fixed 4-col × 2-row grid per side (8 tiles/side, 16 total) —
  // matches our real non-PI current-member count today (16) exactly.
  const others = sortPeople(current.filter((p) => p.id !== pi?.id)).slice(0, 16);
  const left = others.slice(0, 8);
  const right = others.slice(8, 16);

  return (
    <section aria-labelledby="hero-heading" className="border-b border-border">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-6 py-6 sm:px-10 sm:py-6">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="flex items-center gap-3">
            {hasLogo && site.logo && (
              <>
                <Image
                  src={site.logo.light}
                  alt=""
                  width={110}
                  height={110}
                  className="size-24 dark:hidden"
                  priority
                />
                <Image
                  src={site.logo.dark}
                  alt=""
                  width={110}
                  height={110}
                  className="hidden size-24 dark:block"
                  priority
                />
              </>
            )}
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {wordmark}
            </span>
          </div>
          <h1
            id="hero-heading"
            className="max-w-[26ch] text-[clamp(1rem,1.45vw,1.22rem)] leading-tight font-bold tracking-tight text-foreground"
          >
            {site.tagline}
          </h1>
     
        </div>

        <div className="flex w-full justify-center">
          <p className="max-w-[75ch] text-[17px] leading-relaxed text-muted-foreground text-center">
            {site.description}
          </p>
        </div>
   

        <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
          {statCells.map((cell) => (
            <div
              key={cell.label}
              className="flex flex-col gap-0.5 bg-background px-3.5 py-3"
            >
              <span className="font-mono text-xl font-bold tracking-tight text-brand">
                <AnimatedCounter value={cell.n} />
              </span>
              <span className="text-xs leading-snug text-muted-foreground">
                {cell.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {pi && (
        <div className="border-t border-border bg-bg-alt px-6 py-5 sm:px-10">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between pb-3">
            <span className="font-mono text-[11px] font-bold tracking-widest text-text-faint uppercase">
              The lab, today
            </span>
            <Link
              href="/#team"
              className="font-mono text-[11px] tracking-wide text-muted-foreground uppercase transition-colors hover:text-foreground"
            >
              Full roster ›
            </Link>
          </div>
          <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-center gap-y-6 lg:grid-cols-[1fr_auto_1fr]">
            {/* Fixed-width tracks (not 1fr-each) so tiles hug the PI in the center
                instead of stretching across the whole flexible side column — this
                was the bug that made the band "totally out of layout". */}
            <div className="grid grid-cols-[repeat(4,74px)] justify-center gap-3 lg:justify-self-end">
              {left.map((person) => (
                <TeamCard key={person.id} person={person} variant="mini" />
              ))}
            </div>

            <div className="flex flex-col items-center justify-self-center px-1">
              <div className="border border-border bg-background p-1.5">
                {publicFileExists(pi.photo) && pi.photo ? (
                  <Image
                    src={pi.photo}
                    alt={pi.name}
                    width={98}
                    height={120}
                    className="block h-[120px] w-[98px] object-cover"
                  />
                ) : (
                  <div className="flex h-[120px] w-[98px] items-center justify-center bg-muted font-mono text-sm text-muted-foreground">
                    {pi.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="mt-2 flex flex-col items-center gap-0.5 text-center">
                <span className="text-sm font-bold text-foreground">{pi.name}</span>
                <span className="font-mono text-[9.5px] tracking-widest text-brand uppercase">
                  {personTypeShortLabel(pi.personType)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-[repeat(4,74px)] justify-center gap-3 lg:justify-self-start">
              {right.map((person) => (
                <TeamCard key={person.id} person={person} variant="mini" />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
