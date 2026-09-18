"use client";

import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { AtomTypeIcon, SourceKindIcon } from "@/components/wiki/topic-chip";
import { fmtDay } from "@/components/wiki/v1/format";
import type { WikiAtom } from "@/lib/mock/wiki";

// A citation mark that says what it cites before you open it. Resting the
// pointer on it, or focusing it, shows the atom's type, when it became true,
// its title, the claim in three lines and where it came from; a click (or
// Enter) still opens the drawer. Touch goes straight to the drawer.

export function CitePreview({
  id,
  number,
  atom,
  onAtom,
}: {
  id: string;
  number: number | undefined;
  atom: WikiAtom | undefined;
  onAtom: (id: string) => void;
}) {
  const mark = (
    <Button
      variant="ghost"
      size="none"
      onClick={() => onAtom(id)}
      aria-label={atom ? `Citation ${number ?? ""}: ${atom.title || atom.content}` : `Open the atom this cites (${id})`}
      className="ml-0.5 rounded-xs bg-tint-10 px-1 text-[10px] leading-4 text-foreground-low tabular-nums hover:bg-brand-subtle hover:text-brand-subtle-foreground data-[state=open]:bg-brand-subtle data-[state=open]:text-brand-subtle-foreground"
    >
      {number ?? "↗"}
    </Button>
  );

  if (!atom) return <sup>{mark}</sup>;

  const kinds = new Map<string, { label: string; count: number }>();
  for (const source of atom.sources) {
    const entry = kinds.get(source.kind) ?? { label: source.label, count: 0 };
    entry.count += 1;
    kinds.set(source.kind, entry);
  }

  return (
    <sup>
      <HoverCard openDelay={250} closeDelay={100}>
        <HoverCardTrigger asChild>{mark}</HoverCardTrigger>
        <HoverCardContent side="top" className="flex w-80 flex-col gap-2 p-3">
          <div className="flex items-center gap-1.5 text-label-12-caps text-foreground-low">
            <AtomTypeIcon type={atom.type} />
            <span>{atom.type}</span>
            {atom.validFrom ? <span className="tabular-nums">· {fmtDay(atom.validFrom)}</span> : null}
            {atom.status !== "current" ? <span>· {atom.statusLabel}</span> : null}
          </div>
          {atom.title ? <p className="text-sm leading-5 font-medium text-foreground">{atom.title}</p> : null}
          <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">{atom.content}</p>
          {kinds.size ? (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground-low">
              {[...kinds].map(([kind, { label, count }]) => (
                <span key={kind} className="inline-flex items-center gap-1 tabular-nums">
                  <SourceKindIcon kind={kind} />
                  {label}
                  {count > 1 ? ` ${count}` : ""}
                </span>
              ))}
            </div>
          ) : null}
        </HoverCardContent>
      </HoverCard>
    </sup>
  );
}
