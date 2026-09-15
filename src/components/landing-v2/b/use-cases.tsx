"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { A11Y, USE_CASES, type Line, type UseCaseAgent } from "./content";
import { useInViewOnce, usePrefersReducedMotion } from "./motion";
import { AgentDisc, Bubble, TypingDots } from "./thread-parts";
import { Section } from "./section";

// The centrepiece, the reference's anatomy on our primitives: a pill row of
// departments (our Tabs), one large soft panel with the title and subtitle
// top-left and a pill action top-right, a stage with a bottom-anchored
// column of bubbles that push older ones up under a top fade, and a row of
// four agent cards along the bottom where the active one is in full colour
// and the rest are muted. Where the reference has an orb, the centre holds
// a compact thread card: the agent, its role and its schedule.
//
// Each card's conversation plays once, when the stage is in view and that
// card is chosen; choosing a card swaps the stream. Under reduced motion
// every stream is shown finished and no timer runs.

type Frame = { shown: number; typing: boolean; hold: number };

const FIRST_DELAY = 500;
const PERSON_HOLD = 1500;
const TYPING_HOLD = 1000;
const AGENT_HOLD = 2300;

// The frames a conversation passes through: a person's line lands at once;
// the agent types first, then its bubble lands.
function timelineFor(lines: Line[]): Frame[] {
  const frames: Frame[] = [];
  lines.forEach((line, index) => {
    if (line.from === "agent") {
      frames.push({ shown: index, typing: true, hold: TYPING_HOLD });
      frames.push({ shown: index + 1, typing: false, hold: AGENT_HOLD });
    } else {
      frames.push({ shown: index + 1, typing: false, hold: PERSON_HOLD });
    }
  });
  return frames;
}

