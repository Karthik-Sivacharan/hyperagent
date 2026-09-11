"use client";

import { useFleet } from "@/components/teams/fleet/fleet-context";

// Stub from the foundation agent; the list agent replaces this file.
export function ListView() {
  const { runs } = useFleet();
  return <div className="p-6 text-sm text-muted-foreground">List: {runs.length} runs</div>;
}
