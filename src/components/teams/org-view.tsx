"use client";

import { useFleet } from "@/components/teams/fleet/fleet-context";

// Stub from the foundation agent; the org agent replaces this file.
export function OrgView() {
  const { agents } = useFleet();
  return <div className="p-6 text-sm text-muted-foreground">Org chart: {agents.length} agents</div>;
}
