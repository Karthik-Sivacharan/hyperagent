"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TopicChip } from "@/components/wiki/topic-chip";
import type { WikiLinkedFrom } from "@/lib/mock/wiki";

// The pages that link here, at the foot of the page where reading ends: each
// as its Topic chip and the sentence that carries the link. The first few
// show; the rest wait behind "Show all".

const SHOWN = 4;

export function MentionedIn({ entries }: { entries: WikiLinkedFrom[] }) {
  const [all, setAll] = useState(false);
  if (!entries.length) return null;
  const shown = all ? entries : entries.slice(0, SHOWN);

  return (
    <section
      id="mentioned-in"
      aria-labelledby="mentioned-in-title"
      className="mt-6 flex scroll-mt-24 flex-col gap-4 border-t border-border-subtle pt-5"
    >
      <h2 id="mentioned-in-title" className="flex items-baseline gap-2 font-heading text-base text-foreground">
        Mentioned in
        <span className="text-sm font-normal text-foreground-low tabular-nums">{entries.length}</span>
      </h2>
      <ul className="flex flex-col gap-3">
        {shown.map((entry) => (
          <li key={entry.slug} className="flex flex-col items-start gap-1">
            <TopicChip group={entry.group} label={entry.title} href={`/wiki/${entry.slug}`} />
            <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
              {entry.sentence.replace(/^[.\s]+/, "") || "cites an atom linked to this Topic"}
            </p>
          </li>
        ))}
      </ul>
      {entries.length > SHOWN && !all ? (
        <Button variant="ghost" size="xs" onClick={() => setAll(true)} className="w-fit">
          Show all {entries.length}
        </Button>
      ) : null}
    </section>
  );
}
