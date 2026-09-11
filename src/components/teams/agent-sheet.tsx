"use client";

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useFleet } from "@/components/teams/fleet/fleet-context";

// Stub from the foundation agent; the sheet agent replaces this file.
export function AgentSheet() {
  const { selectedAgentId, agentById, closeAgent } = useFleet();
  const agent = selectedAgentId ? agentById(selectedAgentId) : null;
  return (
    <Sheet open={agent !== null} onOpenChange={(open) => (open ? null : closeAgent())}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{agent?.name}</SheetTitle>
          <SheetDescription>{agent?.role}</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  );
}
