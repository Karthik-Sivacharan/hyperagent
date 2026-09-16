"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

import { AgentPanel } from "@/components/agent-panel/agent-panel";
import { Composer } from "@/components/composer/composer";
import { AgentTurn } from "@/components/signup/agent-turn";
import type { AgentStream } from "@/components/signup/use-agent-stream";
import { ThreadHeader } from "@/components/thread/thread-header";
import { UserMessage } from "@/components/thread/user-message";
import type { AgentScript } from "@/lib/mock/agent-stream";
import { cn } from "@/lib/utils";

import { AgentChips } from "./agent-chips";
import { DemoComputer } from "./computer/demo-computer";
import { A11Y, DEMO_CHROME } from "./content";
import { DEMO_AGENTS, type DemoAgent, type DemoAgentId } from "./demo-agents";
import { DemoSidebar } from "./demo-sidebar";
import motion from "./hero-motion.module.css";
import { useInViewOnce } from "./use-in-view-once";

// The last screen of the signup flow, held still, with one thing left live:
// the list of agents. Choosing one swaps the thread bar, the conversation and
// the agent's computer to that agent's scenario (demo-agents.ts). Every part
// of the picture is the component the flow itself renders, except the
// computer's desktop, a drawn scene per agent (computer/); only the moment
// is fixed.

const SENT_AT = "2:50 PM";
const PANEL_ID = "landing-agent-panel";

function noop() {}

// What use-agent-stream.ts reports once a turn has finished, written out
// instead of played: every row done and the prose out. The demo turns ask
// nothing, so there is no question, answer or reply.
function finished(script: AgentScript): AgentStream {
  return {
    state: "done",
    showReasoning: false,
    rows: script.rows.map((row) => ({ row, status: "done" })),
    proseStarted: true,
    proseActive: false,
    questionShown: false,
    answer: null,
    ack: null,
    activity: "Done",
    onProseDone: noop,
    onAckProseDone: noop,
    respond: noop,
    stop: noop,
  };
}

// Everything inside the picture is still: no entrance inside the components
// replays when a scenario mounts. The window's own entrance is the one thing
// that moves, and it is written in hero-motion.module.css, outside Tailwind's
// layers, so this stays true of the components' animations alone.
const STILL = "select-none **:animate-none";

// The prose lands after the last tool row; only the conversation knows how
// many rows the turn has, so it hands the step count to the stylesheet.
function proseStep(rows: number): CSSProperties {
  return { "--hero-prose-step": rows + 1 } as CSSProperties;
}

// The screen is laid out at the size the flow was measured at and scaled as
// one picture to the frame's width, so nothing inside reflows. The scale is
// read from the frame's box (a measurement, not a timer); until the first
// read the stage stays hidden rather than flashing at full size. Pointer
// hit-testing follows the transform, so a click lands where it looks.
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

// The conversation from its first message; what does not fit fades out above
// the follow-up box instead of stopping on a hard edge.
function Conversation({ agent }: { agent: DemoAgent }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 pt-6 [mask-image:linear-gradient(to_bottom,black_calc(100%-3rem),transparent)]">
      <div
        className={cn("mx-auto w-full max-w-[752px] space-y-2", motion.chat)}
        style={proseStep(agent.script.rows.length)}
      >
        <UserMessage
          id={`landing-brief-${agent.id}`}
          text={agent.brief}
          tone="neutral"
          sentAtLabel={SENT_AT}
        />
        <AgentTurn
          script={agent.script}
          stream={finished(agent.script)}
          sentAtLabel={SENT_AT}
          onAnswer={noop}
          settled
        />
      </div>
    </div>
  );
}

// The follow-up box. The model pill is given a neutral name so no model's
// product name shows through the composer's default.
function FollowUp() {
  return (
    <div className="shrink-0 px-5 pt-6 pb-4">
      <div className="mx-auto w-full max-w-[752px]">
        <Composer
          showAgentPicker={false}
          showIntegrationsFooter={false}
          placeholder={DEMO_CHROME.followUp}
          model={DEMO_CHROME.model}
        />
      </div>
    </div>
  );
}

