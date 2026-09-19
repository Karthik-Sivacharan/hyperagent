"use client";

import { useId, useOptimistic, useTransition } from "react";
import { IconBuilding } from "@tabler/icons-react";
import { AgentGlyph } from "@/components/brand/agent-glyph";
import { Overline } from "@/components/ui/overline";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { wikiAgentGlyph } from "@/components/wiki/topic-type";

// Whose wiki to read: the workspace's shared pages, or one assistant's view of
// them, which adds the pages that assistant composed for itself. Saved the way
// the design switch is: a Server Function sets a cookie and the server renders
// the page again in that scope, or opens the scope's page on the same Topic
// when this one is not in it. The select moves at once and the page follows.
// Each assistant shows its glyph, the face it wears across the app; the
// workspace has no face, so it shows the workspace icon in the same 16px box.
// The option's content is also what the closed select shows, so the face
// travels into the trigger with the name. The trigger keeps one width, wide
// enough for the longest name, so choosing a scope never shifts the row.

/** The face or icon for one option, sized to the select's 16px icon box. */
function ScopeMark({ id }: { id: string }) {
  const glyph = wikiAgentGlyph(id);
  if (!glyph) return <IconBuilding className="size-4 text-muted-foreground" aria-hidden="true" />;
  return <AgentGlyph shape={glyph} size={16} className="size-4" />;
}

export type WikiScopeSwitch = {
  value: string;
  options: { id: string; label: string }[];
  choose: (id: string) => Promise<void>;
};

export function WikiScopeSelect({ value, options, choose }: WikiScopeSwitch) {
  const labelId = useId();
  const triggerId = useId();
  const [shown, setShown] = useOptimistic(value);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex min-w-0 items-center gap-2">
      <Overline id={labelId} className="shrink-0">
        Viewing as
      </Overline>
      <Select
        value={shown}
        onValueChange={(next) => {
          if (next === shown) return;
          startTransition(async () => {
            setShown(next);
            await choose(next);
          });
        }}
      >
        {/* Named by the label and its own value: "Viewing as Ops Assistant". */}
        <SelectTrigger
          id={triggerId}
          variant="tint"
          size="sm"
          aria-labelledby={`${labelId} ${triggerId}`}
          aria-busy={pending || undefined}
          className="w-72"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent align="start">
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              <span className="flex min-w-0 items-center gap-2">
                <ScopeMark id={option.id} />
                <span className="truncate">{option.label}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
