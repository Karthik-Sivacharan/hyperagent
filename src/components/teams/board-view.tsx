"use client";

import { useFleet } from "@/components/teams/fleet/fleet-context";

// Stub from the foundation agent; the board agent replaces this file.
export function BoardView() {
  const { runs } = useFleet();
  return <div className="p-6 text-sm text-muted-foreground">Board: {runs.length} runs</div>;
}
