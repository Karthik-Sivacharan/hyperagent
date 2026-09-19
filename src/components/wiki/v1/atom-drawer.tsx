"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Overline } from "@/components/ui/overline";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supersessionChain } from "@/components/wiki/atom-drawer";
import { AtomTypeIcon, SourceKindIcon, TopicChip } from "@/components/wiki/topic-chip";
import { fmtDay, fmtStamp } from "@/components/wiki/v1/format";
import type { WikiAtom, WikiGroupId, WikiSource, WikiTopicRef } from "@/lib/mock/wiki";

// One atom in v1, opened from a citation, a source or another atom: the same
// record the shared drawer shows, set on the article's scale. The atom's short
// title leads as the heading and the claim reads under it at the body size;
// the pills above are the chips' size; the record is a table like the rail's
// Details, in words rather than field names; the Topics and the pages citing
// it are Topic chips, and so are the assistants it was extracted by or is
// private to, as the header's "From" names them; and sections part by space,
// as the article's do. The
// original drawer stays as it was for the original design and the two other
// wiki views.

/** A pill at the chips' size, so a row of them reads as one set with the Topic chips. */
const PILL = "h-6 px-2 text-md [&>svg]:size-3.5!";

const statusVariant = (status: string) =>
  status === "current" ? "success" : status === "retracted" ? "destructive" : "secondary";

/** "retracted by Leo Kirkwood" to "Retracted by Leo Kirkwood". */
const sentence = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

function Section({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Overline className="flex-1">{title}</Overline>
        {count !== undefined ? <span className="text-label-12-mono text-foreground-low">{count}</span> : null}
      </div>
      {children}
    </section>
  );
}

/** A label and its value; `centred` for a value taller than the label's line, such as a chip. */
function Row({ label, centred, children }: { label: string; centred?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("flex gap-3 py-1 text-md", centred && "items-center")}>
      <dt className="w-28 shrink-0 text-foreground-low">{label}</dt>
      <dd className="min-w-0 flex-1 text-foreground tabular-nums">{children}</dd>
    </div>
  );
}

function SourceCard({ source }: { source: WikiSource }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg p-3 shadow-edge">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <SourceKindIcon kind={source.kind} className="text-foreground-low" />
        <span>{source.label}</span>
        {source.ref ? <span className="ml-auto text-label-12-mono font-normal text-foreground-low">{source.ref}</span> : null}
      </div>
      {source.title ? <p className="text-sm text-pretty text-foreground">{source.title}</p> : null}
      {source.meta ? <p className="text-md text-pretty text-foreground-low">{source.meta}</p> : null}
      {source.excerpt ? (
        <blockquote className="mt-1 border-l-2 border-border pl-3 text-md text-pretty text-muted-foreground">
          {source.excerpt}
        </blockquote>
      ) : null}
    </div>
  );
}

/**
 * Another atom in a list: its claim as a row you can open. The atom already
 * open is the row with the fill, as the page you are on is in the index.
 */
function AtomRow({ atom, note, onOpen, muted }: { atom: WikiAtom; note: string; onOpen?: () => void; muted?: boolean }) {
  const body = (
    <>
      <span className={cn("text-sm text-pretty", muted ? "text-muted-foreground" : "text-foreground")}>{atom.content}</span>
      <span className="text-md text-foreground-low tabular-nums">{note}</span>
    </>
  );
  if (!onOpen) {
    return <li className="flex flex-col gap-1 rounded-lg bg-tint-10 p-3">{body}</li>;
  }
  return (
    <li>
      <Button
        variant="ghost"
        size="none"
        onClick={onOpen}
        className="h-auto w-full flex-col items-start justify-start gap-1 rounded-lg p-3 text-left font-normal whitespace-normal shadow-edge hover:bg-tint-10"
      >
        {body}
      </Button>
    </li>
  );
}

