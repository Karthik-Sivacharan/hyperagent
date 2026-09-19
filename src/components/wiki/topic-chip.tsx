import { createElement } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { wikiAtomTypeIcon, wikiGroupMeta, wikiSourceKindIcon } from "@/components/wiki/topic-type";
import type { WikiGroupId } from "@/lib/mock/wiki";

// A Topic, as a chip: its group's icon and a wash of the group's colour
// behind both, with a plain label. The icon carries the type, so the label
// stays ink and the colour never has to pass as text. With `href` the chip is
// a link to the page. Where a label above the chips already names their type,
// the chip goes neutral instead; the one chip whose label does take the hue is
// the body's first mention of a Topic, at the foot of this file.

export function TopicIcon({ group, className }: { group: WikiGroupId; className?: string }) {
  const { icon: Icon, text } = wikiGroupMeta(group);
  return <Icon className={cn("size-3.5 shrink-0", text, className)} aria-hidden="true" />;
}

// The icon components come from module-level maps, so each lookup returns
// the same component every render; createElement says so to the linter.

/** An atom's type as its ink icon. */
export function AtomTypeIcon({ type, className }: { type: string; className?: string }) {
  return createElement(wikiAtomTypeIcon(type), { className: cn("size-3.5 shrink-0", className), "aria-hidden": true });
}

/** A source's kind (thread, document, saved memory) as its ink icon. */
export function SourceKindIcon({ kind, className }: { kind: string; className?: string }) {
  return createElement(wikiSourceKindIcon(kind), { className: cn("size-3.5 shrink-0", className), "aria-hidden": true });
}

/**
 * The chip's ground. `tint` is the group's hue at 10%, for a chip that stands
 * on its own. `neutral` is the plain tint for a set that sits under a label
 * already naming its type, as the right rail's Mentions do: there the hue
 * would say the type twice, and twenty chips of one hue made the rail louder
 * than the article. The icon keeps its colour in both.
 */
type ChipTone = "tint" | "neutral";

const NEUTRAL = { tint: "bg-tint-10", tintHover: "[a]:hover:bg-tint-15" } as const;

export function TopicChip({
  group,
  label,
  href,
  count,
  tone = "tint",
  className,
}: {
  group: WikiGroupId;
  label: string;
  href?: string;
  /** How many times the page mentions it; shown from two. */
  count?: number;
  tone?: ChipTone;
  className?: string;
}) {
  const { tint, tintHover } = tone === "neutral" ? NEUTRAL : wikiGroupMeta(group);
  // The count is muted rather than low: on a tint, the low tier drops under AA.
  const content = (
    <>
      <TopicIcon group={group} />
      <span className="min-w-0 truncate">{label}</span>
      {count && count > 1 ? <span className="font-normal text-muted-foreground tabular-nums">{count}</span> : null}
    </>
  );

  // One treatment, not two: `shadow-none` is what makes tailwind-merge drop
  // the `outline` variant's `shadow-edge`, so the tint replaces the hairline
  // instead of sitting inside it. The hover step is written with the
  // variant's own `[a]:hover:` prefix for the same reason — same modifier,
  // so it takes the place of `[a]:hover:bg-tint-10` rather than losing to its
  // higher specificity. The focus-visible ring is the Badge's own and stays.
  //
  // One size too, a step up from the badge as it ships (24px, 13px text, a
  // 14px icon). Every chip sits among 13px text, the header's meta line as
  // much as the rails, and the 20px badge read undersized next to it.
  const chip = cn("h-6 max-w-full text-md shadow-none [&>svg]:size-3.5!", tint, href ? tintHover : undefined, className);

  if (!href) {
    return (
      <Badge variant="outline" className={chip}>
        {content}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" asChild className={chip}>
      <Link href={href}>{content}</Link>
    </Badge>
  );
}

/**
 * A Topic named in running prose, the first time the page names it: the
 * group's colour as a 10% ground and as the label, with the icon leading.
 *
 * Built the way the signup flow's identity chips are, for the same reason.
 * `inline-block`, not `inline-flex`, so the chip takes its baseline from the
 * label, the last line box inside it, and the word sits on the same baseline
 * as the words either side of it. Only the icon is a flex box, `align-middle`d
 * on its own. At 16/24 the label runs `leading-none` and the ground adds 2px
 * above and below, which comes to about 20px on Geist's metrics, inside the
 * 24px line with room to spare, so a paragraph with a chip in it keeps the
 * same rhythm as one without. `py-1` would push the line past 24px, and
 * `overflow-hidden` would move the baseline to the bottom edge, so neither is
 * here. `whitespace-nowrap` keeps the chip whole when the sentence wraps, and
 * `rounded-lg` is the radius brand.css keeps for inline reference chips: a
 * full pill in a sentence reads as a button.
 *
 * The icon takes the label's colour rather than the chart token. One ink per
 * chip reads as one thing, and the tangerine at its chart step is 2.9:1 on
 * its own tint, under the 3:1 a glyph needs. With `href` it is a link: the
 * ground steps from 10% to 15% on hover, and focus is the same outline every
 * link in the body takes.
 */
export function TopicMention({ group, href, children }: { group: WikiGroupId; href?: string; children: React.ReactNode }) {
  const { icon: Icon, tint, tintHover, label } = wikiGroupMeta(group);
  const chip = cn(
    "mx-0.5 inline-block rounded-lg py-0.5 pr-1.5 pl-1 align-baseline leading-none font-medium whitespace-nowrap",
    tint,
    label,
    href ? [tintHover, "transition-colors duration-(--duration-fast) ease-out-quart"] : undefined,
  );
  const content = (
    <>
      <span className="mr-1 inline-flex align-middle">
        <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      </span>
      {children}
    </>
  );

  if (!href) return <span className={chip}>{content}</span>;
  return (
    <Link href={href} className={chip}>
      {content}
    </Link>
  );
}
