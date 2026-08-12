import Image from "next/image";

import { PersonLinkIcons } from "@/components/person-link-icons";
import { publicFileExists } from "@/lib/content/assets";
import type { Person } from "@/lib/content";
import { cn } from "@/lib/utils";
import { personTypeShortLabel, resolvePersonRedirectUrl } from "@/lib/team";

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const VARIANT_TEXT = {
  mini: { name: "text-[11px] font-semibold", role: "text-[9px]" },
  tile: { name: "text-[14.5px] font-bold", role: "text-[10.5px]" },
  alumni: { name: "text-[12.5px] font-semibold", role: "text-[9.5px]" },
} as const;

// Photo+name+role is one link (the resolved redirect, SPEC.md decision #4); the icon
// row below it is a SIBLING, not nested inside that <a>, so the individual icons stay
// independently clickable without invalid nested-anchor HTML. Icon row is skipped for
// "mini" (the hero band's 74px tiles have no room for 6 icons).
export function TeamCard({
  person,
  variant = "tile",
}: {
  person: Person;
  variant?: "mini" | "tile" | "alumni";
}) {
  const redirectUrl = resolvePersonRedirectUrl(person);
  const hasPhoto = publicFileExists(person.photo);
  const roleLabel = personTypeShortLabel(person.personType);
  const circular = variant === "alumni";
  const text = VARIANT_TEXT[variant];

  return (
    <div className={cn("flex flex-col gap-2", variant === "mini" && "w-24 shrink-0")}>
      <a
        href={redirectUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex flex-col gap-2"
      >
        <div
          className={cn(
            "relative aspect-square w-full overflow-hidden border border-border bg-muted transition-opacity group-hover:opacity-80",
            circular && "rounded-full"
          )}
        >
          {hasPhoto && person.photo ? (
            <Image
              src={person.photo}
              alt={person.name}
              fill
              sizes="(min-width: 1024px) 15vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center font-mono text-xs font-semibold text-muted-foreground"
              aria-hidden="true"
            >
              {initials(person.name)}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className={cn(text.name, "leading-tight text-foreground")}>
            {person.name}
          </span>
          <span
            className={cn(
              text.role,
              "font-mono tracking-wide text-text-faint uppercase"
            )}
          >
            {roleLabel}
          </span>
        </div>
      </a>
      {variant !== "mini" && (
        <PersonLinkIcons person={person} size={variant === "alumni" ? "sm" : "default"} />
      )}
    </div>
  );
}
