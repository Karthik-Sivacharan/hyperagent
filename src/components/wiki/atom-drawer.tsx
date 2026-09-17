"use client";

import { IconFileText, IconMessage, IconBookmark } from "@tabler/icons-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Overline } from "@/components/ui/overline";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { wikiGroupDot, type WikiAtom, type WikiGroupId, type WikiSource } from "@/lib/mock/wiki";

// One MemoryAtom, opened from a citation, a revision diff or another atom:
// what it claims, the Topics it is linked to, its validity window, the
// supersession chain around it, the sources it was extracted from and the
// pages citing it. Every id in here is another atom you can walk to.

const fmtDate = (value: string | null) =>
  value
    ? new Date(value.slice(0, 19)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

const fmtStamp = (value: string | null) =>
  value ? `${fmtDate(value)} ${value.slice(11, 16)}` : "—";

const statusVariant = (status: string) =>
  status === "current" ? "success" : status === "retracted" ? "destructive" : "secondary";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2 border-t border-border-subtle pt-4">
      <Overline>{title}</Overline>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 py-1 text-xs">
      <span className="w-36 shrink-0 text-foreground-low">{label}</span>
      <span className="min-w-0 flex-1 text-foreground">{children}</span>
    </div>
  );
}

const SOURCE_ICON = { thread: IconMessage, document: IconFileText, memory: IconBookmark } as const;

function SourceCard({ source }: { source: WikiSource }) {
  const Icon = SOURCE_ICON[source.kind as keyof typeof SOURCE_ICON] ?? IconFileText;
  return (
    <div className="flex flex-col gap-1 rounded-md p-3 shadow-edge">
      <div className="flex items-center gap-2">
        <Icon className="size-3.5 text-foreground-low" aria-hidden="true" />
        <span className="text-label-12-caps text-foreground-low">{source.label}</span>
        {source.ref ? <span className="text-label-12-mono text-muted-foreground">{source.ref}</span> : null}
      </div>
      {source.title ? <div className="text-xs text-foreground">“{source.title}”</div> : null}
      {source.meta ? <div className="text-xs text-foreground-low">{source.meta}</div> : null}
      {source.excerpt ? (
        <p className="mt-1 border-l-2 border-border pl-3 text-xs leading-5 text-muted-foreground">{source.excerpt}</p>
      ) : null}
    </div>
  );
}

function AtomRow({
  atom,
  note,
  onOpen,
  muted,
}: {
  atom: WikiAtom;
  note?: string;
  onOpen?: () => void;
  muted?: boolean;
}) {
  const body = (
    <>
      <span className={cn("block text-xs leading-5", muted ? "text-muted-foreground line-through" : "text-foreground")}>
        {atom.content}
      </span>
      <span className="mt-1 block text-label-12-mono text-foreground-low">{note ?? atom.id}</span>
    </>
  );
  if (!onOpen) {
    return <li className="rounded-md p-2.5 shadow-edge">{body}</li>;
  }
  return (
    <li>
      <Button
        variant="ghost"
        size="none"
        onClick={onOpen}
        className="w-full items-start justify-start rounded-md p-2.5 text-left font-normal whitespace-normal shadow-edge hover:bg-tint-10"
      >
        <span className="min-w-0 flex-1">{body}</span>
      </Button>
    </li>
  );
}

