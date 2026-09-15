import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { A11Y, TEAM, type RosterItem } from "./content";
import { LandingSection } from "./section";

const STATE_VARIANT: Record<
  RosterItem["state"],
  "success" | "brand" | "secondary"
> = {
  done: "success",
  waiting: "brand",
  running: "secondary",
};

// The team before any feature copy: six agents as one message list on the
// card surface, the way a messages app lists people. Each row is an avatar,
// the name over the department, the last report in the second tier, the
// time in the third, and a state chip. The one row waiting on a person is
// the only brand tint in the list. Under the list, one caption saying these
// are examples.
export function Roster() {
  const { id, heading, items, states, caption } = TEAM;
  return (
    <LandingSection id={id} heading={heading}>
      <ul
        role="list"
        aria-label={A11Y.roster}
        className="flex flex-col divide-y divide-border-subtle rounded-3xl bg-card shadow-card"
      >
        {items.map((item) => (
          <li
            key={item.name}
            className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-2 px-5 py-4 sm:grid-cols-[auto_minmax(0,14rem)_minmax(0,1fr)_auto] sm:items-center sm:gap-x-6 sm:px-6"
          >
            <Avatar size="lg">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {item.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-col">
              <p className="truncate text-base font-medium text-foreground">
                {item.name}
              </p>
              <p className="text-md text-foreground-low">{item.department}</p>
            </div>
            <p
              className={cn(
                "col-span-2 text-base sm:col-span-1",
                item.state === "waiting"
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {item.preview}
            </p>
            <div className="col-span-2 flex items-center gap-3 sm:col-span-1 sm:flex-col sm:items-end sm:gap-1.5">
              <Badge variant={STATE_VARIANT[item.state]}>
                {states[item.state]}
              </Badge>
              <span className="text-xs text-foreground-low tabular-nums">
                {item.time}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-md text-foreground-low">{caption}</p>
    </LandingSection>
  );
}