function ThreadColumn({ agent }: { agent: DemoAgent }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <ThreadHeader
        thread={agent.thread}
        panelOpen
        onTogglePanel={noop}
        panelId={PANEL_ID}
      />
      <Conversation agent={agent} />
      <FollowUp />
    </div>
  );
}

// Two stills of the same moment. From md the whole app at 1456×868, as the
// flow was measured, with the agent list in its sidebar. Below md that
// picture would scale to a quarter of its size, so a phone gets the thread
// column alone at 512px (about 70%), and chips above the window choose the
// agent. The chips stay up to lg, where the sidebar is still small to touch.
export function HeroWindow() {
  const [selectedId, setSelectedId] = useState<DemoAgentId>(DEMO_AGENTS[0].id);
  // The agent the computer's wallpaper is coming from, so the new one has
  // something to fade over instead of the empty panel.
  const [previousId, setPreviousId] = useState<DemoAgentId | null>(null);
  const agent =
    DEMO_AGENTS.find((candidate) => candidate.id === selectedId) ??
    DEMO_AGENTS[0];

  // The window is near the top of the page, so this is all but a mount, and
  // it latches: the entrance plays once, for the reader who arrives at it.
  //
  // Once per VISIT, not once per load. The key is the whole of that — the hook
  // records it in `sessionStorage` on the frame the entrance starts, and a
  // reader who comes back to the page inside the same visit gets the window
  // finished instead of drawing itself at them again.
  const frameRef = useRef<HTMLElement>(null);
  const intro = useInViewOnce(frameRef, undefined, "hero-intro-seen");

  // The entrance does double duty: it is the picture arriving, and it is also
  // what every agent switch rides in on, because switching re-keys the content
  // and a fresh element starts at the first frame again. So "skip" has to mean
  // "skip the INTRO", not "no animation in this window" — an agent switch is
  // something the reader asked for, and that is the kind of motion a page
  // should keep. The first switch turns the animation back on and it stays on.
  const [switched, setSwitched] = useState(false);
  const motionState = switched ? "play" : intro;

  const select = (id: DemoAgentId) => {
    if (id === selectedId) return;
    setSwitched(true);
    setPreviousId(selectedId);
    setSelectedId(id);
  };

  return (
    <div className="flex flex-col gap-3">
      <AgentChips
        agents={DEMO_AGENTS}
        selectedId={selectedId}
        onSelect={select}
        className="lg:hidden"
      />

      <section
        ref={frameRef}
        aria-label={A11Y.window}
        data-hero-motion={motionState}
        className={cn(
          "w-full overflow-hidden rounded-3xl bg-background shadow-xl ring-1 ring-border-subtle",
          motion.frame,
        )}
      >
        <p className="sr-only" aria-live="polite">
          {agent.threadTitle}
        </p>

        <Stage width={1456} height={868} className="hidden md:block">
          <div className="flex size-full bg-glass-gradient">
            <DemoSidebar
              agents={DEMO_AGENTS}
              selectedId={selectedId}
              onSelect={select}
            />
            <div
              key={agent.id}
              inert
              aria-hidden="true"
              className={cn("flex min-w-0 flex-1", STILL)}
            >
              <ThreadColumn agent={agent} />
              <AgentPanel
                id={PANEL_ID}
                learning
                computer={
                  <DemoComputer
                    agentId={agent.id}
                    previousAgentId={previousId}
                  />
                }
              />
            </div>
          </div>
        </Stage>

        <Stage width={512} height={760} className="md:hidden">
          <div
            key={agent.id}
            inert
            aria-hidden="true"
            className={cn("flex size-full bg-glass-gradient", STILL)}
          >
            <ThreadColumn agent={agent} />
          </div>
        </Stage>
      </section>
    </div>
  );
}
