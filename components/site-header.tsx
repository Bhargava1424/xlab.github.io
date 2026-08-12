import Image from "next/image";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { getInstitutionById, getSiteMeta } from "@/lib/content";
import { publicFileExists } from "@/lib/content/assets";

// Sticky, single-row-that-wraps nav. Deliberately not a hamburger/drawer — the real
// responsive/mobile pass is a separate concern from this visual pass; flex-wrap keeps
// it usable on narrow viewports with zero client JS.
export function SiteHeader() {
  const site = getSiteMeta();
  const logo = site.logo;
  const hasLogo =
    !!logo && publicFileExists(logo.light) && publicFileExists(logo.dark);
  const institution = site.primaryInstitutionId
    ? getInstitutionById(site.primaryInstitutionId)
    : undefined;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur-sm supports-[backdrop-filter]:bg-background/85">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-3.5 sm:px-10">
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            {hasLogo && logo ? (
              <>
                <Image
                  src={logo.light}
                  alt=""
                  width={34}
                  height={34}
                  className="size-[34px] dark:hidden"
                  priority
                />
                <Image
                  src={logo.dark}
                  alt=""
                  width={34}
                  height={34}
                  className="hidden size-[34px] dark:block"
                  priority
                />
              </>
            ) : null}
            <span className="text-base font-bold tracking-tight text-foreground">
              {site.title}
            </span>
          </Link>
          {institution && (
            <div className="hidden items-center gap-2.5 md:flex">
              <span aria-hidden="true" className="h-[15px] w-px bg-border" />
              <span className="font-mono text-[11px] tracking-wider text-brand-orange uppercase">
                {institution.name}
              </span>
            </div>
          )}
        </div>
        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13.5px] text-foreground/75"
        >
          {site.nav.map((item) => (
            <Link
              key={item.label}
              href={item.path}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
          <span aria-hidden="true" className="h-4 w-px bg-border" />
          <span className="flex items-center gap-x-5 font-mono text-[12px] tracking-wide uppercase">
            {site.socialLinks?.github ? (
              <a
                href={site.socialLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-foreground"
              >
                GitHub
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            ) : (
              <span
                aria-disabled="true"
                title="No lab-org GitHub yet"
                className="cursor-not-allowed text-text-faint/60"
              >
                GitHub
              </span>
            )}
          </span>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
