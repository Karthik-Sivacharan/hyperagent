import * as React from "react";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/lib/mock/teams";

// A person: initials in a circle on the neutral chip pair the brand already
// checks for contrast (5.25:1 light, 6.86:1 dark). Agents are rounded squares
// with a pictogram in their own hue (agent-avatar.tsx), so colour is left to
// them and a face is never mistaken for one.
//
// INITIALS. One letter at xs and sm, two at md. The small faces mostly sit in
// overlapped stacks (the header's 24px faces overlap by 6px, the org team
// node's 20px faces too), where the next face and its cutout cover about 8px
// of this one: two letters lose the second to it ("PN" read "PI"), one letter
// centred in the circle stays whole. The accessible name carries the full name.
//
// THE EDGE. A 2px band in the surface colour (`--avatar-cutout`, default: the
// canvas; a card sets `[--avatar-cutout:var(--card)]`) cuts each face out of
// the one it overlaps, and a hairline inside the circle gives every face an
// edge. The hairline matters in dark, where the chip fill is neutral-900, the
// same step as a card, an org node and the sheet: without it a face on any of
// those has no outline and a stack runs together.
//
// PRESENCE is opt-in (`showPresence`, off by default; /teams leaves it off):
// an online face then trades the hairline for a success ring hugging it, with
// the same band of surface outside, the multiplayer convention (Figma), and
// its name gains ", online". With `aria-hidden` set (the name already sits
// beside it) the face drops its image role and label.

const SIZES = {
  xs: { box: "size-5 text-[0.625rem]", letters: 1 },
  sm: { box: "size-6 text-[0.6875rem]", letters: 1 },
  md: { box: "size-8 text-xs", letters: 2 },
} as const;

export function MemberAvatar({
  member,
  size = "sm",
  showPresence = false,
  className,
  ...props
}: {
  member: TeamMember;
  size?: keyof typeof SIZES;
  /** Shows the online ring and says "online" in the name. Off by default. */
  showPresence?: boolean;
} & Omit<React.ComponentProps<"span">, "children">) {
  const online = showPresence && member.online;
  const hidden = props["aria-hidden"] === true || props["aria-hidden"] === "true";
  return (
    <span
      role={hidden ? undefined : "img"}
      aria-label={hidden ? undefined : online ? `${member.name}, online` : member.name}
      data-online={showPresence ? member.online : undefined}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full bg-chip font-semibold text-chip-foreground select-none",
        online
          ? "ring-[1.5px] ring-success shadow-[0_0_0_3.5px_var(--avatar-cutout,var(--background))]"
          : "inset-ring inset-ring-tint-15 shadow-[0_0_0_2px_var(--avatar-cutout,var(--background))] dark:inset-ring-tint-40",
        SIZES[size].box,
        // After the size: tailwind-merge lets a later font size drop an earlier leading.
        "leading-none",
        className,
      )}
      {...props}
    >
      {member.initials.slice(0, SIZES[size].letters)}
    </span>
  );
}
