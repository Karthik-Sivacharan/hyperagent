"use client";

import { useId, useState } from "react";
import { IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Overline } from "@/components/ui/overline";
import { Switch } from "@/components/ui/switch";
import type { SectionMeta } from "@/lib/mock/agent-config";

// One band of the agent panel: a header row and whatever the section holds.
// Seven of these stack under the panel's tabs, hairline to hairline, and
// nothing collapses. The header carries at most four things — the title, a
// count, an "AI managed" state, an "+ Add" — and every one of them after the
// title is optional, which is what makes one component enough for a section
// of switches and a section of connector rows alike.
//
// THE TITLE IS A GROUP LABEL, NOT A HEADING, and that is a deliberate demotion.
// Brand rule 2 sets a group label as `text-label-12-caps text-foreground-low`,
// which is what the sidebar's own group headers and the settings section heads
// already wear. In a panel whose whole argument is that the CONFIGURATION
// should be visible, seven sentence-case headings at body size would be the
// loudest thing on screen and the thing you came to read — the model, the
// connector, the trigger — would be the second loudest. Caps on the third text
// tier puts the labels behind the content where they belong, and keeps this
// panel in the same voice as the column on the other side of the app.
//
// THE ADD BUTTON DOES NOT HIDE. The sidebar reveals its row actions on hover
// (`HEADER_ACTION` in app/sidebar.tsx) because those rows are a list you scan
// and the action is a rescue. Here the action is the section's whole point:
// an empty Connectors section with a hidden "+ Add" is a dead end on a
// touchscreen, and a dead end for anyone who does not think to sweep the
// pointer across a header. It stays visible, and it stays `ghost` so that six
// of them down the panel read as a column of affordances rather than six
// competing buttons.
//
// The AI-managed toggle is section-local state. It is a `size="sm"` switch,
// which is well under any sensible tap target on its own, so the label beside
// it is a real `<label for>` on a labelable element: the pair is the target,
// roughly 90x28, and clicking the words toggles the switch. The state does not
// reach the panel's Save baseline, because this component's props carry no way
// to report it upward; that matches how every other toggle in this repo works
// today (the composer's "Fast inference" is a `useState` in the menu that
// renders it), and lifting it later is a callback prop away.

export function PanelSection({
  meta,
  count,
  children,
  action,
}: {
  meta: SectionMeta;
  /**
   * The figure beside the title. The shell leaves it off: the sections it
   * renders itself are settings rather than lists, and a section that shows
   * its rows flat can be counted by eye. The row components pass it once they
   * have rows to count.
   */
  count?: number;
  children: React.ReactNode;
  /** Extra header-row content, placed before the "+ Add" button. */
  action?: React.ReactNode;
}) {
  const [aiManaged, setAiManaged] = useState(meta.aiManaged ?? false);
  const titleId = useId();
  const switchId = useId();

  return (
    <section
      aria-labelledby={titleId}
      // 20px on every side, the panel's own side gutter: an even inset is
      // what lets the hairline between two sections read as the one division
      // in the panel (rows inside a section are spaced, never ruled).
      className="border-b border-border-subtle p-5 last:border-b-0"
    >
      {/* `min-h-7` holds every header row to the 28px of the Add button, so a
          section without one (Model, Autonomy) keeps the same rhythm as a
          section with one instead of sitting 6px tighter. */}
      <div className="mb-3 flex min-h-7 items-center gap-2">
        <Overline id={titleId} className="flex min-w-0 items-center gap-1.5">
          <span className="truncate">{meta.title}</span>
          {count !== undefined && <span className="tabular-nums">{count}</span>}
        </Overline>

        {/* Two spacings on purpose: 8px holds a label to its own switch, 12px
            separates that pair from the Add button, so the header reads as
            two controls rather than one run of three things. */}
        <div className="ml-auto flex shrink-0 items-center gap-3">
          {meta.aiManagedLabel && (
            <div className="flex items-center gap-2">
              <Label
                htmlFor={switchId}
                className="cursor-pointer text-xs font-normal text-foreground-low transition-[color] duration-(--duration-fast) ease-out-quart hover:text-muted-foreground"
              >
                {meta.aiManagedLabel}
              </Label>
              <Switch id={switchId} size="sm" checked={aiManaged} onCheckedChange={setAiManaged} />
            </div>
          )}
          {action}
          {meta.addLabel && (
            <Button variant="ghost" size="xs" className="text-muted-foreground hover:text-foreground">
              <IconPlus aria-hidden="true" />
              {meta.addLabel}
            </Button>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

// The line a section shows instead of rows. It is a sentence, not a card: the
// copy in `PANEL_SECTIONS` already says what the section is for, and wrapping
// one honest sentence in a dashed box would spend a border on saying "empty"
// twice. The third text tier is the same one the panel gives placeholders and
// provenance, which is the right register for "nothing here yet, and that is
// fine".
export function PanelEmpty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-foreground-low">{children}</p>;
}

// One setting: what it is called on the left, what it is set to on the right.
// The hint sits under the label rather than under the control because the
// control column is ragged (a 32px select, an 18px switch) and a caption hung
// off it would be too. Shared by the Configuration and Learning tabs, which is
// the second surface its old comment was waiting for before it moved here.
export function PanelField({
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
    <div className="flex items-start justify-between gap-4">
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
