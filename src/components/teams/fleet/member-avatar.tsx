import * as React from "react";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/lib/mock/teams";

// A person's initials in a circle (agents are rounded squares, see
// agent-avatar.tsx). People stay neutral, on the chip pair the brand already
// checks for contrast, so colour is left to the agents. Presence is a ring:
// online draws a thin success ring hugging the face with a band of canvas
// outside it, the multiplayer convention (Figma, Conductor); offline keeps
// only the band, so an overlapping stack stays cleanly cut out either way.
// The band reads `--avatar-cutout` (default: the canvas), as the agent
// avatar's dot does.

const SIZES = {
  xs: "size-5 text-[0.5625rem]",
  sm: "size-6 text-[0.625rem]",
  md: "size-8 text-xs",
} as const;

export function MemberAvatar({
  member,
  size = "sm",
  className,
  ...props
}: {
  member: TeamMember;
  size?: "xs" | "sm" | "md";
} & Omit<React.ComponentProps<"span">, "children">) {
  return (
    <span
      role="img"
      aria-label={member.online ? `${member.name}, online` : member.name}
      data-online={member.online}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-full bg-chip font-semibold leading-none text-chip-foreground select-none",
        member.online
          ? "ring-[1.5px] ring-success shadow-[0_0_0_3.5px_var(--avatar-cutout,var(--background))]"
          : "shadow-[0_0_0_2px_var(--avatar-cutout,var(--background))]",
        SIZES[size],
        className,
      )}
      {...props}
    >
      {member.initials}
    </span>
  );
}
