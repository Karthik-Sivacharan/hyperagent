"use client";

import { useState, type JSX, type ReactNode } from "react";
import Image from "next/image";
import {
  IconCheck,
  IconCopy,
  IconCopyPlus,
  IconDots,
  IconExternalLink,
  IconEyeOff,
  IconPencil,
  IconPlug,
  IconPlugOff,
  IconPuzzle,
  IconRobotFace,
  IconSettings,
  IconTrash,
  IconWebhook,
} from "@tabler/icons-react";

import { PanelEmpty } from "@/components/agent-panel/panel-section";
import { integrationLogos } from "@/components/settings/integration-logos";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconTile } from "@/components/ui/icon-tile";
import { AGENT_CONNECTORS, AGENT_SUBAGENTS, AGENT_TRIGGERS, type AgentConnector } from "@/lib/mock/agent-config";
import { PRESELECTED_SKILL_IDS, SUGGESTED_SKILLS } from "@/lib/mock/suggested-skills";
import { TOOL_LOGOS } from "@/lib/mock/tool-logos";
import { cn } from "@/lib/utils";

// The contents of five sections of the agent panel: connectors, skills,
// knowledge sources, subagents and triggers. The shell owns the panel, the
// section headers, the "+ Add" and the "AI managed" state; this file owns
// nothing but what sits under those headers.
//
// ONE ROW, FIVE FILLINGS. The reason this file exists at all is that the panel
// it belongs to replaces a collapsed accordion whose six sections had drifted
// into six different objects (src/lib/mock/agent-config.ts records both live
// references). Flattening the accordion only helps if what is revealed reads
// as one list; five sections that each invent a row would be the same drift
// one level down, now permanently on screen. So there is a single `ResourceRow`
// and every section fills it:
//
//   [ 24px lead ] 12px [ title / meta, both truncating ] [ action? ] [ ⋯ ]
//
// Two lines at a fixed 40px: a 14px title on a 20px line, a 12px meta on a 16px
// line, centred with 2px to spare, and 8px between rows, so the pitch is still
// the 48 it was when the rows were ruled (see RowList). It is the same
// two-line block the composer's thread-settings menu uses for a name over its
// detail, so the panel and the menu it supersedes are set the same way. Every
// row is exactly two lines even where the data would fit on
// one, because a list whose rows change height is a list a reader has to scan
// rather than skim.
//
// THE MEASURE. The panel is ~550px and the rows sit inside its padding, so the
// real measure is about 500px, and roughly 420 of that reaches the title once
// the lead, the gutter and the overflow control are paid for. Two strings in
// the data already overrun it — the subagent blurb and, at a narrower panel,
// `arvindrk/extract-design-system` — so nothing here is allowed to wrap: the
// row is a flex container, the body is `min-w-0 flex-1`, the meta line is a
// `min-w-0` flex row of its own, and the one part that may be cut carries
// `truncate` while its neighbour carries `shrink-0`. Wrapping is what would
// break the fixed height, and the fixed height is what makes the five sections
// rhyme.
//
// NO ACCENT ANYWHERE. The panel's single tangerine belongs to its Save button
// (brand rule 3, and the shell owns that button). Everything here is ink,
// tints and hairlines.

/** How many of the tool marks live inline; the rest come from the manifest. */
const inlineLogos: Record<string, (() => JSX.Element) | undefined> = integrationLogos;

/**
 * The list wrapper. A `ul` because these are lists, and a gap between rows
 * rather than a hairline. It was a hairline at 48px, and that put the same
 * rule between two rows as between two sections, so the panel read as one
 * striped list and the sections stopped standing apart. Now the hairline is
 * the section's alone and rows are held apart by space: 40px rows 8px apart,
 * which leaves 12px between one row's meta line and the next row's name,
 * clearly more than the 0px between a name and its own meta line.
 */
function RowList({ children }: { children: ReactNode }) {
  return <ul className="flex flex-col gap-2">{children}</ul>;
}

