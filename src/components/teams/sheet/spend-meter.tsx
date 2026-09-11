import { cn } from "@/lib/utils";
import type { FleetAgent } from "@/lib/mock/teams";
import { PanelSection } from "@/components/agent-panel/panel-section";
import { formatUsd } from "@/components/teams/fleet/format";

// This month's spend against the agent's monthly cap. The fill carries the
// severity and the track is a lighter step of the same colour, so the state
// reads across the whole bar, not only the filled part: neutral below 80%,
// warning from 80%, destructive at the cap (Gauge, paused at its $80). The
// figure sits in the section header like the week's total above it; the
// line under the bar says what it means in the reader's terms (how much is
// left) and names the threshold in words, so the colour is never the only
// signal.

type Tone = "neutral" | "warning" | "destructive";

const TONES: Record<Tone, { track: string; fill: string; text: string }> = {
  neutral: { track: "bg-chart-track", fill: "bg-muted-foreground", text: "text-foreground-low" },
  warning: { track: "bg-warning/15", fill: "bg-warning", text: "text-warning" },
  destructive: { track: "bg-destructive/15", fill: "bg-destructive", text: "text-destructive" },
};

function wholeOrCents(value: number) {
  return formatUsd(value, { whole: Number.isInteger(value) });
}

export function SpendSection({ agent }: { agent: FleetAgent }) {
  const share = agent.budget > 0 ? agent.spend / agent.budget : 0;
  const pct = Math.round(Math.min(1, share) * 100);
  const tone: Tone = share >= 1 ? "destructive" : share >= 0.8 ? "warning" : "neutral";
  const left = Math.max(0, agent.budget - agent.spend);
  const figure = `${wholeOrCents(agent.spend)} of ${wholeOrCents(agent.budget)}`;

  return (
    <PanelSection
      meta={{ id: "spend", title: "Spend this month", empty: "" }}
      action={<span className="text-sm font-medium text-foreground tabular-nums">{figure}</span>}
    >
      <div
        role="meter"
        aria-label="Spend this month"
        aria-valuemin={0}
        aria-valuemax={agent.budget}
        aria-valuenow={Math.min(agent.spend, agent.budget)}
        aria-valuetext={`${figure}, ${pct}% of the monthly budget`}
        className={cn("relative h-1.5 overflow-hidden rounded-full", TONES[tone].track)}
      >
        <div className={cn("absolute inset-y-0 left-0 rounded-full", TONES[tone].fill)} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 flex items-center justify-between gap-3 text-xs tabular-nums">
        <span className={TONES[tone].text}>
          {tone === "destructive" ? "At its monthly cap" : `${pct}% of budget${tone === "warning" ? ", nearing the cap" : ""}`}
        </span>
        <span className="text-foreground-low">{left > 0 ? `${formatUsd(left)} left` : "Nothing left this month"}</span>
      </p>
    </PanelSection>
  );
}
