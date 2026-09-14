"use client";

import Link from "next/link";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import {
  A11Y,
  USE_CASES,
  type Agent,
  type Bubble,
  type Department,
} from "./content";
import { LandingSection } from "./section";
import {
  BrowserFrame,
  ReceiptLine,
  RequestBubble,
  StepRow,
} from "./thread-replica";

// Panels that share one grid cell cross-fade: the leaving one drops to
// opacity 0 and turns invisible at the end of the transition, the arriving
// one turns visible at the start of its. Every panel stays mounted, so the
// cell keeps the tallest panel's height and the row under it never moves.
// The active panel is a tab stop, so it gets the page's focus outline back.
const CROSSFADE =
  "col-start-1 row-start-1 transition-[opacity,visibility] duration-(--duration-slow) ease-out data-[state=inactive]:pointer-events-none data-[state=inactive]:invisible data-[state=inactive]:opacity-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-solid focus-visible:outline-ring";

// One message in the stage around the run: a person's ask on the left in a
// tint bubble, the agent's answer on the right on the card surface.
function ChatBubble({ bubble }: { bubble: Bubble }) {
  const you = bubble.from === "you";
  return (
    <div
      className={cn(
        "flex max-w-xs flex-col gap-1",
        you
          ? "self-start lg:justify-self-end"
          : "self-end lg:justify-self-start",
      )}
    >
      <p className={cn("text-xs text-foreground-low", !you && "text-right")}>
        {USE_CASES.bubbleSender[bubble.from]}
      </p>
      <p
        className={cn(
          "px-4 py-3 text-sm text-foreground",
          you
            ? "rounded-2xl rounded-tr-sm bg-tint-10"
            : "rounded-2xl rounded-tl-sm bg-background shadow-card",
        )}
      >
        {bubble.text}
      </p>
    </div>
  );
}

// The selected agent's run, cropped: request, three steps, receipt.
function MiniRun({ agent }: { agent: Agent }) {
  const { run } = agent;
  return (
    <BrowserFrame
      url={run.job}
      label={A11Y.browser}
      bodyClassName="flex flex-col gap-3 p-4"
    >
      <RequestBubble who={USE_CASES.bubbleSender.you} text={run.request} />
      <ol role="list" className="flex flex-col">
        {run.steps.map((step) => (
          <StepRow key={step.text} step={step} />
        ))}
      </ol>
      <ReceiptLine
        receipt={run.receipt}
        scoreLabel={USE_CASES.runLabels.score}
        className="border-t border-border-subtle pt-3"
      />
    </BrowserFrame>
  );
}

// One department: the elevenlabs.io panel anatomy. Title and one line at the
// top left, the pill action top right, the stage in the middle (a person's
// ask, the run, the agent's answer), and the four agents along the bottom as
// a second row of tabs: a round avatar, the name, one line; the active one
// in the first tier, the others in the second. Picking an agent cross-fades
// the run.
function DepartmentPanel({ department }: { department: Department }) {
  return (
    <Tabs defaultValue={department.agents[0].name} className="gap-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <p className="text-base font-medium text-foreground">
            {department.title}
          </p>
          <p className="text-sm text-muted-foreground">{department.sub}</p>
        </div>
        <Button asChild variant="outline" size="sm" className="h-11 md:h-8">
          <Link href={USE_CASES.action.href}>{USE_CASES.action.label}</Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,8fr)_minmax(0,5fr)] lg:items-center lg:gap-8">
        <div className="contents lg:block">
          <ChatBubble bubble={department.bubbles[0]} />
        </div>
        <div className="order-first grid lg:order-none">
          {department.agents.map((agent) => (
            <TabsContent
              key={agent.name}
              value={agent.name}
              forceMount
              className={cn(CROSSFADE, "rounded-xl")}
            >
              <MiniRun agent={agent} />
            </TabsContent>
          ))}
        </div>
        <div className="contents lg:block">
          <ChatBubble bubble={department.bubbles[1]} />
        </div>
      </div>

      <TabsList
        variant="line"
        aria-label={A11Y.agents}
        className="mt-8 grid h-auto! w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
      >
        {department.agents.map((agent) => (
          <TabsTrigger
            key={agent.name}
            value={agent.name}
            className="group/agent h-auto min-h-11 flex-none items-center justify-start gap-3 rounded-2xl px-3 py-2 text-left whitespace-normal after:hidden hover:bg-tint-7 data-active:bg-background data-active:shadow-card"
          >
            <Avatar
              size="lg"
              className="transition-[background-color] duration-(--duration-normal) ease-out"
            >
              <AvatarFallback className="bg-tint-10 text-muted-foreground group-data-active/agent:bg-primary group-data-active/agent:text-primary-foreground">
                {agent.initials}
              </AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-col">
              <span className="truncate">{agent.name}</span>
              <span className="text-md font-normal text-muted-foreground">
                {agent.role}
              </span>
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

// The use-case section: a heading, the department pills, one large soft
// panel one step above the page on the sand ladder. Switching a department
// cross-fades the whole panel.
export function UseCases() {
  const { id, heading, departments } = USE_CASES;
  return (
    <LandingSection id={id} heading={heading}>
      <Tabs defaultValue={departments[0].value} className="gap-5">
        <div className="-mx-4 overflow-x-auto px-4 pb-1 scrollbar-hide sm:-mx-6 sm:px-6">
          <TabsList
            aria-label={A11Y.departments}
            className="max-md:h-11! max-md:p-0"
          >
            {departments.map((department) => (
              <TabsTrigger
                key={department.value}
                value={department.value}
                className="px-4"
              >
                {department.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
        <div className="grid">
          {departments.map((department) => (
            <TabsContent
              key={department.value}
              value={department.value}
              forceMount
              className={cn(
                CROSSFADE,
                "rounded-5xl bg-surface-raised p-5 sm:p-8",
              )}
            >
              <DepartmentPanel department={department} />
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </LandingSection>
  );
}
