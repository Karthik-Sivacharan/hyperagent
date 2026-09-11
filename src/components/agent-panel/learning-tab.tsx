"use client";

import { useId, useState } from "react";
import {
  IconBrain,
  IconClipboardCheck,
  IconPuzzle,
  IconRobotFace,
  type Icon,
} from "@tabler/icons-react";

import { IconTile } from "@/components/ui/icon-tile";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PanelEmpty, PanelField, PanelSection } from "@/components/agent-panel/panel-section";
import { MODELS } from "@/components/composer/thread-settings-menu";
import {
  LEARNING_CONFIG,
  LEARNING_SECTIONS,
  LEARNING_TARGETS,
  type LearningTarget,
} from "@/lib/mock/agent-config";

// The agent panel's Learning tab: what the agent is allowed to learn from its
// runs, and what it has learned. Ground truth is
// docs/reference/overlays/thread-panel-learning.html (the live panel's three
// sections: Knowledge, Generation, Insights). The layout is the Configuration
// tab's, not the dump's: the same PanelSection shell, the same 40px rows 8px
// apart and the same 20/16/12 spacing, so the two tabs read as one panel.
//
// Skin decisions over the dump: no collapsing (PanelSection never collapses,
// and three sections fit), no per-row hues (the dump tints each type's glyph;
// this panel spends no colour below its Save button), and the switches line up
// in columns. The dump right-aligns each row's switches, so a row without
// "Auto" pushes its "Suggest" into the Auto column; here every row keeps both
// slots, empty where the setting does not exist.
//
// HONEST AT SIGNUP. The agent has not run, so it has learned nothing, and the
// Insights section says so instead of showing cards. The two settings above it
// are real choices a person makes before the first run, which is why they are
// the part that is filled in.

const TARGET_ICONS: Record<LearningTarget["id"], Icon> = {
  memories: IconBrain,
  skills: IconPuzzle,
  agents: IconRobotFace,
  rubrics: IconClipboardCheck,
};

/** One "Generate insights for" row: the kind of thing, then its two modes. */
function TargetRow({ target }: { target: LearningTarget }) {
  const [suggest, setSuggest] = useState(target.suggest);
  const [auto, setAuto] = useState(target.auto ?? false);
  const suggestId = useId();
  const autoId = useId();
  const Glyph = TARGET_ICONS[target.id];
  const name = target.label.toLowerCase();

  return (
    <li className="flex h-10 items-center gap-3">
      <IconTile aria-hidden="true" className="[&>svg]:size-3.5">
        <Glyph />
      </IconTile>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">{target.label}</span>
      {/* Fixed slots so the switches form two columns down the list. The
          switch carries the full name ("Suggest memories"); the visible word
          is its label, so clicking "Suggest" toggles it too. */}
      <span className="flex w-20 items-center justify-end gap-2">
        <Label htmlFor={suggestId} className="cursor-pointer text-xs font-normal text-foreground-low">
          Suggest
        </Label>
        <Switch
          id={suggestId}
          size="sm"
          aria-label={`Suggest ${name}`}
          checked={suggest}
          onCheckedChange={setSuggest}
        />
      </span>
      <span className="flex w-16 items-center justify-end gap-2" aria-hidden={target.auto === undefined}>
        {target.auto !== undefined && (
          <>
            <Label htmlFor={autoId} className="cursor-pointer text-xs font-normal text-foreground-low">
              Auto
            </Label>
            <Switch
              id={autoId}
              size="sm"
              aria-label={`Add ${name} automatically`}
              checked={auto}
              onCheckedChange={setAuto}
            />
          </>
        )}
      </span>
    </li>
  );
}

export function LearningTab() {
  const [discover, setDiscover] = useState(LEARNING_CONFIG.discoverKnowledge);
  const [model, setModel] = useState(LEARNING_CONFIG.model);
  const discoverId = useId();
  const modelId = useId();
  const targetsId = useId();
  const [knowledge, generation, insights] = LEARNING_SECTIONS;

  return (
    <div className="pb-8">
      <PanelSection meta={knowledge}>
        <div className="flex flex-col gap-4">
          <PanelField
            label="Discover knowledge"
            htmlFor={discoverId}
            hint="Finds pages and files worth knowing, and asks before it keeps one."
          >
            <Switch id={discoverId} checked={discover} onCheckedChange={setDiscover} />
          </PanelField>

          <div>
            {/* A label inside the section, one step under its caps title: the
                sentence-case eyebrow brand.css pairs with `text-label-12-caps`. */}
            <p id={targetsId} className="mb-2 text-xs font-medium text-foreground-low">
              Generate insights for
            </p>
            <ul aria-labelledby={targetsId} className="flex flex-col gap-2">
              {LEARNING_TARGETS.map((target) => (
                <TargetRow key={target.id} target={target} />
              ))}
            </ul>
          </div>
        </div>
      </PanelSection>

      <PanelSection meta={generation}>
        <PanelField label="Model" htmlFor={modelId} hint="Reads each run and drafts the insights below.">
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger id={modelId} size="sm" className="max-w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end" className="w-64">
              {MODELS.map((m) => {
                const Logo = m.logo;
                return (
                  <SelectItem key={m.name} value={m.name}>
                    <span className="flex min-w-0 items-center gap-2">
                      <Logo className="size-4 shrink-0" />
                      <span className="truncate">{m.name}</span>
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </PanelField>
      </PanelSection>

      <PanelSection meta={insights}>
        <PanelEmpty>{insights.empty}</PanelEmpty>
      </PanelSection>
    </div>
  );
}
