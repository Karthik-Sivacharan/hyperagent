"use client";

import { AgentPanel } from "@/components/agent-panel/agent-panel";
import { Overline } from "@/components/ui/overline";

// The agent configuration panel, on its own, at the width it ships at.
//
// Shown against a stand-in for the thread column rather than on a bare page:
// the panel's whole argument is that it sits open beside a conversation
// instead of hiding behind a toggle, and a panel photographed alone cannot be
// judged on that. The left half here is deliberately inert filler — the real
// pairing is /signup once this is wired into the handoff.

export default function AgentPanelPage() {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-8">
        <Overline>Agent panel · open by default</Overline>
        <h1 className="font-heading text-2xl">The config lives here, not in three menus</h1>
        <p className="max-w-content text-muted-foreground text-sm">
          A competing agent builder keeps this panel open and flat: every section visible, each with its own add
          and its own &ldquo;AI managed&rdquo; state. hyperagent.com has the same information
          behind tabs and an accordion, closed on arrival — and the same model and tool list
          again in the composer&rsquo;s pill and its <span className="font-mono">+</span> menu,
          which is why the panel loses. The audit of what moves and what breaks is
          <span className="font-mono"> docs/plans/2026-09-10-agent-panel-consolidation.md</span>.
        </p>
        <div className="mt-2 rounded-3xl border border-border-subtle border-dashed p-8 text-foreground-low text-sm">
          Stand-in for the thread column.
        </div>
      </div>
      <AgentPanel />
    </div>
  );
}