export function AtomDrawerV1({
  atomId,
  atoms,
  topicTitles,
  pageGroups,
  assistants,
  onOpenAtom,
  onClose,
}: {
  atomId: string | null;
  atoms: Record<string, WikiAtom>;
  topicTitles: Record<string, WikiTopicRef>;
  /** Each listed page's Topic group, so the pages citing an atom can be chips. */
  pageGroups: Record<string, WikiGroupId>;
  /** The assistants' names: an extraction group named here is someone, drawn as their chip. */
  assistants: string[];
  onOpenAtom: (id: string) => void;
  onClose: () => void;
}) {
  const atom = atomId ? atoms[atomId] : undefined;
  const chain = atom ? supersessionChain(atom, atoms) : [];
  const successor = atom?.supersededById ? atoms[atom.supersededById] : undefined;
  const byAssistant = Boolean(atom && assistants.includes(atom.extractionGroup));

  return (
    <Sheet open={Boolean(atom)} onOpenChange={(open) => (open ? undefined : onClose())}>
      <SheetContent side="right" className="gap-0 sm:max-w-lg">
        {atom ? (
          <>
            <SheetHeader className="gap-3 px-6 pt-6 pb-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className={PILL}>
                  <AtomTypeIcon type={atom.type} />
                  {sentence(atom.type)}
                </Badge>
                <Badge variant={statusVariant(atom.status)} className={PILL}>
                  {sentence(atom.statusLabel)}
                </Badge>
                {atom.userAuthored ? (
                  <Badge variant="secondary" className={PILL}>
                    User-authored
                  </Badge>
                ) : null}
                {atom.namedAgent ? (
                  <span className="inline-flex items-center gap-1.5 text-md text-foreground-low">
                    Private to
                    <TopicChip group="agent" label={atom.namedAgent} />
                  </span>
                ) : null}
                {atom.withheld.map((reason) => (
                  <Badge key={reason} variant="warning" className={PILL}>
                    Withheld · {reason}
                  </Badge>
                ))}
              </div>
              {/* The short title leads; an atom without one leads with its claim. */}
              <SheetTitle className="text-xl text-balance">{atom.title || atom.content}</SheetTitle>
              {atom.title ? (
                <SheetDescription className="text-base text-pretty text-foreground">{atom.content}</SheetDescription>
              ) : (
                <SheetDescription className="sr-only">
                  {sentence(atom.type)}, {atom.statusLabel}
                </SheetDescription>
              )}
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6 pt-6 pb-8">
              {atom.appliesWhen ? (
                <Section title="Applies when">
                  <p className="text-sm text-pretty text-muted-foreground">{atom.appliesWhen}</p>
                </Section>
              ) : null}

              {atom.topicIds.length ? (
                <Section title="Topics" count={atom.topicIds.length}>
                  <div className="flex flex-wrap gap-1.5">
                    {atom.topicIds.map((id) => {
                      const topic = topicTitles[id];
                      return (
                        <TopicChip
                          key={id}
                          group={topic?.group ?? "concept"}
                          label={topic?.title ?? id}
                          href={topic?.slug ? `/wiki/${topic.slug}` : undefined}
                        />
                      );
                    })}
                  </div>
                </Section>
              ) : null}

              <Section title="Details">
                <dl className="flex flex-col divide-y divide-border-subtle">
                  <Row label="Valid from">{atom.validFrom ? fmtStamp(atom.validFrom) : "Not recorded"}</Row>
                  <Row label="Valid until">{atom.validTo ? fmtStamp(atom.validTo) : "No end date"}</Row>
                  {atom.supersededById ? (
                    <Row label="Superseded by">
                      <Button
                        variant="link"
                        size="none"
                        onClick={() => onOpenAtom(atom.supersededById as string)}
                        className="h-auto text-left font-normal whitespace-normal text-foreground"
                      >
                        {successor?.title || atom.supersededById}
                      </Button>
                    </Row>
                  ) : null}
                  <Row label="Extracted from" centred={byAssistant}>
                    {byAssistant ? <TopicChip group="agent" label={atom.extractionGroup} /> : sentence(atom.extractionGroup)}
                  </Row>
                  <Row label="Run">{atom.dreamRunId ?? "None"}</Row>
                  <Row label="Id">
                    <span className="text-label-12-mono break-all">{atom.id}</span>
                  </Row>
                </dl>
              </Section>

              {chain.length > 1 ? (
                <Section title="Versions" count={chain.length}>
                  <ul className="flex flex-col gap-2">
                    {chain.map((entry, index) => (
                      <AtomRow
                        key={entry.id}
                        atom={entry}
                        muted={entry.id !== atom.id && entry.status !== "current"}
                        note={[
                          entry.id === atom.id ? "This atom" : index === 0 ? "Latest" : index === chain.length - 1 ? "First" : null,
                          entry.validFrom ? fmtDay(entry.validFrom) : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                        onOpen={entry.id === atom.id ? undefined : () => onOpenAtom(entry.id)}
                      />
                    ))}
                  </ul>
                </Section>
              ) : null}

              {atom.conflictWith.length ? (
                <Section title="Conflicting evidence" count={atom.conflictWith.filter((id) => atoms[id]).length}>
                  <ul className="flex flex-col gap-2">
                    {atom.conflictWith
                      .filter((id) => atoms[id])
                      .map((id) => (
                        <AtomRow
                          key={id}
                          atom={atoms[id]}
                          note={atoms[id].validFrom ? fmtDay(atoms[id].validFrom) : sentence(atoms[id].statusLabel)}
                          onOpen={() => onOpenAtom(id)}
                        />
                      ))}
                  </ul>
                  <p className="text-md text-pretty text-foreground-low">
                    Reconciliation declined to pick a side; both claims stay current until new evidence settles them.
                  </p>
                </Section>
              ) : null}

              <Section title="Sources" count={atom.sources.length}>
                {atom.sources.length ? (
                  <div className="flex flex-col gap-2">
                    {atom.sources.map((source, index) => (
                      <SourceCard key={`${source.ref}-${index}`} source={source} />
                    ))}
                  </div>
                ) : (
                  <p className="text-md text-foreground-low">No source reference recorded.</p>
                )}
              </Section>

              <Section title="Cited by" count={atom.citedBy.length}>
                {atom.citedBy.length ? (
                  <div className="flex flex-wrap gap-1.5">
                    {atom.citedBy.map((page) => (
                      <TopicChip
                        key={page.slug}
                        group={pageGroups[page.slug] ?? "concept"}
                        label={page.title}
                        href={`/wiki/${page.slug}`}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-md text-foreground-low">Not cited by any current page version.</p>
                )}
              </Section>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