export function UseCases() {
  const { section, action, departments } = USE_CASES;
  const [department, setDepartment] = useState(departments[0].value);
  const [agentByDepartment, setAgentByDepartment] = useState<
    Record<string, string>
  >({});
  const [played, setPlayed] = useState<ReadonlySet<string>>(() => new Set());
  const [frameIndex, setFrameIndex] = useState(-1);

  const stageRef = useRef<HTMLDivElement>(null);
  const seen = useInViewOnce(stageRef, 0.35);
  const reduced = usePrefersReducedMotion();

  const current =
    departments.find((d) => d.value === department) ?? departments[0];
  const agentValue =
    agentByDepartment[current.value] ?? current.agents[0].value;
  const agent =
    current.agents.find((a) => a.value === agentValue) ?? current.agents[0];
  const streamKey = `${current.value}/${agent.value}`;
  const finished = reduced || played.has(streamKey);

  // `agent` is one of the module's constant objects, so its identity is
  // stable across renders and the timeline is cheap to rebuild from it.
  useEffect(() => {
    if (finished || !seen) return;
    const timeline = timelineFor(agent.lines);
    const last = timeline.length - 1;
    if (frameIndex >= last) return;
    const hold = frameIndex < 0 ? FIRST_DELAY : timeline[frameIndex].hold;
    const timer = setTimeout(() => {
      const next = frameIndex + 1;
      setFrameIndex(next);
      if (next >= last) setPlayed((prev) => new Set(prev).add(streamKey));
    }, hold);
    return () => clearTimeout(timer);
  }, [finished, seen, frameIndex, agent, streamKey]);

  const timeline = timelineFor(agent.lines);
  const frame: Frame = finished
    ? { shown: agent.lines.length, typing: false, hold: 0 }
    : frameIndex < 0
      ? { shown: 0, typing: false, hold: 0 }
      : timeline[Math.min(frameIndex, timeline.length - 1)];

  function selectDepartment(value: string) {
    setDepartment(value);
    setFrameIndex(-1);
  }

  function selectAgent(value: string) {
    setAgentByDepartment((prev) => ({ ...prev, [current.value]: value }));
    setFrameIndex(-1);
  }

  return (
    <Section copy={section}>
      <Tabs
        value={department}
        onValueChange={selectDepartment}
        className="gap-5"
      >
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
          <TabsList
            aria-label={A11Y.departments}
            className="group-data-horizontal/tabs:h-13 sm:group-data-horizontal/tabs:h-9"
          >
            {departments.map((d) => (
              <TabsTrigger key={d.value} value={d.value} className="px-4">
                {d.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent
          value={current.value}
          className="lb-fade overflow-hidden rounded-5xl bg-surface-secondary shadow-edge"
        >
          <div className="flex items-start justify-between gap-4 p-4 sm:p-6">
            <div>
              <p className="text-base font-medium text-foreground">
                {current.title}
              </p>
              <p className="text-sm text-muted-foreground">
                {current.subtitle}
              </p>
            </div>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-11 shrink-0 shadow-xs sm:h-10"
            >
              <Link href={action.href}>{action.label}</Link>
            </Button>
          </div>

          <Tabs
            value={agent.value}
            onValueChange={selectAgent}
            className="gap-0"
          >
            <div ref={stageRef}>
              <TabsContent
                value={agent.value}
                className="relative mx-auto h-96 w-full max-w-2xl px-4 md:h-[26rem]"
              >
                <ThreadCard agent={agent} receded={frame.shown > 0} />
                <div
                  aria-label={A11Y.transcript}
                  className="absolute inset-x-4 bottom-0 flex h-[90%] flex-col justify-end gap-2 overflow-hidden p-1.5"
                >
                  {agent.lines.slice(0, frame.shown).map((line, index) => (
                    <Bubble key={index} from={line.from} animate>
                      {line.text}
                    </Bubble>
                  ))}
                  {frame.typing ? <TypingDots /> : null}
                </div>
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-linear-to-b from-surface-secondary to-transparent"
                />
              </TabsContent>
            </div>
            <TabsList
              variant="line"
              aria-label={A11Y.agents}
              className="grid w-full grid-cols-1 gap-1 px-3 pt-2 pb-4 group-data-horizontal/tabs:h-auto sm:grid-cols-2 sm:px-4 sm:pb-5 lg:grid-cols-4 lg:px-6 lg:pb-6"
            >
              {current.agents.map((a) => {
                const active = a.value === agent.value;
                return (
                  <TabsTrigger
                    key={a.value}
                    value={a.value}
                    className="group/agent h-auto min-h-11 flex-none items-start justify-start gap-3 px-2 py-2 text-left whitespace-normal after:hidden hover:bg-tint-5 group-data-[variant=line]/tabs-list:rounded-2xl group-data-[variant=line]/tabs-list:px-2"
                  >
                    <AgentDisc
                      initial={a.initial}
                      active={active}
                      className={cn(
                        !active &&
                          "group-hover/agent:[&_[data-slot=avatar-fallback]]:bg-tint-15",
                      )}
                    />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span
                        className={cn(
                          "truncate text-sm font-medium transition-[color] duration-(--duration-fast) ease-out-quart",
                          active
                            ? "text-foreground"
                            : "text-muted-foreground group-hover/agent:text-foreground",
                        )}
                      >
                        {a.name}
                      </span>
                      <span
                        className={cn(
                          "text-md font-normal transition-[color] duration-(--duration-fast) ease-out-quart",
                          active
                            ? "text-muted-foreground"
                            : "text-foreground-low",
                        )}
                      >
                        {a.role}
                      </span>
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </TabsContent>
      </Tabs>
    </Section>
  );
}

// The compact thread card at the centre of the stage, in the orb's place:
// the agent's disc, name, role and schedule. It fades out once the
// conversation starts, so the bubbles never read through it.
function ThreadCard({
  agent,
  receded,
}: {
  agent: UseCaseAgent;
  receded: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute top-1/2 left-1/2 flex w-56 -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-3 rounded-3xl bg-background p-5 text-center shadow-card-soft transition-opacity duration-(--duration-slow) ease-out",
        receded && "opacity-0",
      )}
    >
      <AgentDisc initial={agent.initial} size="lg" className="size-14" />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground">{agent.name}</p>
        <p className="text-md text-muted-foreground">{agent.role}</p>
      </div>
      <Badge variant="secondary">{agent.schedule}</Badge>
    </div>
  );
}
