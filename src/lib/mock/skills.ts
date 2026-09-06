// hyperagent.com/skills as captured on 2026-09-06
// (docs/reference/pages/skills.html). The account owns no skills yet, so
// every tab shows the "No skills found" empty state; the "Discover and
// install new skills" row is the marketplace's featured skills.

import { featuredSkills, type SkillListing } from "@/lib/mock/marketplace";

export type SkillTab = "personal" | "team" | "shared";

export const skillTabs: { value: SkillTab; label: string }[] = [
  { value: "personal", label: "Your skills" },
  { value: "team", label: "Team skills" },
  { value: "shared", label: "Shared with you" },
];

export type Skill = {
  id: string;
  name: string;
  description: string;
  updatedLabel: string;
};

export const userSkills: Record<SkillTab, Skill[]> = {
  personal: [],
  team: [],
  shared: [],
};

export const skillSortOptions = ["Most recent", "Name", "Most used"] as const;

export const skillFilters = [{ id: "archived", label: "Archived" }] as const;

// The page serves the author avatars from its own folder.
const skillsAvatars: Record<string, string> = {
  "Alex McDonnell": "/img/skills/alex-mcdonnell.png",
};

export const discoverSkills: SkillListing[] = featuredSkills.map((skill) => ({
  ...skill,
  cover: undefined,
  author: {
    name: skill.author.name,
    avatarUrl: skillsAvatars[skill.author.name],
  },
}));
