"use client";

import * as React from "react";
import { AnimatePresence, motion, useIsPresent } from "motion/react";
import { IconMessageCircle, IconUsers } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import type { FleetAgent, FleetRun, TeamMember } from "@/lib/mock/teams";
import type { ActorId, Tile } from "@/components/teams/space/types";
import { AgentAvatar } from "@/components/teams/fleet/agent-avatar";
import { TONE_GLYPH } from "@/components/teams/fleet/run-caption";
import { Caret, FADE, Floating, INK_VARS } from "@/components/teams/space/actors/floating";
import type { SceneStore } from "@/components/teams/space/scene/store";

// Name tags (docs/plans/2026-09-11-teams-space-v1.md §3): Gather's pill in
// the brand. 24px tall, 8px corners, `text-xs font-medium`, a caret pointing
// down at the head with its tip 4px above it, taking no pointer so the
// character under it gets the hover and the click. The colours are the ink
// Tooltip's (ink in light, the light pill in dark), so a tag reads as the
// same family as the cards that open from it.
//
//   agent    a 20px AgentAvatar (the orb: never mistaken for a person), the
//            name, and a 14px glyph only when paused or in error
//   person   a presence mark (a filled dot online, a hollow ring away; neutral,
//            not green), the first name, and a "You" chip on you
//   group    the first names of everyone standing together, after IconUsers
//            when they share a live run or IconMessageCircle for a chat
//   away     an empty desk whose owner is offline: quieter, on the card
//
// Level 1 of the disclosure (hover or keyboard focus, at once) adds the role
// after the name, or, on a group tag, a second line with the meant member's
// name and role; an agent's collaborators on its live run get a ring on
// their tags. All of it fades (140ms in, 90ms out); the pill takes its new
// size at once, which moves nothing, since a tag floats.
//
// Every tag on screen marks itself `data-obstacle` (and says whose it is,
// `data-tag-members`), so the ask card can hang where it covers none.

/** The head of a character, where a tag's caret points. */
export function headOf(store: SceneStore, id: ActorId) {
  const box = store.box(id);
  return box ? { x: box.cx, y: box.head } : null;
}

/** Above a group: centred on its members, at the highest head. */
export function groupHeadOf(store: SceneStore, ids: readonly ActorId[]) {
  let x = 0;
  let y = Infinity;
  let n = 0;
  for (const id of ids) {
    const box = store.box(id);
    if (!box) continue;
    x += box.cx;
    y = Math.min(y, box.head);
    n++;
  }
  return n ? { x: x / n, y } : null;
}

const PILL =
  "flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md bg-primary text-xs font-medium text-primary-foreground shadow-sm transition-[box-shadow] duration-(--duration-enter) ease-out";
/** The level-1 ring on a collaborator's tag: ink on a band of the page ground, the focus ring's shape. */
const HIGHLIGHT = "ring-2 ring-primary/70 ring-offset-2 ring-offset-background";

function TagFrame({
  members,
  anchor,
  deps,
  dimmed,
  highlighted,
  raised,
  className,
  pill,
  children,
}: {
  /** Whose tag it is: the ask card finds its agent's tag, and keeps clear of everyone else's, by this. */
  members: readonly ActorId[];
  anchor: (store: SceneStore) => { x: number; y: number } | null;
  deps: React.DependencyList;
  dimmed?: boolean;
  highlighted?: boolean;
  /** Over its neighbours: the tag the reader means, whose role may now reach into the next one. */
  raised?: boolean;
  className?: string;
  /** Wraps the pill, for a tooltip trigger. */
  pill?: (pill: React.ReactElement) => React.ReactElement;
  children: React.ReactNode;
}) {
  // A tag fading out (its owner just joined a group) no longer takes up room.
  const present = useIsPresent();
  const body = (
    <span
      data-obstacle={present ? "" : undefined}
      data-tag-members={members.join(" ")}
      className={cn(PILL, highlighted && HIGHLIGHT, className)}
      style={INK_VARS}
    >
      {children}
    </span>
  );
  return (
    // Hidden from assistive tech: the character's accessible name already
    // says everything a tag shows (and who it is with, for a group).
    <Floating anchor={anchor} deps={deps} className={raised ? "z-10" : undefined} aria-hidden>
      <motion.div {...FADE} className="absolute bottom-1 left-0 -translate-x-1/2">
        <div
          className={cn(
            "flex flex-col items-center transition-opacity duration-(--duration-normal) ease-out",
            dimmed && "opacity-40",
          )}
        >
          {pill ? pill(body) : body}
          <Caret className="text-primary" />
        </div>
      </motion.div>
    </Floating>
  );
}

