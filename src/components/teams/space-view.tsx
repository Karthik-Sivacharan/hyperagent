"use client";

import * as React from "react";
import { AnimatePresence, useReducedMotion } from "motion/react";

import type { AgentState } from "@/lib/mock/teams";
import type { ActorId, Placement } from "@/components/teams/space/types";
import { useFleet } from "@/components/teams/fleet/fleet-context";
import { useNodeIntent } from "@/components/teams/org/node-intent";
import { searchMatches } from "@/components/teams/org/org-graph";
import { AskCard } from "@/components/teams/space/actors/ask-card";
import { HeadBubble, type BubbleKind } from "@/components/teams/space/actors/bubbles";
import { Character } from "@/components/teams/space/actors/character";
import { AgentCard, GroupCard, PersonCard, SceneTip } from "@/components/teams/space/actors/character-card";
import { SPACE_HINT_ID } from "@/components/teams/space/actors/hint";
import { AgentTag, AwayTag, GroupTag, PersonTag } from "@/components/teams/space/actors/name-tag";
import { YOU, buildCast, type Cast } from "@/components/teams/space/scene/cast";
import { nearestAsk, proximityGroups, type Placed, type ProximityGroup } from "@/components/teams/space/scene/groups";
import { agentName, firstName, personName, shortName } from "@/components/teams/space/scene/labels";
import { SceneProvider, useSceneSnapshot } from "@/components/teams/space/scene/scene-context";
import { CHROME_Z, SceneStore } from "@/components/teams/space/scene/store";
import { useFitStage } from "@/components/teams/space/scene/use-fit-scale";
import { useWalkKeys } from "@/components/teams/space/scene/use-walk-keys";
import { useWander } from "@/components/teams/space/scene/use-wander";
import {
  AWAY_DESKS,
  FloorCanvas,
  FurnitureLayer,
  RoomLabels,
  SEED,
  TILE,
  isWalkable,
  nearestFree,
  roomOf,
  seatOf,
  tileKey,
} from "@/components/teams/space/scene/world";

// The Office view (docs/plans/2026-09-11-teams-space-v1.md): the fleet as a
// place. A top-down pixel office in the spirit of a 2D virtual-office
// product, departments as
// rooms, every agent and every present person a character you can walk,
// drag, hover and click. Same data as the other views (`useFleet()`), same
// agent sheet.
//
// THE STAGE fills the view area and draws the map at the largest whole
// scale that fits (2x at 1456x868), centred. The floor and walls are one
// canvas (world/floor-canvas.tsx), the furniture and the characters are
// sprites y-sorted by z-index in one stacking context (the map box), and
// the chrome (tags, bubbles, the ask card) is one layer over all of them,
// set at its natural size in the same px space: px = tile * TILE * scale.
//
// STATE. The scene store (scene/store.ts) owns every position and runs the
// one animation loop; this component reads its committed snapshot and
// derives everything that depends on where people stand: proximity groups
// (scene/groups.ts), the ask card, each character's accessible name.
//
// DISCLOSURE (plan §3). Level 0 is always drawn: the sprite in its pose, a
// tag, a Needs you bubble. Level 1, on hover or keyboard focus at once: the
// tag adds the role (a group tag, a second line for the member meant), and
// the agents on a live run with it get a ring on their tags. Level 2, 250ms later (the org chart's intent timing,
// org/node-intent.ts): the card. Level 3, click or Enter: the agent sheet.
// Precedence as on the org chart: the pointer, then keyboard focus.
//
// SEARCH dims the agents the query does not find (the org chart's matcher),
// and an sr-only live line counts them.
//
// TWO PROPS, both for the case where the office is not the page. On /teams
// they keep their defaults and nothing here changes.
//
// `walkWhenIdle` is true on /teams because there the office IS the page: arrow
// keys with nothing focused can only mean walk. A page that shows the office
// as one band among several passes false, so the window-level listener that
// would otherwise take the arrow keys off the document never goes on
// (scene/use-walk-keys.ts).
//
// `wander` is the other half of that. With no keyboard and no pointer the
// floor would be a still picture, so this sends characters on short walks and
// brings them back (scene/use-wander.ts). It is off on /teams, where the
// reader moves people themselves. It is also off under reduced motion, which
// is decided here rather than by the caller: `walkTo` teleports when motion is
// reduced, so a wandering office would be characters popping between tiles.

