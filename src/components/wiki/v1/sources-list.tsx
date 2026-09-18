"use client";

import { IconAlertTriangle, IconChevronRight } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { WIKI_ATOM_TYPE_ORDER, wikiAtomTypeIcon, wikiSourceKindIcon } from "@/components/wiki/topic-type";
import { fmtDay } from "@/components/wiki/v1/format";
import type { WikiAtom } from "@/lib/mock/wiki";

// The atoms the current revision cites, grouped by type (rules first, one-off
// events last), one line each: its footnote number, its title, where it came
// from and when it became true. A line opens in place to the full claim; the
// drawer holds everything else.

function SourceKinds({ atom }: { atom: WikiAtom }) {
  const kinds = new Map<string, { label: string; count: number }>();
  for (const source of atom.sources) {
    const entry = kinds.get(source.kind) ?? { label: source.label, count: 0 };
    entry.count += 1;
    kinds.set(source.kind, entry);
  }
  return (
    <span className="flex shrink-0 items-center gap-2">
      {[...kinds].map(([kind, { label, count }]) => {
        const Icon = wikiSourceKindIcon(kind);
        return (
          <span key={kind} className="inline-flex items-center gap-0.5 tabular-nums" title={label}>
            <Icon className="size-3.5" aria-hidden="true" />
            <span className="sr-only">{label}</span>
            {count > 1 ? count : null}
          </span>
        );
      })}
    </span>
  );
}

function SourceRow({ atom, number, onAtom }: { atom: WikiAtom; number: number | undefined; onAtom: () => void }) {
  const disputed = atom.conflictWith.length > 0;
  return (
    <Collapsible asChild>
      <li className="flex flex-col">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="none"
            className="group/row h-auto w-full justify-start gap-3 rounded-md px-2 py-1.5 text-left text-sm font-normal hover:bg-tint-10"
          >
            <span className="w-5 shrink-0 text-right text-label-12-mono text-foreground-low">{number ?? ""}</span>
            <span className="min-w-0 flex-1 truncate text-foreground">{atom.title || atom.content}</span>
            {disputed ? (
              <span className="inline-flex shrink-0 items-center text-warning">
                <IconAlertTriangle className="size-3.5" aria-hidden="true" />
                <span className="sr-only">In dispute</span>
              </span>
            ) : null}
            <span className="flex shrink-0 items-center gap-3 text-xs text-foreground-low">
              <SourceKinds atom={atom} />
              <span className="w-12 text-right tabular-nums">{atom.validFrom ? fmtDay(atom.validFrom) : ""}</span>
            </span>
            <IconChevronRight
              className="size-3.5 shrink-0 text-foreground-low transition-transform duration-(--duration-fast) ease-out-quart group-aria-expanded/row:rotate-90"
              aria-hidden="true"
            />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-2 pt-1 pr-2 pb-3 pl-10">
          <p className="text-sm leading-6 text-muted-foreground">{atom.content}</p>
          {atom.appliesWhen ? (
            <p className="text-xs leading-5 text-foreground-low">{atom.appliesWhen}</p>
          ) : null}
          <div className="flex flex-wrap items-center gap-1.5">
            {atom.status !== "current" ? <Badge variant="secondary">{atom.statusLabel}</Badge> : null}
            {disputed ? <Badge variant="warning">Conflicting evidence retained</Badge> : null}
            <Button variant="outline" size="xs" onClick={onAtom}>
              Open atom
            </Button>
          </div>
        </CollapsibleContent>
      </li>
    </Collapsible>
  );
}

export function SourcesList({
  citations,
  atoms,
  cites,
  onAtom,
}: {
  citations: string[];
  atoms: Record<string, WikiAtom>;
  /** Footnote number per atom id, as the body prints them. */
  cites: Map<string, number>;
  onAtom: (id: string) => void;
}) {
  const cited = citations.map((id) => atoms[id]).filter((atom): atom is WikiAtom => Boolean(atom));
  const types = [...new Set(cited.map((atom) => atom.type))].sort((a, b) => {
    const rank = (type: string) => {
      const index = WIKI_ATOM_TYPE_ORDER.indexOf(type);
      return index === -1 ? WIKI_ATOM_TYPE_ORDER.length : index;
    };
    return rank(a) - rank(b);
  });

  return (
    <div className="flex flex-col gap-5">
      {types.map((type) => {
        const Icon = wikiAtomTypeIcon(type);
        const rows = cited.filter((atom) => atom.type === type);
        return (
          <section key={type} className="flex flex-col gap-1">
            <h3 className="flex items-center gap-2 px-2 text-label-12-caps text-foreground-low">
              <Icon className="size-3.5" aria-hidden="true" />
              {type}
              <span className="text-label-12-mono">{rows.length}</span>
            </h3>
            <ul className="flex flex-col">
              {rows.map((atom) => (
                <SourceRow key={atom.id} atom={atom} number={cites.get(atom.id)} onAtom={() => onAtom(atom.id)} />
              ))}
            </ul>
          </section>
        );
      })}
      <p className="px-2 text-xs text-foreground-low">
        {cited.length} distinct atoms cited by the current revision. Open one to see where it came from.
      </p>
    </div>
  );
}
