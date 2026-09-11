"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { IconArrowUpRight, IconDots, IconPlayerPause, IconPlayerPlay, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet";
import type { FleetAgent } from "@/lib/mock/teams";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { AgentProfile } from "@/components/teams/sheet/agent-profile";

// The agent sheet: a 460px panel from the right that opens whenever any view
// calls `openAgent(id)` and closes through `closeAgent()`. The page renders
// it once, inside FleetProvider. What it shows is sheet/agent-profile.tsx;
// this file owns the four things a sheet around it has to get right.
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
//    sheet's own slide is the entrance. The header's two controls, More and
//    close, sit outside the cross-fade so they hold still while it plays.
//
// 3. THE DETAILS FOLD REMEMBERS. Whether Details is open lives here, not in
//    the page, so someone comparing agents opens it once and walks from
//    agent to agent with it open. It starts closed.
//
// 4. FOCUS GOES BACK WHERE IT CAME FROM. Radix returns focus to the
//    dialog's Trigger on close, but this sheet has no Trigger (a card, a row
//    or an org node opens it through the context), so left alone focus would
//    fall to <body>. On open we remember what had focus and move it to the
//    sheet itself, so a screen reader hears the agent's name and role before
//    anything else; on close we hand it back. Moving to another agent inside
//    the sheet puts focus on the sheet again, so the new name is announced
//    and the keyboard is not stranded on the chip that just faded away.
//    Escape, the scrim and the close button all close it (Radix).

/**
 * More and close, pinned over the header's top right and centred on its 48px
 * row (agent-profile.tsx keeps the name clear of them). Both menu items are
 * inert in v1: there is no agent page to open and nothing to pause. Last in
 * the tab order, as the primitive's own close button is.
 */
function SheetControls({ agent }: { agent: FleetAgent }) {
  const paused = agent.state === "paused";
  return (
    <div className="absolute top-7 right-3 flex items-center gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="More"
            className="text-muted-foreground hover:text-foreground aria-expanded:text-foreground"
          >
            <IconDots aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem>
            <IconArrowUpRight aria-hidden="true" />
            Open agent page
          </DropdownMenuItem>
          <DropdownMenuItem>
            {paused ? <IconPlayerPlay aria-hidden="true" /> : <IconPlayerPause aria-hidden="true" />}
            {paused ? "Resume agent" : "Pause agent"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <SheetClose asChild>
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-foreground">
          <IconX aria-hidden="true" />
          <span className="sr-only">Close</span>
        </Button>
      </SheetClose>
    </div>
  );
}

export function AgentSheet() {
  const { selectedAgentId, agentById, closeAgent } = useFleet();

  const [shownId, setShownId] = useState<string | null>(selectedAgentId);
  if (selectedAgentId !== null && selectedAgentId !== shownId) setShownId(selectedAgentId);

  const [detailsOpen, setDetailsOpen] = useState(false);

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
        // sheet's own surface, so anything an avatar cuts out of its ground
        // is cut from the panel, not from the page canvas.
        className="gap-0 outline-none data-[side=right]:w-full data-[side=right]:sm:max-w-[460px] [--avatar-cutout:var(--overlay)]"
      >
        <div className="relative min-h-0 flex-1">
          <AnimatePresence initial={false}>
            {agent ? (
              <AgentProfile
                key={agent.id}
                agent={agent}
                detailsOpen={detailsOpen}
                onDetailsOpenChange={setDetailsOpen}
              />
            ) : null}
          </AnimatePresence>
        </div>

        {agent ? <SheetControls agent={agent} /> : null}
      </SheetContent>
    </Sheet>
  );
}
