"use client";

import { MorphingAgentGlyph } from "@/components/brand/agent-glyph";
import { Composer } from "@/components/composer/composer";
import { ComposerWorkingStatus } from "@/components/composer/composer-status";
import { BorderBeam, type BorderBeamProps } from "@/components/ui/border-beam";
import { WIKI_AGENT } from "@/components/wiki/wiki-agent";

// The wiki's ask box: the app's composer, addressed to Wiki Agent, without the
// agent picker (there is one agent here) or the integrations strip. While the
// agent works, two things come on together: the border beam around the box
// and the Working row across its top, where the agent's glyph stands in for
// the dots and its name leads the line. They leave together too, so the light
// only ever means "Wiki Agent is busy", never "look here".

type WikiAskProps = {
  /**
   * What Wiki Agent is doing, sentence case with the ellipsis ("Reading 3
   * pages…"). Omit while it is idle: no beam, no Working row.
   */
  task?: string;
  /** Omit and the Working row has no Stop, as `ComposerWorkingStatus` rules. */
  onStop?: () => void;
  /** The beam's look. The default is the primitive's: mono, travelling. */
  beam?: Pick<BorderBeamProps, "colorVariant" | "size" | "strength">;
  value?: string;
  onValueChange?: (value: string) => void;
  onSend?: () => void;
  autoFocus?: boolean;
  className?: string;
};

export function WikiAsk({ task, onStop, beam, className, ...composer }: WikiAskProps) {
  const working = task !== undefined;

  return (
    <BorderBeam {...beam} active={working} className={className}>
      <Composer
        placeholder={`Ask ${WIKI_AGENT.name}, or tell it what to fix…`}
        showAgentPicker={false}
        showIntegrationsFooter={false}
        status={
          working ? (
            <ComposerWorkingStatus
              figure={
                <MorphingAgentGlyph shape={WIKI_AGENT.glyph} size={20} pace="quick" idle="busy" blink glance />
              }
              label={
                <>
                  {/* The two tones part the name from the task on screen; the
                      colon does it for a screen reader. */}
                  <span className="font-medium text-foreground">{WIKI_AGENT.name}</span>
                  <span className="sr-only">:</span> {task}
                </>
              }
              onStop={onStop}
            />
          ) : undefined
        }
        {...composer}
      />
    </BorderBeam>
  );
}