export function AtomDrawer({
  atomId,
  atoms,
  topicTitles,
  onOpenAtom,
  onClose,
}: {
  atomId: string | null;
  atoms: Record<string, WikiAtom>;
  topicTitles: Record<string, { title: string; group: WikiGroupId }>;
  onOpenAtom: (id: string) => void;
  onClose: () => void;
}) {
  const atom = atomId ? atoms[atomId] : undefined;

  // Newest first: what superseded this atom, this atom, then what it replaced.
  const forward: WikiAtom[] = [];
  const backward: WikiAtom[] = [];
  if (atom) {
    let cursor: WikiAtom | undefined = atom;
    const seen = new Set([atom.id]);
    while (cursor?.supersededById && atoms[cursor.supersededById] && !seen.has(cursor.supersededById)) {
      cursor = atoms[cursor.supersededById];
      seen.add(cursor.id);
      forward.unshift(cursor);
    }
    cursor = atom;
    while (cursor?.supersedesIds.length) {
      const previous: WikiAtom | undefined = atoms[cursor.supersedesIds[0]];
      if (!previous || seen.has(previous.id)) break;
      seen.add(previous.id);
      backward.push(previous);
      cursor = previous;
    }
  }
  const chain = atom ? [...forward, atom, ...backward] : [];

  return (
    <Sheet open={Boolean(atom)} onOpenChange={(open) => (open ? undefined : onClose())}>
      <SheetContent side="right" className="gap-0 sm:max-w-lg">
        {atom ? (
          <>
            <SheetHeader className="gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline">{atom.type}</Badge>
                <Badge variant={statusVariant(atom.status)}>{atom.statusLabel}</Badge>
                {atom.userAuthored ? <Badge variant="secondary">user-authored</Badge> : null}
                {atom.namedAgent ? <Badge variant="secondary">private to {atom.namedAgent}</Badge> : null}
                {atom.withheld.map((reason) => (
                  <Badge key={reason} variant="warning">
                    withheld · {reason}
                  </Badge>
                ))}
              </div>
              <SheetTitle className="text-base leading-6 font-normal">{atom.content}</SheetTitle>
              <SheetDescription className="text-xs">{atom.title || atom.id}</SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-6">
              {atom.appliesWhen ? (
                <Section title="Applies when">
                  <p className="text-xs leading-5 text-muted-foreground">{atom.appliesWhen}</p>
                </Section>
              ) : null}

              <Section title="Topics">
                <div className="flex flex-wrap gap-1.5">
                  {atom.topicIds.map((id) => {
                    const topic = topicTitles[id];
                    return (
                      <Badge key={id} variant="outline" className="gap-1.5">
                        <span
                          className={cn("size-1.5 rounded-full", wikiGroupDot[topic?.group ?? "concept"])}
                          aria-hidden="true"
                        />
                        {topic?.title ?? id}
                      </Badge>
                    );
                  })}
                </div>
              </Section>

              <Section title="Validity and lifecycle">
                <div className="flex flex-col divide-y divide-border-subtle">
                  <Field label="validFrom">{fmtStamp(atom.validFrom)}</Field>
                  <Field label="validTo">{atom.validTo ? fmtStamp(atom.validTo) : "open"}</Field>
                  <Field label="supersededById">
                    {atom.supersededById ? (
                      <Button
                        variant="ghost"
                        size="none"
                        onClick={() => onOpenAtom(atom.supersededById as string)}
                        className="text-label-12-mono underline decoration-border underline-offset-4 hover:bg-transparent hover:decoration-brand-accent"
                      >
                        {atom.supersededById}
                      </Button>
                    ) : (
                      "—"
                    )}
                  </Field>
                  <Field label="extraction group">{atom.extractionGroup}</Field>
                  <Field label="dreamRunId">{atom.dreamRunId ?? "—"}</Field>
                  <Field label="id">
                    <span className="text-label-12-mono">{atom.id}</span>
                  </Field>
                </div>
              </Section>

              {chain.length > 1 ? (
                <Section title="Supersession chain">
                  <ul className="flex flex-col gap-1.5">
                    {chain.map((entry, index) => (
                      <AtomRow
                        key={entry.id}
                        atom={entry}
                        muted={entry.id !== atom.id && entry.status !== "current"}
                        note={
                          entry.id === atom.id
                            ? `this atom · ${fmtDate(entry.validFrom)}`
                            : `${index === 0 ? "latest · " : index === chain.length - 1 ? "first version · " : ""}${fmtDate(entry.validFrom)}`
                        }
                        onOpen={entry.id === atom.id ? undefined : () => onOpenAtom(entry.id)}
                      />
                    ))}
                  </ul>
                </Section>
              ) : null}

              {atom.conflictWith.length ? (
                <Section title="Conflicting evidence retained">
                  <ul className="flex flex-col gap-1.5">
                    {atom.conflictWith
                      .filter((id) => atoms[id])
                      .map((id) => (
                        <AtomRow key={id} atom={atoms[id]} onOpen={() => onOpenAtom(id)} />
                      ))}
                  </ul>
                  <p className="text-xs text-foreground-low">
                    Reconciliation declined to pick a side; both claims stay current until new evidence settles them.
                  </p>
                </Section>
              ) : null}

              <Section title={`Sources · ${atom.sources.length}`}>
                {atom.sources.length ? (
                  <div className="flex flex-col gap-2">
                    {atom.sources.map((source, index) => (
                      <SourceCard key={`${source.ref}-${index}`} source={source} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-foreground-low">No source reference recorded.</p>
                )}
              </Section>

              <Section title={`Cited by pages · ${atom.citedBy.length}`}>
                {atom.citedBy.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {atom.citedBy.map((page) => (
                      <Badge key={page.slug} variant="outline" asChild>
                        <Link href={`/wiki/${page.slug}`}>{page.title}</Link>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-foreground-low">Not cited by any current page version.</p>
                )}
              </Section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
