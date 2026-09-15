import { IconArrowUpRight } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { A11Y, STORIES } from "./content";
import { LandingSection } from "./section";

// The product's own published customer stories: four cards, each the figure
// in the first tier at display size, the quoted line in the second, who it
// was in the third, and a ghost link out to the story. Figures are quoted
// as written; nothing here is ours.
export function Stories() {
  const { id, heading, items, linkLabel } = STORIES;
  return (
    <LandingSection id={id} heading={heading}>
      <ul
        role="list"
        aria-label={A11Y.stories}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {items.map((story) => (
          <li key={story.href}>
            <Card size="none" className="h-full gap-3 p-6">
              <p className="text-3xl text-foreground tabular-nums">
                {story.figure}
              </p>
              <p className="text-base text-muted-foreground">{story.line}</p>
              <p className="text-md text-foreground-low">{story.who}</p>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="mt-auto -ml-2 self-start"
              >
                <a href={story.href} target="_blank" rel="noopener noreferrer">
                  {linkLabel}
                  <IconArrowUpRight aria-hidden="true" />
                </a>
              </Button>
            </Card>
          </li>
        ))}
      </ul>
    </LandingSection>
  );
}
