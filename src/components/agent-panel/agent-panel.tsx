"use client";

import { useEffect, useId, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
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
import { PanelEmpty, PanelSection } from "@/components/agent-panel/panel-section";
import {
  ConnectorRows,
  KnowledgeRows,
  SkillRows,
  SubagentRows,
  TriggerRows,
} from "@/components/agent-panel/resource-rows";
import { EFFORTS, MODELS, type Effort } from "@/components/composer/thread-settings-menu";
import { AGENT_CONFIG, PANEL_SECTIONS, type SectionMeta } from "@/lib/mock/agent-config";
import { cn } from "@/lib/utils";

// The agent's configuration, open. src/lib/mock/agent-config.ts records why it
// is open: the same model and the same tool list are already reachable from the
// composer's settings pill and its "+" menu, so a panel that arrives collapsed
// loses to the menus every time and the config quietly forks in two. Everything
// here is visible on arrival, flat, and in one column.
//
// WIDTH: 480px, corrected 2026-09-10 from 560 after measuring the reference
// rather than trusting a remembered figure. This comment used to say "Gumloop
// ~550"; Gumloop's panel is **477px at a 1456px viewport**, read off a live
// agent page. It is not even a fixed width there — it is a split pane at
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
// character band, and it is where the reference sits too: Gumloop's own
// instructions box measures 407px inner at 14px, which is 63 characters. A
// number the live product reads comfortably at beats a band this panel was
// never actually failing.
//
// What it gives back is the conversation. At the 1456px the screenshot gate
// uses, 1456 less the 256px sidebar less this panel leaves 720px of thread
// against 640 before, which is inside the column's own 752px measure instead of
// 112px short of it.
//
// Narrower still and the section header rows (title, "AI discovery", switch,
// "+ Add") start colliding, which is what PANEL_MIN_WIDTH below is; wider and
// the panel wins an argument it should not be having with the thread.
export const AGENT_PANEL_WIDTH = 480;

// The drag range. 440 is where the longest header row runs out of gap; 720 is
// where the instructions field passes 90 characters and prose starts to fray.
//
// The minimum is exported because it is half of the question "is there room for
// both this and a readable conversation" that use-shell-fit.ts asks on every
// resize. Two files agreeing on 440 by typing it twice is the sort of pair that
// drifts the first time one of them is retuned.
export const AGENT_PANEL_MIN_WIDTH = 440;
const PANEL_MAX_WIDTH = 720;
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

// One setting: what it is called on the left, what it is set to on the right.
// The hint sits under the label rather than under the control because the
// control column is ragged (a 32px select, an 18px switch) and a caption hung
// off it would be too. Local, because a settings row is not a shape two pages
// share yet; it becomes a pattern the day a second surface wants it.
function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <div className="min-w-0 flex-1">
        <Label htmlFor={htmlFor} className="cursor-pointer text-sm font-medium text-foreground">
          {label}
        </Label>
        {hint && <p className="mt-0.5 text-xs text-foreground-low">{hint}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">{children}</div>
    </div>
  );
}

export function AgentPanel({
  id,
  className,
  maxWidth,
  onWidthChange,
}: {
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
  const [preferred, setPreferred] = useState(AGENT_PANEL_WIDTH);
  const ceiling = Math.min(PANEL_MAX_WIDTH, maxWidth ?? PANEL_MAX_WIDTH);
  const width = clampWidth(preferred, ceiling);
  const drag = useRef({ startX: 0, startWidth: AGENT_PANEL_WIDTH });

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

  const modelBody = (
    <div className="-my-2">
      <Field label="Model" htmlFor={modelId} hint={AGENT_CONFIG.modelNote}>
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
      </Field>

      {/* The hint is the chosen effort's own description rather than a fixed
          line, so the row explains the setting it is currently in. */}
      <Field label="Reasoning effort" htmlFor={effortId} hint={currentEffort?.description}>
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
      </Field>

      <div className="py-2">
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

      <Field
        label="Self-updates"
        htmlFor={selfUpdatesId}
        hint="The agent may rewrite these instructions after a run, and tells you what changed."
      >
        <Switch
          id={selfUpdatesId}
          checked={draft.selfUpdates}
          onCheckedChange={(selfUpdates) => setDraft((d) => ({ ...d, selfUpdates }))}
        />
      </Field>
    </div>
  );

  const autonomyBody = (
    <div className="-my-2">
      {AUTONOMY_RULES.map((rule) => (
        <Field key={rule.id} label={rule.label} htmlFor={`${autonomyId}-${rule.id}`} hint={rule.hint}>
          <Switch
            id={`${autonomyId}-${rule.id}`}
            checked={draft.autonomy[rule.id]}
            onCheckedChange={(on) =>
              setDraft((d) => ({ ...d, autonomy: { ...d.autonomy, [rule.id]: on } }))
            }
          />
        </Field>
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
      aria-label="Agent configuration"
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
      <Tabs defaultValue="configuration" className="flex h-full min-h-0 flex-col gap-0">
        <header className="shrink-0 border-b border-border-subtle px-5 pt-4 pb-3">
          <h2 className="truncate text-heading-lg text-foreground">{AGENT_CONFIG.name}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">{AGENT_CONFIG.blurb}</p>

          <div className="mt-3 flex items-center justify-between gap-3">
            {/* Two tabs, and the two words are hyperagent's own. Its panel has
                four — Configuration, Learning, Library, Usage — but Learning
                and Library are already destinations in the left nav, so two of
                its four tabs are second copies of pages, which is the same
                duplication this panel exists to end. What is left is the
                configuration, which is everything below, and what it cost. */}
            <TabsList>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
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
          </div>
        </header>

        <TabsContent value="configuration" className="min-h-0 flex-1">
          <ScrollArea className="h-full">
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

        <TabsContent value="usage" className="min-h-0 flex-1">
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
        aria-label="Resize agent configuration panel"
        aria-valuenow={width}
        aria-valuemin={AGENT_PANEL_MIN_WIDTH}
        aria-valuemax={ceiling}
        tabIndex={0}
        onPointerDown={onResizeStart}
        onKeyDown={onResizeKeyDown}
        onDoubleClick={() => setPreferred(AGENT_PANEL_WIDTH)}
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