function placementsFor(cast: Cast): Record<ActorId, Placement> {
  return Object.fromEntries(cast.members.map((member) => [member.id, SEED[member.id]]));
}

const NO_COLLABORATORS: ReadonlySet<ActorId> = new Set();

export function SpaceView({
  walkWhenIdle = true,
  wander = false,
}: {
  walkWhenIdle?: boolean;
  wander?: boolean;
}) {
  const { team, agents, allRuns, runs, query, openAgent, agentById, memberById } = useFleet();
  const cast = React.useMemo(() => buildCast(team, agents, allRuns, SEED), [team, agents, allRuns]);
  const [store] = React.useState(() => new SceneStore(placementsFor(cast), YOU, cast.restFor));

  const reduced = useReducedMotion();
  React.useEffect(() => {
    store.start();
    return () => store.stop();
  }, [store]);
  React.useEffect(() => store.setReducedMotion(Boolean(reduced)), [store, reduced]);

  const frameRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<HTMLDivElement>(null);
  const fit = useFitStage(frameRef);
  React.useLayoutEffect(() => {
    if (fit) store.setScale(fit.scale);
  }, [store, fit]);

  const snapshot = useSceneSnapshot(store);
  const { hoveredId, focusedId, tipId, pointerEnter, pointerLeave, focus, blur, dismiss } = useNodeIntent();

  // Where everyone is, and who is standing together. Someone walking or
  // being dragged joins no group until they stop, so passing a desk does
  // not flicker its tag.
  const placed = React.useMemo(
    () =>
      cast.members.map((member): Placed => {
        const at = snapshot[member.id];
        const seat = seatOf(at.seat);
        return { id: member.id, tile: at.tile, room: roomOf(at.tile)?.id ?? null, atDesk: Boolean(seat?.owner) };
      }),
    [cast, snapshot],
  );
  const groups = React.useMemo(
    () => proximityGroups(placed.filter((p) => !snapshot[p.id].moving), cast.liveRuns, cast.nameOrder),
    [placed, snapshot, cast],
  );
  const groupOf = React.useMemo(() => {
    const map = new Map<ActorId, ProximityGroup>();
    for (const group of groups) for (const id of group.members) map.set(id, group);
    return map;
  }, [groups]);

  const you = snapshot[YOU];
  const askId = React.useMemo(() => {
    if (!you || you.moving) return null;
    const others = placed.filter((p) => p.id !== YOU && !snapshot[p.id].moving && cast.byId.get(p.id)?.kind === "agent");
    return nearestAsk(you.tile, others, (id) => cast.asksOf(id).length > 0);
  }, [you, placed, snapshot, cast]);

  // Search.
  const trimmed = query.trim();
  const matches = React.useMemo(
    () => (trimmed ? searchMatches(trimmed, team, agents, runs) : null),
    [trimmed, team, agents, runs],
  );
  const isDimmed = (id: ActorId) => Boolean(matches) && cast.byId.get(id)?.kind === "agent" && !matches!.has(id);
  const matchCount = matches ? agents.filter((agent) => matches.has(agent.id)).length : null;

  // Level 1: who is meant, and who works with them right now.
  const meant = hoveredId ?? focusedId;
  const meantMember = meant ? cast.byId.get(meant) : undefined;
  const collaborators = meantMember?.kind === "agent" ? cast.collaborators(meantMember.id) : NO_COLLABORATORS;

  // A card is anchored where its character was: it closes when they move.
  React.useEffect(() => {
    if (tipId && snapshot[tipId]?.moving) dismiss();
  }, [tipId, snapshot, dismiss]);

  // A reveal or a merge resizes tags without moving anyone: the ask card,
  // which keeps clear of them, looks again.
  React.useEffect(() => store.nudge(), [store, meant, groups, askId]);

  const keys = useWalkKeys(store, mapRef, dismiss, walkWhenIdle);
  // Stable across renders, so the wander loop is not restarted (and everyone's
  // idea of home lost) by a re-render the scene causes anyway.
  const everyone = React.useMemo(() => cast.members.map((member) => member.id), [cast]);
  useWander(store, everyone, wander && !reduced);

  const onHover = React.useCallback((id: ActorId | null) => (id ? pointerEnter(id) : pointerLeave()), [pointerEnter, pointerLeave]);
  const onActivate = React.useCallback(
    (id: ActorId) => {
      dismiss();
      if (cast.byId.get(id)?.kind === "agent") openAgent(id);
    },
    [cast, dismiss, openAgent],
  );

  const onMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!fit) return;
    if (event.target instanceof Element && event.target.closest("[data-actor], [data-chrome]")) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const size = TILE * fit.scale;
    const tile = { x: Math.floor((event.clientX - rect.left) / size), y: Math.floor((event.clientY - rect.top) / size) };
    const to = isWalkable(tile) ? tile : nearestFree(tile, new Set());
    if (to) store.walkTo(YOU, to);
  };

  const companyOf = (id: ActorId) =>
    groupOf.get(id)?.members.filter((other) => other !== id).map((other) => shortName(cast, other)) ?? [];
  const roomName = (id: ActorId) => roomOf(snapshot[id].tile)?.name ?? null;

  const occupied = new Set(Object.values(snapshot).map((at) => tileKey(at.tile)));
  const askAgent = askId ? agentById(askId) : null;
  const askRuns = askId ? cast.asksOf(askId) : [];
  const askOwner = askRuns[0] ? (askRuns[0].ownerId === YOU ? "you" : firstName(memberById(askRuns[0].ownerId).name)) : "";

  return (
    <div ref={frameRef} className="relative min-h-0 flex-1 overflow-auto">
      {fit ? (
        <SceneProvider value={{ store, scale: fit.scale }}>
          <div
            className="relative"
            style={{ width: fit.width + fit.left * 2, height: fit.height + fit.top * 2 }}
          >
            <div
              ref={mapRef}
              role="region"
              aria-label={`${team.name} office`}
              aria-describedby={SPACE_HINT_ID}
              tabIndex={0}
              className="absolute isolate select-none outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              style={{ left: fit.left, top: fit.top, width: fit.width, height: fit.height }}
              onKeyDown={keys.onKeyDown}
              onBlur={keys.onBlur}
              onClick={onMapClick}
            >
              <FloorCanvas scale={fit.scale} />
              <FurnitureLayer scale={fit.scale} />
              <RoomLabels scale={fit.scale} />

              {/* The chrome, over every sprite. First in the DOM so the ask
                  card is the map's first tab stop. */}
              <div data-chrome="" className="pointer-events-none absolute inset-0" style={{ zIndex: CHROME_Z }}>
                <AnimatePresence initial={false}>
                  {askAgent ? (
                    <AskCard
                      key={askAgent.id}
                      agent={askAgent}
                      asks={askRuns}
                      ownerName={askOwner}
                      you={YOU}
                      onOpen={() => onActivate(askAgent.id)}
                    />
                  ) : null}
                </AnimatePresence>

                {AWAY_DESKS.map(({ memberId, seat: seatId }) => {
                  const member = team.members.find((candidate) => candidate.id === memberId);
                  const seat = seatOf(seatId);
                  if (!member || member.online || !seat || occupied.has(tileKey(seat.tile))) return null;
                  return <AwayTag key={memberId} member={member} tile={seat.tile} />;
                })}

                <AnimatePresence initial={false}>
                  {cast.members.flatMap((member) => {
                    if (member.kind !== "agent") return [];
                    return headBubbles(member.agent.id, member.agent.state, cast, groupOf.get(member.id)).map(
                      ({ kind, slot }) => (
                        <HeadBubble
                          key={`${member.id}:${kind}`}
                          id={member.id}
                          kind={kind}
                          slot={slot}
                          state={member.agent.state}
                          dimmed={isDimmed(member.id)}
                        />
                      ),
                    );
                  })}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                  {cast.members.map((member) => {
                    if (groupOf.has(member.id)) return null;
                    if (member.kind === "agent") {
                      return (
                        <AgentTag
                          key={member.id}
                          agent={member.agent}
                          revealed={meant === member.id}
                          highlighted={collaborators.has(member.id)}
                          dimmed={isDimmed(member.id)}
                        />
                      );
                    }
                    return (
                      <PersonTag
                        key={member.id}
                        member={member.member}
                        you={member.you}
                        revealed={meant === member.id}
                        highlighted={false}
                      />
                    );
                  })}
                  {groups.map((group) => {
                    const id = `group:${group.key}`;
                    const agentsIn = group.members.filter((m) => cast.byId.get(m)?.kind === "agent");
                    return (
                      <GroupTag
                        key={id}
                        members={group.members}
                        names={group.members.map((m) => shortName(cast, m))}
                        run={group.run}
                        detail={meant && group.members.includes(meant) ? detailOf(cast, meant) : null}
                        highlighted={group.members.some((m) => m === meant || collaborators.has(m))}
                        dimmed={agentsIn.length > 0 && agentsIn.every(isDimmed)}
                        pill={(pill) => (
                          <SceneTip
                            open={tipId === id}
                            side="top"
                            content={<GroupCard run={group.run} runAgent={group.run ? agentById(group.run.agentId) : null} />}
                          >
                            {React.cloneElement(pill as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
                              onPointerEnter: () => pointerEnter(id),
                              onPointerLeave: () => pointerLeave(),
                            })}
                          </SceneTip>
                        )}
                      />
                    );
                  })}
                </AnimatePresence>
              </div>

              {cast.members.map((member) => {
                const group = groupOf.get(member.id) ?? null;
                const label =
                  member.kind === "agent"
                    ? agentName(member.agent, cast.asksOf(member.id), companyOf(member.id), roomName(member.id))
                    : personName(member.member, member.you, cast.waitingOn(member.id).length, companyOf(member.id), roomName(member.id));
                const run = member.kind === "agent" ? cast.currentRun(member.id, group) : null;
                const card =
                  member.kind === "agent" ? (
                    <AgentCard
                      agent={member.agent}
                      ownerName={memberById(member.agent.ownerId).name}
                      run={run}
                      runAgent={run ? agentById(run.agentId) : null}
                      asks={cast.asksOf(member.id)}
                    />
                  ) : (
                    <PersonCard member={member.member} waiting={cast.waitingOn(member.id).length} />
                  );
                return (
                  <Character
                    key={member.id}
                    id={member.id}
                    label={label}
                    dimmed={isDimmed(member.id)}
                    dragging={snapshot[member.id].dragging}
                    card={card}
                    cardOpen={tipId === member.id}
                    mapRef={mapRef}
                    onActivate={onActivate}
                    onHover={onHover}
                    onFocusVisible={focus}
                    onBlurred={blur}
                    onDragStart={dismiss}
                  />
                );
              })}

            </div>
          </div>
        </SceneProvider>
      ) : null}

      {/* Always mounted, so a screen reader hears them fill. */}
      <p aria-live="polite" className="sr-only">
        {matchCount === null ? "" : matchCount === 0 ? "No agents match" : `${matchCount} of ${agents.length} agents match`}
      </p>
      <p aria-live="polite" className="sr-only">
        {askAgent && askRuns[0] ? `${askAgent.name} needs you: ${askRuns[0].needs ?? askRuns[0].title}, for ${askOwner}` : ""}
      </p>
    </div>
  );
}

/** Level 1 inside a group tag: the meant member's name and role. */
function detailOf(cast: Cast, id: ActorId): { id: ActorId; name: string; role: string } | null {
  const member = cast.byId.get(id);
  if (!member) return null;
  return member.kind === "agent"
    ? { id, name: member.agent.name, role: member.agent.role }
    : { id, name: firstName(member.member.name), role: member.member.role };
}

/**
 * What sits on an agent's head, in slot order (right, then left): its
 * Needs you bubble; its paused or error glyph when its tag has merged into
 * a group; the "…" when it leads the live run its group shares.
 */
function headBubbles(
  id: ActorId,
  state: AgentState,
  cast: Cast,
  group: ProximityGroup | undefined,
): { kind: BubbleKind; slot: "right" | "left" }[] {
  const kinds: BubbleKind[] = [];
  if (cast.asksOf(id).length > 0) kinds.push("ask");
  if (group && (state === "paused" || state === "error")) kinds.push("state");
  if (group?.run && group.lead === id) kinds.push("dots");
  return kinds.slice(0, 2).map((kind, i) => ({ kind, slot: i === 0 ? "right" : "left" }));
}
