"use client";

import { useOptimistic, useTransition } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Which design of the article page to show. The choice is saved by a Server
// Function (a cookie) and the server renders the page again in that design;
// the switch moves at once and the page follows.

export function WikiVersionToggle({
  value,
  options,
  choose,
}: {
  value: string;
  options: { id: string; label: string }[];
  choose: (id: string) => Promise<void>;
}) {
  const [shown, setShown] = useOptimistic(value);
  const [pending, startTransition] = useTransition();

  return (
    <ToggleGroup
      type="single"
      spacing={0}
      size="sm"
      value={shown}
      onValueChange={(next) => {
        if (!next || next === shown) return;
        startTransition(async () => {
          setShown(next);
          await choose(next);
        });
      }}
      aria-label="Page design"
      aria-busy={pending || undefined}
      className="shrink-0"
    >
      {options.map((option) => (
        <ToggleGroupItem key={option.id} value={option.id}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
