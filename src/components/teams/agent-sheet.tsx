"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { AgentProfile } from "@/components/teams/sheet/agent-profile";

// The agent sheet: a 460px panel from the right that opens whenever any view
// calls `openAgent(id)` and closes through `closeAgent()`. The page renders
// it once, inside FleetProvider. What it shows is sheet/agent-profile.tsx;
// this file owns the three things a sheet around it has to get right.
//
// 1. IT KEEPS SHOWING THE LAST AGENT WHILE IT CLOSES. `selectedAgentId`
//    goes back to null the moment the sheet is dismissed, but the sheet
//    still has 90ms of exit animation to play, so `shownId` holds on to the
//    last agent (React's "store information from previous renders" pattern)
//    and the panel slides out full, not blank.
//
// 2. MOVING TO ANOTHER AGENT DOES NOT RE-SLIDE. The Sheet stays open and
//    only its contents change: AgentProfile is keyed by agent id under
//    AnimatePresence, so the pages cross-fade in place (agent-profile.tsx
//    has the timings). First open does not fade (`initial={false}`): the
//    sheet's own slide is the entrance.
//
// 3. FOCUS GOES BACK WHERE IT CAME FROM. Radix returns focus to the
//    dialog's Trigger on close, but this sheet has no Trigger (a card, a row
//    or an org node opens it through the context), so left alone focus would
//    fall to <body>. On open we remember what had focus and move it to the
//    sheet itself, so a screen reader hears the agent's name and role before
//    anything else; on close we hand it back. Moving to another agent inside
//    the sheet puts focus on the sheet again, so the new name is announced
//    and the keyboard is not stranded on the chip that just faded away.
//    Escape, the scrim and the close button all close it (Radix).

export function AgentSheet() {
  const { selectedAgentId, agentById, closeAgent } = useFleet();

  const [shownId, setShownId] = useState<string | null>(selectedAgentId);
  if (selectedAgentId !== null && selectedAgentId !== shownId) setShownId(selectedAgentId);

  const open = selectedAgentId !== null;
  const agent = shownId ? agentById(shownId) : null;

  const contentRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const settledIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      settledIdRef.current = null;
      return;
    }
    if (settledIdRef.current !== null && settledIdRef.current !== shownId) {
      contentRef.current?.focus({ preventScroll: true });
    }
    settledIdRef.current = shownId;
  }, [open, shownId]);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next) closeAgent();
      }}
    >
      <SheetContent
        ref={contentRef}
        side="right"
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          const active = document.activeElement;
          openerRef.current = active instanceof HTMLElement && active !== document.body ? active : null;
          event.preventDefault();
          contentRef.current?.focus({ preventScroll: true });
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          const opener = openerRef.current;
          openerRef.current = null;
          if (opener?.isConnected) opener.focus({ preventScroll: true });
        }}
        // 460px at rest (full width on a phone). `--avatar-cutout` is the
        // sheet's own surface, so the state dots and presence rings on every
        // avatar inside are cut out of the panel, not of the page canvas.
        className="gap-0 outline-none data-[side=right]:w-full data-[side=right]:sm:max-w-[460px] [--avatar-cutout:var(--overlay)]"
      >
        <div className="relative min-h-0 flex-1">
          <AnimatePresence initial={false}>{agent ? <AgentProfile key={agent.id} agent={agent} /> : null}</AnimatePresence>
        </div>

        {/* Outside the cross-fade, so it holds still while the pages swap;
            last in the tab order, as the primitive's own close button is. */}
        <SheetClose asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
          >
            <IconX aria-hidden="true" />
            <span className="sr-only">Close</span>
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
