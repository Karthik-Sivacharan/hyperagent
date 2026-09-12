"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { IconCheck } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PanelEmpty, PanelField, PanelSection } from "@/components/agent-panel/panel-section";
import {
  ConnectorRows,
  KnowledgeRows,
  SkillRows,
  SubagentRows,
  TriggerRows,
} from "@/components/agent-panel/resource-rows";
import { LearningTab } from "@/components/agent-panel/learning-tab";
import { EFFORTS, MODELS, type Effort } from "@/components/composer/thread-settings-menu";
import { AGENT_CONFIG, PANEL_SECTIONS, type SectionMeta } from "@/lib/mock/agent-config";
import { cn } from "@/lib/utils";

// The agent's configuration, open. src/lib/mock/agent-config.ts records why it
// is open: the same model and the same tool list are already reachable from the
// composer's settings pill and its "+" menu, so a panel that arrives collapsed
// loses to the menus every time and the config quietly forks in two. Everything
// here is visible on arrival, flat, and in one column.
//
// WIDTH: 448px, and the number moved twice on 2026-09-10 for two different
// reasons. It was 560; measuring the reference took it to 480; then the reader
// asked for a little less again and measuring the PANEL took it to 448. The
// second move was only possible because the panel had a content floor at 471px
// it could not get under (see the ScrollArea note below) — so "a bit narrower"
// was not a taste call to make, it was a bug to find. Below is the 480
// reasoning, which still holds; 448 is that argument with the floor removed.
//
// 448 is 28rem, it clears the 440 drag minimum by half a step, and against the
// reference's 477 it is one notch tighter, which is what was asked for. The
// instructions field lands at about 57 characters of the 14px face. That is
// under the 65-75 prose band and deliberately so: the band is for reading long
// prose, and this field is a setting you write once and skim after. Drag it
// wider (to 720, or double-click for this resting width) when you are actually
// composing in it — that is what the splitter is for, and it is why the resting
// width sits at the bottom of its range rather than the middle.
//
// ---- the 480 reasoning, kept because it is the load-bearing part ----
//
// Corrected 2026-09-10 from 560 after measuring the reference
// rather than trusting a remembered figure. This comment used to say the
// reference was ~550; its panel is **477px at a 1456px viewport**, read off a
// live agent page. It is not even a fixed width there — it is a split pane at
// `flex: 33.898 1 0px`, so it is 33.9% of the content area and grows with the
// window. 560 was therefore not "between the two references", it was 80px wider
// than the one it named.
//
// 480 is kept as a FIXED number rather than copied as a percentage, because
// this panel's width is already clamped from both sides by a live fit test
// (use-shell-fit.ts) and a proportional default would be a second opinion about
// the same pixels; and because the drag range below is in px, so a percentage
// default would drift out of the middle of its own range on a wide monitor.
//
// What it has to hold: 480 less the 2x20px gutters is 440px of content, which
// is about 61 characters of the 14px body face in the instructions field — the
// only control in the panel that is really prose. That is just under the 65-75
// character band, and it is where the reference sits too: the measured
// instructions box is 407px inner at 14px, which is 63 characters. A
// number the live product reads comfortably at beats a band this panel was
// never actually failing.
//
// What it gives back is the conversation. At the 1456px the screenshot gate
// uses, 1456 less the 256px sidebar less this panel leaves 752px of thread at
// 448 (720 at 480) against 640 at the old 560 — the column's own full measure,
// rather than 112px short of it.
//
// Wider and the panel wins an argument it should not be having with the thread.
export const AGENT_PANEL_WIDTH = 448;

// The drag range. 720 is where the instructions field passes 90 characters and
// prose starts to fray.
//
// 440 is a CHOSEN floor, not a measured one, and the distinction is worth
// keeping straight because it used to be stated as measured: the comment here
// said "where the longest header row runs out of gap". Sweeping the real panel
// after the ScrollArea fix above, no header row collides at any width down to
// 360 — the rows are `justify-between` over a `min-w-0` title, so they go on
// truncating rather than touching. The thing that actually broke below 471 was
// the textarea, and that is fixed. So 440 is now a judgement (below it the
// panel stops being a column and starts being a strip) rather than a
// measurement, and it is left where it is deliberately: use-shell-fit.ts reads
// it to decide when the panel may dock at all, so moving it moves the
// responsive behaviour of the whole shell, which is not what "make the panel a
// bit narrower" asked for.
//
// The minimum is exported because it is half of the question "is there room for
// both this and a readable conversation" that use-shell-fit.ts asks on every
// resize. Two files agreeing on 440 by typing it twice is the sort of pair that
// drifts the first time one of them is retuned.
export const AGENT_PANEL_MIN_WIDTH = 440;
const PANEL_MAX_WIDTH = 720;