/**
 * The row itself. `action` is the section-specific control and is optional;
 * the overflow menu is not, and it is always the last thing on the line, so
 * the right edge of every section is the same column of dots whether or not
 * the row beside it carries an action.
 *
 * The dots are always rendered rather than revealed on hover. Hover-revealed
 * actions are the house idiom on the thread cards, but they are a poor fit
 * here: a settings panel is a touch surface too, and a control that only
 * exists under a cursor is a control half the readers never find. Kept quiet
 * instead — a ghost pill in the low tier that lifts to the first on hover.
 */
function ResourceRow({
  lead,
  title,
  titleClassName,
  meta,
  action,
  menuLabel,
  menu,
}: {
  lead: ReactNode;
  title: ReactNode;
  titleClassName?: string;
  meta: ReactNode;
  action?: ReactNode;
  menuLabel: string;
  menu: ReactNode;
}) {
  return (
    <li className="flex h-10 items-center gap-3">
      {lead}
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <span className={cn("truncate text-sm leading-5 font-medium text-foreground", titleClassName)}>{title}</span>
        {/* One tier for every second line: this is all metadata about the row
            above it, and letting each section pick its own tier would undo
            the rhyme the shared height buys. Mono is reserved for the two
            strings that are addresses rather than prose. */}
        <span className="flex min-w-0 items-center gap-1.5 text-xs leading-4 text-foreground-low">{meta}</span>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {action}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={menuLabel}
              className="text-foreground-low hover:text-foreground"
            >
              <IconDots className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          {/* `align="end"` so the panel's right edge holds it: opened from the
              last column, a centred menu would hang off the panel. */}
          <DropdownMenuContent align="end" className="w-auto min-w-44">
            {menu}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
}

/**
 * The 24px lead. One box for all five sections — `IconTile`'s tint tone, the
 * same fill the agent card's tool strip uses — so a real logo and a Tabler
 * glyph sit on the same grid and the left gutter of the panel is one column.
 * Logos are drawn at 16px inside it, glyphs at 14px: a 2px stroke reads larger
 * than a filled mark at the same box, and matching the boxes rather than the
 * ink is what makes the column look straight.
 */
function RowLead({ children, dimmed }: { children: ReactNode; dimmed?: boolean }) {
  return (
    <IconTile
      aria-hidden="true"
      className={cn("[&>img]:size-4 [&>svg]:size-4", dimmed && "[&>*]:opacity-60")}
    >
      {children}
    </IconTile>
  );
}

/**
 * One tool mark, resolved the way the signup flow resolves one: the marks
 * transcribed from the integrations page first, then the artwork manifest for
 * the ids that page does not carry (Figma and Linear are both in the second
 * group). Logos keep their own colours — brand rule 10 — and nothing here
 * inlines an SVG, so this file needs no entry on the lint-tokens allow list.
 */
function ConnectorMark({ toolId }: { toolId: string }) {
  const Inline = inlineLogos[toolId];
  if (Inline) return <Inline />;

  const file = TOOL_LOGOS[toolId];
  if (!file) return <IconPlug aria-hidden="true" />;
  // 32 for the 2x of a 16px mark, as the agent card's strip does it.
  return <Image src={file.src} alt="" width={32} height={32} className="size-4 object-contain" />;
}

/**
 * Connectors.
 *
 * CONNECTED VERSUS AVAILABLE, WITHOUT A HUE. The reference panel settles this
 * with colour: a blue Connect button on the rows that need one, a quiet tick
 * on the rest. We have no colour to spend — the panel's one accent is the
 * Save button, and a status hue as decoration is out under brand rule 3 — so
 * the difference is carried by weight, by form and by the word, three signals
 * that all survive greyscale:
 *
 *   - WEIGHT. An unconnected row carries an ink `Connect` pill, and it is the
 *     only filled control in the whole panel below the header. Ink is the
 *     brand's loudest non-accent fill and the default button already is it, so
 *     the pill is the loudest thing on its row without borrowing the accent.
 *     A connected row carries no filled control at all: the difference is not
 *     a colour swap but the presence of an object.
 *   - FORM. The mark on an unconnected row is dimmed to 60%. Scanning only the
 *     left gutter tells you which tools are live, and dimming artwork is not
 *     recolouring it, so the logos keep their own palettes.
 *   - THE WORD. "Connected" behind a small tick, or "Not connected". Redundant
 *     with both signals above and deliberately so: redundancy is what carries
 *     state when the one channel everybody reaches for is unavailable.
 *
 * The tick is `text-foreground-low`, the same tier as the word beside it. The
 * hierarchy is inverted on purpose — the row that needs nothing is the quiet
 * one — which is the reference's arrangement done with weight instead of hue.
 *
 * Connect does not connect. Everything in this panel is static mock data, and
 * of the controls here only the skills' Remove is local enough to be made real
 * (see below); connecting a tool is an external consent flow with nothing
 * honest to fake.
 */
function ConnectorRow({ connector }: { connector: AgentConnector }) {
  const connected = connector.status === "connected";

  return (
    <ResourceRow
      lead={
        <RowLead dimmed={!connected}>
          <ConnectorMark toolId={connector.toolId} />
        </RowLead>
      }
      title={connector.name}
      meta={
        connected ? (
          <>
            <IconCheck className="size-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Connected</span>
          </>
        ) : (
          <span className="truncate">Not connected</span>
        )
      }
      action={connected ? undefined : <Button size="xs">Connect</Button>}
      menuLabel={`More actions for ${connector.name}`}
      menu={
        connected ? (
          <>
            <DropdownMenuItem>
              <IconSettings className="size-4" aria-hidden="true" />
              Manage permissions
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <IconPlugOff className="size-4" aria-hidden="true" />
              Disconnect
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem>
            <IconEyeOff className="size-4" aria-hidden="true" />
            Hide from this agent
          </DropdownMenuItem>
        )
      }
    />
  );
}

/**
 * Every row component takes the section's own empty line and renders it itself
 * when its live list is empty.
 *
 * The decision has to live HERE rather than in the shell, because for Skills
 * the list is local state: the shell can only see the three ids the mock ships
 * with, so a reader who removes all three would leave the shell still believing
 * the section has rows and painting a gap where the empty line belongs. The
 * rule is that whoever owns the state owns the question "is this empty".
 */
type RowsProps = { empty?: ReactNode };

export function ConnectorRows({ empty }: RowsProps = {}) {
  if (AGENT_CONNECTORS.length === 0) return <PanelEmpty>{empty}</PanelEmpty>;
  return (
    <RowList>
      {AGENT_CONNECTORS.map((connector) => (
        <ConnectorRow key={connector.id} connector={connector} />
      ))}
    </RowList>
  );
}

/**
 * Skills.
 *
 * Only the three ids the signup flow pre-selected are installed; the other
 * three in `SUGGESTED_SKILLS` were offered and not taken, and a settings panel
 * that lists what was declined would be a suggestion screen, not a record of
 * this agent.
 *
 * The name and the repo are in the sans, like every other row in this panel.
 * They were mono (an address, `skills.sh/<repo>/<name>`), and the user asked
 * for the panel to be one face on 2026-09-10: the mono ran wider and read a
 * size larger than the 14px names beside it.
 *
 * REMOVE IS REAL, and it is the only control in this file that is. Removing a
 * skill is entirely local — the flow picked these three a minute ago, nothing
 * left the browser — so a Remove that visibly does nothing would be the one
 * inert control a reader can catch out. The seam it leaves is worth naming:
 * the shell decides whether to show its empty state from the data, and this
 * list is local, so removing all three empties the section without bringing
 * the empty copy up. Lifting the set into the shell is the fix; faking it from
 * inside a row component would mean this file owning a section's empty state,
 * which is exactly the boundary the split was drawn on.
 */
export function SkillRows({ empty }: RowsProps = {}) {
  // A Set, because the only question asked of it is "is this one still here".
  const [installed, setInstalled] = useState<ReadonlySet<string>>(() => new Set(PRESELECTED_SKILL_IDS));
  const skills = SUGGESTED_SKILLS.filter((skill) => installed.has(skill.id));

  function remove(id: string) {
    setInstalled((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
  }

  if (skills.length === 0) return <PanelEmpty>{empty}</PanelEmpty>;

  return (
    <RowList>
      {skills.map((skill) => (
        <ResourceRow
          key={skill.id}
          lead={
            <RowLead>
              <IconPuzzle className="size-3.5" aria-hidden="true" />
            </RowLead>
          }
          title={skill.name}
          // The repo is the half that truncates because it is the half a
          // reader can still place from its first few characters.
          meta={<span className="truncate">{skill.repo}</span>}
          menuLabel={`More actions for ${skill.name}`}
          menu={
            <>
              <DropdownMenuItem>
                <IconExternalLink className="size-4" aria-hidden="true" />
                Open on skills.sh
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCopy className="size-4" aria-hidden="true" />
                Copy address
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => remove(skill.id)}>
                <IconTrash className="size-4" aria-hidden="true" />
                Remove
              </DropdownMenuItem>
            </>
          }
        />
      ))}
    </RowList>
  );
}

/**
 * Knowledge sources, and there are none.
 *
 * `AGENT_KNOWLEDGE` is empty on purpose: this is the panel ninety seconds
 * after a Google button, and a knowledge base nobody pointed at anything is
 * the honest state. So this renders nothing and the shell shows its own empty
 * copy, which is the one place an empty state should live — the shell already
 * has to decide "rows or empty" for six other sections, and a component that
 * sometimes drew its own would make that decision two-sided.
 *
 * It is exported anyway so the seam is uniform. A shell that composes five
 * imported row components and one inline `null` invites the next person to
 * decide, section by section, whether the rows are a component or an
 * expression; keeping the sixth seam identical to the other five costs three
 * lines and settles that.
 */
export function KnowledgeRows({ empty }: RowsProps = {}) {
  // Always empty at signup, and that is the content: nothing has been
  // pointed at this agent yet, and saying so is more use than a blank.
  return <PanelEmpty>{empty}</PanelEmpty>;
}

/**
 * Subagents. The blurb is running copy and the model is a value, so the blurb
 * takes the truncation and the model is pinned: cutting "Opus 5" would leave
 * characters that mean nothing, while a cut blurb still reads as a sentence
 * that continues. Same arrangement as the skill shelf's provenance line, which
 * pins its install count against a truncating repo for the same reason.
 */
export function SubagentRows({ empty }: RowsProps = {}) {
  if (AGENT_SUBAGENTS.length === 0) return <PanelEmpty>{empty}</PanelEmpty>;
  return (
    <RowList>
      {AGENT_SUBAGENTS.map((subagent) => (
        <ResourceRow
          key={subagent.id}
          lead={
            <RowLead>
              <IconRobotFace className="size-3.5" aria-hidden="true" />
            </RowLead>
          }
          title={subagent.name}
          meta={
            <>
              <span className="truncate">{subagent.blurb}</span>
              <span aria-hidden="true">·</span>
              <span className="shrink-0">{subagent.model}</span>
            </>
          }
          menuLabel={`More actions for ${subagent.name}`}
          menu={
            <>
              <DropdownMenuItem>
                <IconPencil className="size-4" aria-hidden="true" />
                Edit subagent
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCopyPlus className="size-4" aria-hidden="true" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <IconTrash className="size-4" aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </>
          }
        />
      ))}
    </RowList>
  );
}

/**
 * Triggers. The label is the sentence a person wrote ("On merge to main") and
 * the detail is the repository it watches, one text tier down in the same
 * face: the panel is set in the sans throughout.
 *
 * The lead glyph is a webhook rather than the bolt: the bolt is spoken for in
 * this product, it is Fast inference on the composer's thread-settings menu,
 * and one glyph with two jobs in one app is the iconography rule this repo
 * follows most literally.
 */
export function TriggerRows({ empty }: RowsProps = {}) {
  if (AGENT_TRIGGERS.length === 0) return <PanelEmpty>{empty}</PanelEmpty>;
  return (
    <RowList>
      {AGENT_TRIGGERS.map((trigger) => (
        <ResourceRow
          key={trigger.id}
          lead={
            <RowLead>
              <IconWebhook className="size-3.5" aria-hidden="true" />
            </RowLead>
          }
          title={trigger.label}
          meta={<span className="truncate">{trigger.detail}</span>}
          menuLabel={`More actions for ${trigger.label}`}
          menu={
            <>
              <DropdownMenuItem>
                <IconPencil className="size-4" aria-hidden="true" />
                Edit trigger
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <IconTrash className="size-4" aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </>
          }
        />
      ))}
    </RowList>
  );
}
