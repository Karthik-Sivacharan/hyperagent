import { createElement } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { wikiAtomTypeIcon, wikiGroupMeta, wikiSourceKindIcon } from "@/components/wiki/topic-type";
import type { WikiGroupId } from "@/lib/mock/wiki";

// A Topic, as a chip: its group's icon in the group's colour and a plain
// label. The icon carries the type, so the label stays ink and the colour
// never has to pass as text. With `href` the chip is a link to the page.

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

export function TopicChip({
  group,
  label,
  href,
  count,
  className,
}: {
  group: WikiGroupId;
  label: string;
  href?: string;
  /** How many times the page mentions it; shown from two. */
  count?: number;
  className?: string;
}) {
  const content = (
    <>
      <TopicIcon group={group} />
      <span className="min-w-0 truncate">{label}</span>
      {count && count > 1 ? <span className="font-normal text-foreground-low tabular-nums">{count}</span> : null}
    </>
  );

  if (!href) {
    return (
      <Badge variant="outline" className={cn("max-w-full", className)}>
        {content}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" asChild className={cn("max-w-full", className)}>
      <Link href={href}>{content}</Link>
    </Badge>
  );
}