// The resting width when the panel carries the computer (the `computer` prop).
// 684 is the workspace's own measure: the carousel's 48px lead-in, the 600px
// document card and the 36px trailing pad (workspace.tsx `pl-12` / `pr-9`,
// artifact-card.tsx's 600px card), which is exactly how wide the live site's
// desktop is at 1456. One width for all three tabs: a width that changed on a
// tab switch would snap while <main>'s padding eases over --duration-slide,
// and the conversation would ghost under the panel for the length of it.
export const COMPUTER_PANEL_WIDTH = 684;
/** One arrow key of resize, and one shift-arrow. */
const RESIZE_STEP = 16;
const RESIZE_STEP_LARGE = 64;

// Autonomy & safety. The section's own one-liner in the mock is "Ask before
// anything that leaves the building", and these four are that sentence taken
// apart: what it may change, who it may talk to, how far it may wander, and
// when it should give up. They share a polarity on purpose — ON is always the
// more cautious answer — because a list of switches where some mean "safer" and
// some mean "looser" cannot be read at a glance, only one row at a time. Three
// arrive on and one off, which is also the honest default for an agent whose
// whole job is to go and look things up.
const AUTONOMY_RULES = [
  {
    id: "confirm-writes",
    label: "Confirm before it writes",
    hint: "Anything that changes a connected tool waits for a yes.",
    on: true,
  },
  {
    id: "confirm-messages",
    label: "Confirm before it messages a person",
    hint: "Email, Slack and comments that leave this thread.",
    on: true,
  },
  {
    id: "stay-in-sources",
    label: "Stay inside its sources",
    hint: "No browsing past the connectors and knowledge above.",
    on: false,
  },
  {
    id: "stop-on-repeat-failure",
    label: "Stop after a repeated failure",
    hint: "Three failed steps in a row end the run instead of retrying through it.",
    on: true,
  },
] as const;

/** Everything the Save button is responsible for. */
type Draft = {
  model: string;
  effort: Effort;
  instructions: string;
  selfUpdates: boolean;
  autonomy: Record<string, boolean>;
};

const INITIAL_DRAFT: Draft = {
  model: AGENT_CONFIG.model,
  effort: AGENT_CONFIG.reasoningEffort,
  instructions: AGENT_CONFIG.instructions,
  selfUpdates: AGENT_CONFIG.selfUpdates,
  autonomy: Object.fromEntries(AUTONOMY_RULES.map((rule) => [rule.id, rule.on] as const)),
};

function sameDraft(a: Draft, b: Draft) {
  return (
    a.model === b.model &&
    a.effort === b.effort &&
    a.instructions === b.instructions &&
    a.selfUpdates === b.selfUpdates &&
    AUTONOMY_RULES.every((rule) => a.autonomy[rule.id] === b.autonomy[rule.id])
  );
}

/**
 * The drag range, optionally squeezed from above by whatever room the shell has
 * left. The floor always wins over the ceiling: a panel narrower than 440 is a
 * panel whose own header rows collide, which helps nobody.
 */
const clampWidth = (px: number, ceiling = PANEL_MAX_WIDTH) =>
  Math.max(AGENT_PANEL_MIN_WIDTH, Math.min(Math.min(PANEL_MAX_WIDTH, ceiling), px));

