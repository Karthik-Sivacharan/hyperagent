"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// The composer's "Plan" pill menu (docs/reference/overlays/composer-plan-menu.html,
// composer-plan-menu-execute.html): Plan first, or Execute > Auto / Ask first.

export type ExecutionMode = "plan" | "auto" | "ask";

export const EXECUTION_MODES: Record<ExecutionMode, { label: string; pill: string; description: string }> = {
  plan: {
    label: "Plan first",
    pill: "Plan",
    description: "Think through an approach and get user clarification before taking action",
  },
  auto: { label: "Auto", pill: "Auto", description: "Run everything end-to-end without stopping" },
  ask: {
    label: "Ask first",
    pill: "Ask first",
    description: "Pause for approval before sensitive actions like sending messages or modifying external systems",
  },
};

function ModeBody({ mode, selected }: { mode: ExecutionMode; selected: boolean }) {
  const { label, description } = EXECUTION_MODES[mode];
  return (
    <>
      <Check className={cn("mt-0.5 size-4 shrink-0", selected ? "text-blue-500" : "opacity-0")} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className={cn("text-sm", selected ? "font-medium text-blue-500" : "font-normal text-foreground")}>{label}</div>
        <div className="text-muted-foreground text-xs leading-4">{description}</div>
      </div>
    </>
  );
}

export function PlanMenu({
  children,
  mode,
  onModeChange,
  ...triggerProps
}: React.ComponentProps<typeof DropdownMenuTrigger> & {
  mode: ExecutionMode;
  onModeChange: (mode: ExecutionMode) => void;
}) {
  const [open, setOpen] = useState(false);
  const choose = (next: ExecutionMode) => {
    onModeChange(next);
    setOpen(false);
  };
  const executing = mode !== "plan";

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild {...triggerProps}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[calc(100vw-2rem)] max-w-72">
        <DropdownMenuItem className="items-start" onSelect={() => choose("plan")}>
          <ModeBody mode="plan" selected={mode === "plan"} />
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="items-start">
            <Check className={cn("mt-0.5 size-4 shrink-0", executing ? "text-blue-500" : "opacity-0")} aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <div className={cn("text-sm", executing ? "font-medium text-blue-500" : "font-normal text-foreground")}>Execute</div>
              <div className="text-muted-foreground text-xs leading-4">Act immediately without a plan</div>
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="max-w-72">
            <DropdownMenuItem className="items-start" onSelect={() => choose("auto")}>
              <ModeBody mode="auto" selected={mode === "auto"} />
            </DropdownMenuItem>
            <DropdownMenuItem className="items-start" onSelect={() => choose("ask")}>
              <ModeBody mode="ask" selected={mode === "ask"} />
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
