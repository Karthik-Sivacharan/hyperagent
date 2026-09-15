"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { AgentPanel } from "@/components/agent-panel/agent-panel";
import { Sidebar } from "@/components/app/sidebar";
import { Composer } from "@/components/composer/composer";
import { AgentTurn } from "@/components/signup/agent-turn";
import { HANDOFF_THREAD } from "@/components/signup/app-handoff";
import type { AgentStream } from "@/components/signup/use-agent-stream";
import { ThreadHeader } from "@/components/thread/thread-header";
import { UserMessage } from "@/components/thread/user-message";
import { Workspace } from "@/components/workspace/workspace";
import {
  ackFor,
  agentScriptFor,
  type SkillsAnswer,
} from "@/lib/mock/agent-stream";
import { SUGGESTED_AGENTS } from "@/lib/mock/suggested-agents";
import { PRESELECTED_SKILL_IDS } from "@/lib/mock/suggested-skills";
import {
  SIGNUP_WORKSPACE_ACTIVE_ID,
  SIGNUP_WORKSPACE_ARTIFACTS,
} from "@/lib/mock/workspace";
import { cn } from "@/lib/utils";

import { A11Y } from "./content";

// The last screen of the signup flow, held still: the app's sidebar, the
// thread the flow became, and the agent's computer open beside it. Every
// part is the component the flow itself renders (app-handoff.tsx and
// chat-step.tsx compose the same ones); only the moment is fixed. The first
// suggested agent is the one whose document the signup computer opens, the
// skills answer is the card's own preselection, and the turn is drawn done.

const AGENT = SUGGESTED_AGENTS[0];
const SCRIPT = agentScriptFor(AGENT.id, AGENT.prompt);
const ANSWER: SkillsAnswer = {
  kind: "install",
  ids: [...PRESELECTED_SKILL_IDS],
};
const ACK = ackFor(ANSWER, SCRIPT.agentName);
const SENT_AT = "2:50 PM";
const PANEL_ID = "landing-agent-panel";

function noop() {}

// What use-agent-stream.ts reports once the turn has finished, written out
// instead of played: every row done, both proses out, the question answered.
const FINISHED: AgentStream = {
  state: "done",
  showReasoning: false,
  rows: SCRIPT.rows.map((row) => ({ row, status: "done" })),
  proseStarted: true,
  proseActive: false,
  questionShown: true,
  answer: ANSWER,
  ack: {
    reply: ACK,
    row: ACK.row ? { row: ACK.row, status: "done" } : null,
    proseStarted: true,
    proseActive: false,
  },
  activity: "Done",
  onProseDone: noop,
  onAckProseDone: noop,
  respond: noop,
  stop: noop,
};

// The screen is laid out at the size the flow was measured at and scaled as
// one picture to the frame's width, so nothing inside reflows. The scale is
// read from the frame's box (a measurement, not a timer); until the first
// read the stage stays hidden rather than flashing at full size.
function Stage({
  width,
  height,
  className,
  children,
}: {
  width: number;
  height: number;
  className?: string;
  children: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const fit = () => setScale(frame.clientWidth / width);
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div
      ref={frameRef}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <div
        className={cn(
          "absolute top-0 left-0 origin-top-left",
          scale === null && "invisible",
        )}
        style={{ width, height, transform: `scale(${scale ?? 1})` }}
      >
        {children}
      </div>
    </div>
  );
}

// The conversation from its first message: the brief, the rows the agent
// ran, what it said and the question it asked. What does not fit fades out
// above the follow-up box instead of stopping on a hard edge.
function Conversation() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pt-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-3rem),transparent)]">
      <div className="mx-auto w-full max-w-[752px] space-y-2">
        <UserMessage
          id="landing-brief"
          text={AGENT.prompt}
          sentAtLabel={SENT_AT}
        />
        <AgentTurn
          script={SCRIPT}
          stream={FINISHED}
          sentAtLabel={SENT_AT}
          onAnswer={noop}
          settled
        />
      </div>
    </div>
  );
}

function FollowUp() {
  return (
    <div className="shrink-0 px-5 pt-6 pb-4">
      <div className="mx-auto w-full max-w-[752px]">
        <Composer
          showAgentPicker={false}
          showIntegrationsFooter={false}
          placeholder="Add a follow-up…"
        />
      </div>
    </div>
  );
}

// Two stills of the same moment. From md the whole app at 1456×868, as the
// flow was measured. Below md that picture would scale to a quarter of its
// size, so a phone gets the thread column alone at the 512px the flow holds
// it to beside a docked panel, which scales to about 70%.
//
// Inert and hidden from assistive tech: it is a picture of the product, and
// none of the controls inside it are controls on this page.
export function HeroWindow() {
  return (
    <div
      role="img"
      aria-label={A11Y.window}
      className="w-full overflow-hidden rounded-3xl bg-background shadow-xl ring-1 ring-border-subtle"
    >
      <div inert aria-hidden="true" className="select-none **:animate-none">
        <Stage width={1456} height={868} className="hidden md:block">
          <div className="flex size-full bg-glass-gradient">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <ThreadHeader
                thread={HANDOFF_THREAD}
                panelOpen
                onTogglePanel={noop}
                panelId={PANEL_ID}
              />
              <Conversation />
              <FollowUp />
            </div>
            <AgentPanel
              id={PANEL_ID}
              learning
              computer={
                <Workspace
                  artifacts={SIGNUP_WORKSPACE_ARTIFACTS}
                  activeId={SIGNUP_WORKSPACE_ACTIVE_ID}
                />
              }
            />
          </div>
        </Stage>

        <Stage width={512} height={760} className="md:hidden">
          <div className="flex size-full flex-col bg-glass-gradient">
            <ThreadHeader thread={HANDOFF_THREAD} />
            <Conversation />
            <FollowUp />
          </div>
        </Stage>
      </div>
    </div>
  );
}
