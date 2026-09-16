import { Badge } from "@/components/ui/badge";
import { Overline } from "@/components/ui/overline";

import { A11Y, WEEK } from "./content";
import { LandingSection } from "./section";

// What the team did this week, as the reports arrived: five days on the
// raised surface, each day a caps label over its rows. A row is the time in
// tabular figures, the agent's name in the first tier, what came back in the
// second, and a brand chip on the two that wait for a person. Past tense
// and a number in every line: this is the "team does the work" section,
// carried by the shape rather than by adjectives.
export function Week() {
  const { id, heading, days, needsYou, caption } = WEEK;
  return (
    <LandingSection id={id} heading={heading}>
      <div
        role="list"
        aria-label={A11Y.week}
        className="grid gap-6 rounded-5xl bg-surface-raised p-5 sm:p-8 lg:grid-cols-5 lg:gap-8"
      >
        {days.map((day) => (
          <div key={day.day} role="listitem" className="flex flex-col gap-3">
            <Overline asChild>
              <p>{day.day}</p>
            </Overline>
            <ul role="list" className="flex flex-col gap-3">
              {day.items.map((item) => (
                <li
                  key={`${day.day}-${item.time}`}
                  className="flex flex-col gap-1.5 rounded-2xl bg-background p-4 shadow-card"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">
                      {item.agent}
                    </p>
                    <span className="text-xs text-foreground-low tabular-nums">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.text}</p>
                  {item.needsYou ? (
                    <Badge variant="brand" className="mt-1 self-start">
                      {needsYou}
                    </Badge>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mt-4 text-md text-foreground-low">{caption}</p>
    </LandingSection>
  );
}
