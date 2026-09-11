import { cn } from "@/lib/utils";
import { Overline } from "@/components/ui/overline";

// The list's one column template, shared by the sticky header and every row
// in every group, so a column lines up from Needs you down to Done. Every
// track is fixed except the run's own (title over its detail line), which
// takes what is left; nothing sizes to its content, so a long project name
// in one group can never push a column out of line in another.
//
// Columns drop out by the list's own width (the `list` container on the
// scroller in list-view.tsx), not the viewport's, because the sidebar and
// the agent sheet change how much room the list really has:
//
//   base   status · run · agent (monogram only) · updated
//   @xl    + id, + the agent's name                        (576px)
//   @4xl   + project, + cost                               (896px)
//   @5xl   + owner, + run time                             (1024px)
//
// The template changes with each step and each cell is hidden in step with
// it, so the track count always matches the visible cells. The class strings
// are literal so Tailwind sees them.

export const LIST_GRID =
  "grid items-center gap-x-3 @xl/list:gap-x-4 grid-cols-[1rem_minmax(0,1fr)_1.25rem_4.5rem] @xl/list:grid-cols-[1rem_3.75rem_minmax(0,1fr)_6.5rem_4.5rem] @4xl/list:grid-cols-[1rem_3.75rem_minmax(0,1fr)_8.5rem_6.5rem_3.75rem_4.5rem] @5xl/list:grid-cols-[1rem_3.75rem_minmax(0,1fr)_8.5rem_6.5rem_3rem_3.75rem_3.75rem_4.5rem]";

/** Each cell's display, in step with LIST_GRID's tracks. */
export const LIST_COL = {
  status: "flex items-center",
  id: "hidden @xl/list:flex",
  run: "flex min-w-0 flex-col",
  project: "hidden min-w-0 @4xl/list:flex",
  agent: "flex min-w-0 items-center gap-2",
  owner: "hidden items-center @5xl/list:flex",
  cost: "hidden justify-end @4xl/list:flex",
  time: "hidden justify-end @5xl/list:flex",
  updated: "flex justify-end",
} as const;

/**
 * The column labels, pinned to the top of the scroller. Full bleed with the
 * page's 24px gutter, so its hairline runs edge to edge like the header
 * rule above it and its grid starts where the rows' grids start (their 12px
 * list inset plus their own 12px padding). Decorative for assistive tech:
 * each row's accessible name already says what every value is.
 */
export function ListColumnHeader() {
  return (
    <div aria-hidden="true" className="sticky top-0 z-20 border-b border-border-subtle bg-background px-6">
      <Overline className={cn(LIST_GRID, "h-8")}>
        <span className={LIST_COL.status} />
        <span className={LIST_COL.id}>ID</span>
        <span className={LIST_COL.run}>Run</span>
        <span className={LIST_COL.project}>Project</span>
        <span className={LIST_COL.agent}>
          <span className="hidden @xl/list:inline">Agent</span>
        </span>
        <span className={LIST_COL.owner}>Owner</span>
        <span className={LIST_COL.cost}>Cost</span>
        <span className={LIST_COL.time}>Time</span>
        <span className={LIST_COL.updated}>Updated</span>
      </Overline>
    </div>
  );
}
