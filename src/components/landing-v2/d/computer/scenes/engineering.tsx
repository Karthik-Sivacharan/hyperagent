import {
  IconCheck,
  IconFolder,
  IconGitPullRequest,
  IconTerminal2,
  IconX,
} from "@tabler/icons-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { DesktopWindow } from "../desktop-window";
import { Dock } from "../dock";
import { Bar, Pill, WindowFooter, WindowHeader } from "../skeleton";

// Engineering: the booking tests. Behind, the draft fix as a two-line change
// plus a new test, waiting for review; in front, the terminal where the run
// fails on the three reminder tests and passes after the fix.

function Prompt({ children }: { children: ReactNode }) {
  return (
    <p className="text-foreground">
      <span className="text-foreground-low">$ </span>
      {children}
    </p>
  );
}

function Result({ ok, children }: { ok: boolean; children: ReactNode }) {
  const Icon = ok ? IconCheck : IconX;
  return (
    <p
      className={cn(
        "flex items-center gap-2",
        ok ? "text-success" : "text-destructive",
      )}
    >
      <Icon aria-hidden="true" stroke={2} className="size-3.5 shrink-0" />
      <span className="text-foreground-low">{children}</span>
    </p>
  );
}

function Terminal() {
  return (
    <DesktopWindow
      className="top-[44%] left-[39%] w-[55%]"
      bodyClassName="gap-1.5 px-4 pt-3.5 pb-5 font-mono text-xs leading-5"
    >
      <Prompt>run booking tests</Prompt>
      <Result ok={false}>evening reminders</Result>
      <Result ok={false}>weekend reminders</Result>
      <Result ok={false}>moved appointments</Result>
      <p className="text-foreground-low">145 passed, 3 failed</p>
      <Prompt>run booking tests</Prompt>
      <Result ok>149 passed, 0 failed</Result>
    </DesktopWindow>
  );
}

type DiffLine = { kind: "same" | "removed" | "added"; width: string };

// Two hunks: the reminder time saved with the clinic's time zone (one line
// out, two in), then the new test for evening appointments.
const HUNKS: DiffLine[][] = [
  [
    { kind: "same", width: "w-3/5" },
    { kind: "same", width: "w-4/5" },
    { kind: "removed", width: "w-2/3" },
    { kind: "added", width: "w-3/4" },
    { kind: "added", width: "w-1/2" },
    { kind: "same", width: "w-2/5" },
  ],
  [
    { kind: "same", width: "w-1/2" },
    { kind: "added", width: "w-4/5" },
    { kind: "added", width: "w-3/5" },
    { kind: "added", width: "w-2/3" },
  ],
];

const LINE_TONE = {
  same: { row: "", mark: "", bar: "bg-tint-15" },
  removed: {
    row: "bg-destructive/8",
    mark: "text-destructive",
    bar: "bg-destructive/20",
  },
  added: { row: "bg-success/8", mark: "text-success", bar: "bg-success/25" },
} as const;

function Hunk({ file, lines }: { file: string; lines: DiffLine[] }) {
  return (
    <div className="overflow-hidden rounded-lg shadow-edge">
      <div className="flex h-7 items-center border-b border-border-subtle bg-surface-secondary px-3 font-mono text-xs text-foreground-low">
        {file}
      </div>
      <div className="py-1">
        {lines.map((line, i) => {
          const tone = LINE_TONE[line.kind];
          return (
            <div
              key={i}
              className={cn("flex h-5 items-center gap-3 px-3", tone.row)}
            >
              <span className={cn("w-2 font-mono text-xs", tone.mark)}>
                {line.kind === "removed"
                  ? "-"
                  : line.kind === "added"
                    ? "+"
                    : ""}
              </span>
              <Bar className={cn(line.width, tone.bar)} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function DraftFix() {
  return (
    <DesktopWindow className="top-[6%] left-[6%] h-[52%] w-[66%]">
      <WindowHeader
        title="Draft fix: reminder times"
        trailing={<Pill tone="draft">Draft</Pill>}
      />
      <div className="flex min-h-0 flex-1">
        <div className="flex w-[27%] shrink-0 flex-col gap-3 border-r border-border-subtle px-3 pt-4">
          <Bar className="w-4/5 bg-tint-20" />
          <Bar className="w-3/5" />
          <Bar className="w-2/3" />
          <Bar className="w-1/2" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-3">
          <Hunk file="reminders" lines={HUNKS[0]} />
          <Hunk file="booking tests" lines={HUNKS[1]} />
        </div>
      </div>
      <WindowFooter trailing="Not merged">
        2 lines changed, 1 new test
      </WindowFooter>
    </DesktopWindow>
  );
}

export function EngineeringScene() {
  return (
    <>
      <DraftFix />
      <Terminal />
      <Dock
        apps={[
          { icon: IconTerminal2, tone: "ink", open: true },
          { icon: IconGitPullRequest, open: true },
          { icon: IconFolder },
        ]}
      />
    </>
  );
}