function Role({ role, shown }: { role: string; shown: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {shown ? (
        <motion.span key="role" {...FADE} className="text-muted-foreground">
          , {role}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}

export function AgentTag({
  agent,
  revealed,
  highlighted,
  dimmed,
}: {
  agent: FleetAgent;
  revealed: boolean;
  highlighted: boolean;
  dimmed: boolean;
}) {
  const tone = agent.state === "paused" || agent.state === "error" ? TONE_GLYPH[agent.state] : null;
  return (
    <TagFrame
      members={[agent.id]}
      anchor={(store) => headOf(store, agent.id)}
      deps={[agent.id]}
      dimmed={dimmed}
      highlighted={highlighted}
      raised={revealed}
      className="pr-2 pl-0.5"
    >
      <AgentAvatar agent={agent} size="xs" aria-hidden="true" />
      <span>
        {agent.name}
        <Role role={agent.role} shown={revealed} />
      </span>
      {tone ? (
        // The tag inverts the theme, so each theme takes the other's step:
        // 3.4:1 (warning) and 3.2:1 (destructive) on ink, 4.4:1 and 4.5:1 on the light pill.
        <tone.icon
          aria-hidden="true"
          className={cn("size-3.5", agent.state === "paused" ? "text-warning dark:text-amber-600" : "text-destructive dark:text-red-600")}
        />
      ) : null}
    </TagFrame>
  );
}

function Presence({ online }: { online: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-2 shrink-0 rounded-full",
        online ? "bg-muted-foreground" : "border-[1.5px] border-muted-foreground",
      )}
    />
  );
}

export function PersonTag({
  member,
  you,
  revealed,
  highlighted,
}: {
  member: TeamMember;
  you: boolean;
  revealed: boolean;
  highlighted: boolean;
}) {
  return (
    <TagFrame
      members={[member.id]}
      anchor={(store) => headOf(store, member.id)}
      deps={[member.id]}
      highlighted={highlighted}
      raised={revealed}
      className={you ? "pr-1 pl-2" : "px-2"}
    >
      <Presence online={member.online} />
      <span>
        {member.name.split(" ")[0]}
        <Role role={member.role} shown={revealed} />
      </span>
      {you ? (
        <span className="rounded-xs px-1 leading-4 font-normal text-muted-foreground inset-ring inset-ring-primary-foreground/25">
          You
        </span>
      ) : null}
    </TagFrame>
  );
}

export function GroupTag({
  members,
  names,
  run,
  detail,
  highlighted,
  dimmed,
  pill,
}: {
  members: readonly ActorId[];
  names: readonly string[];
  run: FleetRun | null;
  /**
   * Level 1 for one member: a merged tag has no room for a role, so the
   * member the reader means gets a second line, "Rook, Outbound lead".
   */
  detail: { id: ActorId; name: string; role: string } | null;
  highlighted: boolean;
  dimmed: boolean;
  pill: (pill: React.ReactElement) => React.ReactElement;
}) {
  const Icon = run ? IconUsers : IconMessageCircle;
  const key = members.join("+");
  return (
    <TagFrame
      members={members}
      anchor={(store) => groupHeadOf(store, members)}
      deps={[key]}
      dimmed={dimmed}
      highlighted={highlighted}
      className="pointer-events-auto h-auto min-h-6 cursor-default flex-col items-start gap-0 px-2 py-1"
      pill={pill}
    >
      <span className="flex h-4 items-center gap-1.5">
        <Icon aria-hidden="true" stroke={1.5} className="size-3.5 text-muted-foreground" />
        <span>{names.join(", ")}</span>
      </span>
      <AnimatePresence initial={false}>
        {detail ? (
          // Under the names, past the icon (14px and the 6px gap).
          <motion.span key={detail.id} {...FADE} className="block pl-5 leading-4">
            {detail.name}
            <span className="text-muted-foreground">, {detail.role}</span>
          </motion.span>
        ) : null}
      </AnimatePresence>
    </TagFrame>
  );
}

/** An offline person's empty desk: their name and "away", quieter than a tag on a character. */
export function AwayTag({ member, tile }: { member: TeamMember; tile: Tile }) {
  return (
    <Floating anchor={(store) => store.tileHead(tile, member.id)} deps={[member.id, tile.x, tile.y]}>
      <div className="absolute bottom-1 left-0 flex -translate-x-1/2 flex-col items-center">
        <span
          data-obstacle=""
          className="flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md bg-card px-2 text-xs font-medium text-muted-foreground shadow-card"
        >
          <Presence online={false} />
          {member.name.split(" ")[0]}, away
        </span>
        <Caret className="text-card" />
      </div>
    </Floating>
  );
}