export function AgentPanel({
  id,
  className,
  maxWidth,
  onWidthChange,
  computer,
  learning = false,
}: {
  /**
   * Adds a Learning tab between Configuration and Usage: what the agent may
   * learn from its runs and what it has learned (learning-tab.tsx). Opt-in
   * like `computer`, so /design/agent-panel keeps its two tabs.
   */
  learning?: boolean;
  /**
   * The agent's computer: when given, it becomes a first "Computer" tab, the
   * default one, ahead of Configuration and Usage, and the panel rests at
   * `COMPUTER_PANEL_WIDTH` so the workspace fits. Opt-in: omit it and the panel
   * is exactly the two-tab configuration panel it always was, which is what
   * /design/agent-panel renders.
   */
  computer?: ReactNode;
  /**
   * Put on the `<aside>` so a toggle elsewhere in the shell can point at it
   * with `aria-controls`. Optional, because a panel nobody toggles needs no
   * name — the /design route passes nothing and renders what it always did.
   */
  id?: string;
  className?: string;
  /**
   * The widest this panel may be right now.
   *
   * A CONSTRAINT, NOT A WIDTH, and the difference is the whole reason this is
   * shaped the way it is. The shell knows how much room there is; it does not
   * know how much of it this panel wants. So what comes down is a ceiling, and
   * the panel goes on owning its preference underneath it: drag it wide at
   * 1920, narrow the window until the ceiling squeezes it, widen the window
   * again and it returns to the width you dragged it to. A width coming down
   * instead would have overwritten that preference the first time the window
   * moved, and the reader would have to re-drag it every time.
   *
   * `AGENT_PANEL_MIN_WIDTH` / `PANEL_MAX_WIDTH` stay the outer bounds either way.
   */
  maxWidth?: number;
  /**
   * Reports the panel's live width, including the resting one on mount.
   *
   * The panel owns its width — nothing outside it should be able to set it —
   * but the column it sits beside has to know, or dragging the splitter opens
   * a gap between the two. So the width goes UP as a fact rather than down as
   * a prop, which is the same direction Composer's `onValueChange` reports in
   * and leaves every other caller (the /design route) free to ignore it.
   */
  onWidthChange?: (width: number) => void;
}) {
  const [saved, setSaved] = useState<Draft>(INITIAL_DRAFT);
  const [draft, setDraft] = useState<Draft>(INITIAL_DRAFT);
  const dirty = !sameDraft(draft, saved);

  const modelId = useId();
  const effortId = useId();
  const instructionsId = useId();
  const selfUpdatesId = useId();
  const autonomyId = useId();

  // Drag-to-resize, mirrored from app/sidebar.tsx and inverted: the panel is on
  // the right, so dragging the handle LEFT makes it wider. It earns its keep
  // here more than it does on the sidebar, because the one control in the panel
  // whose usefulness scales with width is the instructions field, and a person
  // rewriting a system prompt is exactly the person who wants the column wider
  // for a minute. Unlike the sidebar's handle this one is focusable and takes
  // the arrow keys: it is a window splitter, and a splitter only reachable with
  // a pointer is a setting some people cannot change.
  //
  // Two numbers, not one: `preferred` is the width this panel has been asked
  // for (its resting 480, or wherever the last drag left it) and `width` is
  // what it can actually have once `maxWidth` has had its say. Keeping them
  // apart is what makes the constraint reversible — see the prop's note.
  // The resting width is the computer's when there is one; the double-click
  // reset returns to whichever this panel rests at.
  const restingWidth = computer ? COMPUTER_PANEL_WIDTH : AGENT_PANEL_WIDTH;
  const [preferred, setPreferred] = useState(restingWidth);
  const ceiling = Math.min(PANEL_MAX_WIDTH, maxWidth ?? PANEL_MAX_WIDTH);
  const width = clampWidth(preferred, ceiling);
  const drag = useRef({ startX: 0, startWidth: restingWidth });

  // Controlled, so the header can tell which tab is showing: Save saves the
  // configuration and only belongs beside it.
  const [tab, setTab] = useState(computer ? "computer" : "configuration");
  const showSave = !computer || tab === "configuration";
  // With the computer, every tab stays mounted and the inactive ones are only
  // hidden. Radix unmounts an inactive tab, which would throw away the
  // carousel's scroll position and the Skills list's local state on every
  // switch. Without it, nothing changes.
  const forceMount = computer ? (true as const) : undefined;
  const hideInactive = computer && "data-[state=inactive]:hidden";

  useEffect(() => {
    onWidthChange?.(width);
  }, [width, onWidthChange]);

  const onResizeStart = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const handle = e.currentTarget;
    try {
      handle.setPointerCapture(e.pointerId);
    } catch {
      // Not every pointer can be captured; the drag still works while the
      // pointer stays over the handle.
    }
    drag.current = { startX: e.clientX, startWidth: width };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    // Clamped by the outer bounds only, never by the live ceiling: a drag made
    // while the shell is squeezed should still be remembered at full size.
    const move = (ev: PointerEvent) =>
      setPreferred(clampWidth(drag.current.startWidth - (ev.clientX - drag.current.startX)));
    const stop = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", stop);
      handle.removeEventListener("lostpointercapture", stop);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("lostpointercapture", stop, { once: true });
  };

  const onResizeKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? RESIZE_STEP_LARGE : RESIZE_STEP;
    // Left widens, because the panel grows leftward into the thread.
    if (e.key === "ArrowLeft") setPreferred((w) => clampWidth(w + step));
    else if (e.key === "ArrowRight") setPreferred((w) => clampWidth(w - step));
    else if (e.key === "Home") setPreferred(PANEL_MAX_WIDTH);
    else if (e.key === "End") setPreferred(AGENT_PANEL_MIN_WIDTH);
    else return;
    e.preventDefault();
  };

  const currentEffort = EFFORTS.find((e) => e.label === draft.effort);

  // Settings fields sit 16px apart in a flex column: a label, its hint and its
  // control are one unit (2px inside), and two units need more air than two
  // list rows (8px), which are smaller things. Gaps rather than a padded field
  // and a negative margin to cancel it at the ends.
  const modelBody = (
    <div className="flex flex-col gap-4">
      <PanelField label="Model" htmlFor={modelId} hint={AGENT_CONFIG.modelNote}>
        <Select value={draft.model} onValueChange={(model) => setDraft((d) => ({ ...d, model }))}>
          <SelectTrigger id={modelId} size="sm" className="max-w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end" className="w-64">
            {MODELS.map((model) => {
              const Logo = model.logo;
              return (
                <SelectItem key={model.name} value={model.name}>
                  <span className="flex min-w-0 items-center gap-2">
                    <Logo className="size-4 shrink-0" />
                    <span className="truncate">{model.name}</span>
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {/* The tag the composer's model row already shows, with the sentence it
            already shows on hover. Same setting, same explanation, promoted. */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant="secondary">{AGENT_CONFIG.modelTag}</Badge>
          </TooltipTrigger>
          <TooltipContent>Always uses the latest model in this family.</TooltipContent>
        </Tooltip>
      </PanelField>

      {/* The hint is the chosen effort's own description rather than a fixed
          line, so the row explains the setting it is currently in. */}
      <PanelField label="Reasoning effort" htmlFor={effortId} hint={currentEffort?.description}>
        <Select
          value={draft.effort}
          onValueChange={(effort) => setDraft((d) => ({ ...d, effort: effort as Effort }))}
        >
          <SelectTrigger id={effortId} size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            {EFFORTS.map((effort) => (
              <SelectItem key={effort.label} value={effort.label}>
                {effort.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PanelField>

      <div>
        <Label htmlFor={instructionsId} className="cursor-pointer text-sm font-medium text-foreground">
          Instructions
        </Label>
        <p className="mt-0.5 mb-2 text-xs text-foreground-low">
          What this agent is for, in your words. The chat writes here too.
        </p>
        {/* The field grows with its content (the primitive's `field-sizing`)
            and stops at 16rem, past which it scrolls: an instruction long
            enough to fill the panel should not be able to push Autonomy &
            safety off the bottom of it. */}
        <Textarea
          id={instructionsId}
          value={draft.instructions}
          onChange={(e) => setDraft((d) => ({ ...d, instructions: e.target.value }))}
          className="max-h-64 min-h-28 text-sm"
        />
      </div>

      <PanelField
        label="Self-updates"
        htmlFor={selfUpdatesId}
        hint="The agent may rewrite these instructions after a run, and tells you what changed."
      >
        <Switch
          id={selfUpdatesId}
          checked={draft.selfUpdates}
          onCheckedChange={(selfUpdates) => setDraft((d) => ({ ...d, selfUpdates }))}
        />
      </PanelField>
    </div>
  );

  const autonomyBody = (
    <div className="flex flex-col gap-4">
      {AUTONOMY_RULES.map((rule) => (
        <PanelField key={rule.id} label={rule.label} htmlFor={`${autonomyId}-${rule.id}`} hint={rule.hint}>
          <Switch
            id={`${autonomyId}-${rule.id}`}
            checked={draft.autonomy[rule.id]}
            onCheckedChange={(on) =>
              setDraft((d) => ({ ...d, autonomy: { ...d.autonomy, [rule.id]: on } }))
            }
          />
        </PanelField>
      ))}
    </div>
  );

  const sectionBody = (meta: SectionMeta) => {
    switch (meta.id) {
      case "model":
        return modelBody;
      case "autonomy":
        return autonomyBody;
      // The five resource sections come from resource-rows.tsx, which owns one
      // row shape for all of them. Each returns null when its list is empty, so
      // the empty state below is still what an unconfigured section renders —
      // and at signup, Knowledge sources genuinely is empty, which is the point
      // rather than a gap to fill.
      // The five resource sections come from resource-rows.tsx, which owns one
      // row shape for all of them. Each is handed its section's empty line and
      // decides for itself whether to show it: Skills keeps its installed set
      // in local state, so only that component can know whether removing the
      // last row emptied the section. Deciding it here from the mock's three
      // ids would paint a gap the moment a reader removed them.
      case "skills":
        return <SkillRows empty={meta.empty} />;
      case "connectors":
        return <ConnectorRows empty={meta.empty} />;
      case "knowledge":
        return <KnowledgeRows empty={meta.empty} />;
      case "subagents":
        return <SubagentRows empty={meta.empty} />;
      case "triggers":
        return <TriggerRows empty={meta.empty} />;
      default:
        return <PanelEmpty>{meta.empty}</PanelEmpty>;
    }
  };

  return (
    <aside
      id={id}
      aria-label={computer ? "Agent" : "Agent configuration"}
      // `bg-sidebar` on purpose: this is the mirror of the left column, and two
      // pieces of chrome around one canvas should be one material. In dark, the
      // app's default, that material is the canvas colour and the hairline is
      // the whole separation, which is exactly how the sidebar reads. The edge
      // is the brand's `border-border-subtle` rather than the sidebar's louder
      // phase-1 `sidebar-border`, because nothing here is a clone of a live
      // column and new UI takes the brand hairline.
      className={cn(
        "relative flex h-full max-w-full shrink-0 flex-col border-l border-border-subtle bg-sidebar",
        className,
      )}
      style={{ width }}
    >
      {/* Tabs own the whole column: the list belongs in the fixed header and
          the content is the thing that scrolls, so the root has to wrap both. */}
      <Tabs value={tab} onValueChange={setTab} className="flex h-full min-h-0 flex-col gap-0">
        {/* With the computer the header is the tab row alone, built like the
            thread bar beside it (thread-header.tsx): a 48px row over a 1px
            hairline, so the two tops line up and share one divider. The
            agent's name is already the thread bar's subject; repeating it here
            cost ~70px of the computer's height. */}
        <header
          className={cn("shrink-0 border-b border-border-subtle px-5", !computer && "pt-4 pb-3")}
        >
          {!computer && (
            <>
              <h2 className="truncate text-heading-lg text-foreground">{AGENT_CONFIG.name}</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">{AGENT_CONFIG.blurb}</p>
            </>
          )}

          <div className={cn("flex items-center justify-between gap-3", computer ? "h-12" : "mt-3")}>
            {/* Two tabs, and the two words are hyperagent's own. Its panel has
                four — Configuration, Learning, Library, Usage — but Learning
                and Library are already destinations in the left nav, so two of
                its four tabs are second copies of pages, which is the same
                duplication this panel exists to end. What is left is the
                configuration, which is everything below, and what it cost. */}
            <TabsList>
              {computer && <TabsTrigger value="computer">Computer</TabsTrigger>}
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              {learning && <TabsTrigger value="learning">Learning</TabsTrigger>}
              <TabsTrigger value="usage">Usage</TabsTrigger>
            </TabsList>

            {/* The panel's only accent, and only while there is something to
                spend it on. A Save that is always live in the corner of an
                always-open panel is a tangerine that is always on screen, and
                brand rule 3 gives a view one accent at a time; at rest this one
                stands down to a ghost that reads "Saved". Disabled is honest
                here for once, because the usual complaint about a disabled
                submit is that it hides the reason and this one states it. The
                opacity override keeps that word legible rather than fading the
                third text tier to half. */}
            {showSave && (
              <Button
                variant={dirty ? "brand" : "ghost"}
                size="sm"
                disabled={!dirty}
                onClick={() => setSaved(draft)}
                className={cn(!dirty && "text-foreground-low disabled:opacity-100")}
              >
                {dirty ? (
                  "Save changes"
                ) : (
                  <>
                    <IconCheck aria-hidden="true" />
                    Saved
                  </>
                )}
              </Button>
            )}
          </div>
        </header>

        {/* The computer fills its box rather than scrolling in one: the
            workspace sizes itself to the height it is given, and a ScrollArea
            has no height to give it. */}
        {computer && (
          <TabsContent
            value="computer"
            forceMount={forceMount}
            className={cn("relative min-h-0 flex-1", hideInactive)}
          >
            <div className="absolute inset-0">{computer}</div>
          </TabsContent>
        )}

        <TabsContent
          value="configuration"
          forceMount={forceMount}
          className={cn("min-h-0 flex-1", hideInactive)}
        >
          {/* `[&>div]:!block` is what makes this panel's width honest, and it
              took a measurement to find. Radix's ScrollArea Viewport wraps its
              children in a `display: table` box, which shrink-to-fits to its
              contents' MAX-content width; the instructions field is a
              `field-sizing: content` textarea, whose max-content width is its
              text. The two together gave the panel a content floor of 471px
              that no amount of narrowing could get under: below it the
              textarea simply stopped shrinking at 431px and the section
              overflowed its own box, silently, under the viewport's clip.

              So PANEL_MIN_WIDTH was a number the panel could not actually
              reach — dragging the splitter to 440 overflowed by 31px. A block
              box fills the viewport instead of shrinking to its contents, so
              `w-full` on the textarea finally resolves against the panel
              rather than against itself. Measured after: the field tracks the
              panel down to 360px with nothing overflowing anywhere.

              Scoped here rather than fixed in the primitive on purpose. The
              table box is how Radix supports content WIDER than its viewport,
              which the thread view and the menus may well be relying on, and
              changing it there would move pixels on seventeen cloned routes to
              solve a problem only this panel has.

              The `!` is not decoration: Radix writes `display: table` as an
              INLINE style, so a plain class loses to it and the fix silently
              does nothing — which is exactly what happened on the first
              attempt, and the panel went on clipping its own "+ Add" buttons.
              thread-view.tsx reaches into the same box the same way
              (`[&>div]:!flex`), for the same reason. */}
          <ScrollArea className="h-full" viewportProps={{ className: "[&>div]:!block" }}>
            {/* The bottom padding is the scroll's own: the last section should
                clear the edge of the panel rather than stop on it. */}
            <div className="pb-8">
              {PANEL_SECTIONS.map((meta) => (
                <PanelSection key={meta.id} meta={meta}>
                  {sectionBody(meta)}
                </PanelSection>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Scrolls like Configuration, and needs the same `[&>div]:!block` on
            the viewport for the same reason (see that tab's note). */}
        {learning && (
          <TabsContent
            value="learning"
            forceMount={forceMount}
            className={cn("min-h-0 flex-1", hideInactive)}
          >
            <ScrollArea className="h-full" viewportProps={{ className: "[&>div]:!block" }}>
              <LearningTab />
            </ScrollArea>
          </TabsContent>
        )}

        <TabsContent
          value="usage"
          forceMount={forceMount}
          className={cn("min-h-0 flex-1", hideInactive)}
        >
          <div className="px-5 py-4">
            <PanelEmpty>Runs and what they cost appear here after the first one.</PanelEmpty>
          </div>
        </TabsContent>
      </Tabs>

      {/* The splitter. A separator rather than a button, per the window-splitter
          pattern, so a screen reader hears the current width and the range it
          may take — and the range it hears is the one the drag can actually
          reach right now (`ceiling`), not the theoretical 720, because a
          splitter that announces a maximum it will not go to is worse than one
          that announces a smaller true one. The bar inside only appears on
          hover or focus, so at rest the panel's edge is one hairline. */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={computer ? "Resize agent panel" : "Resize agent configuration panel"}
        aria-valuenow={width}
        aria-valuemin={AGENT_PANEL_MIN_WIDTH}
        aria-valuemax={ceiling}
        tabIndex={0}
        onPointerDown={onResizeStart}
        onKeyDown={onResizeKeyDown}
        onDoubleClick={() => setPreferred(restingWidth)}
        className="group absolute inset-y-0 z-40 flex w-5 cursor-col-resize touch-none items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        style={{ left: -10 }}
      >
        {/* No accent on focus: Save owns the panel's one tangerine, so the
            splitter shows itself in the same tint it uses on hover and lets
            the ring around the strip say which edge has the keyboard. */}
        <div className="h-8 w-[3px] rounded-full bg-transparent transition-[background-color] duration-(--duration-fast) ease-out-quart group-hover:bg-tint-40 group-focus-visible:bg-tint-40" />
      </div>
    </aside>
  );
}
