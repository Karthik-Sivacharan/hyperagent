import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar";
import { AgentGlyph } from "@/components/brand/agent-glyph";
import type { RoomMember } from "@/lib/mock/rooms";

// One face, two kinds. A person is the round avatar the rest of the app uses;
// an agent is its glyph on the brand's rounded-square tile. Keeping the two
// silhouettes different is the whole point: in a room where both talk, the
// shape of the face tells you which one you are reading before the name does.

const PX = { sm: 20, default: 24, lg: 36 } as const;

export type RoomAvatarSize = keyof typeof PX;

/** Maps this component's sizes onto the `Avatar` primitive's own three. */
const AVATAR_SIZE = { sm: "sm", default: "sm", lg: "default" } as const;

export function RoomAvatar({
  member,
  size = "default",
  monogram = "initials",
  className,
}: {
  member: RoomMember;
  size?: RoomAvatarSize;
  /**
   * What a photoless person falls back to. Two letters everywhere except in a
   * stack, where the next face covers the right half of this one and the
   * second letter with it: there, one letter is the whole monogram.
   */
  monogram?: "initials" | "letter";
  className?: string;
}) {
  const px = PX[size];

  if (member.kind === "agent" && member.glyph) {
    return (
      <AgentGlyph
        shape={member.glyph.shape}
        tone={member.glyph.tone}
        size={px}
        className={cn("shrink-0", size === "lg" ? "rounded-lg" : "rounded-md", className)}
      />
    );
  }

  return (
    <Avatar
      size={AVATAR_SIZE[size]}
      className={cn("shrink-0", className)}
      style={size === "lg" ? { width: px, height: px } : undefined}
    >
      {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt="" /> : null}
      <AvatarFallback className={size === "lg" ? "text-sm" : "text-[10px]"}>
        {monogram === "letter" ? member.initials?.slice(0, 1) : member.initials}
      </AvatarFallback>
    </Avatar>
  );
}

/**
 * The stack of faces on a reply bar or a member count. `max` faces, then the
 * remainder as a count, which is the primitive's own `AvatarGroupCount`
 * behaviour with the glyph tiles allowed in beside the round avatars.
 */
export function RoomFacepile({
  members,
  max = 3,
  size = "sm",
  overflow = true,
  className,
}: {
  members: RoomMember[];
  max?: number;
  size?: RoomAvatarSize;
  /**
   * Draw the "+N" bubble for the faces that did not fit. Off where the caller
   * already prints the total beside the stack: saying nine and plus-six in the
   * same 60px is two answers to one question.
   */
  overflow?: boolean;
  className?: string;
}) {
  const shown = members.slice(0, max);
  const rest = members.length - shown.length;

  return (
    <AvatarGroup className={cn("-space-x-1", className)}>
      {shown.map((member) => (
        <RoomAvatar
          key={member.id}
          member={member}
          size={size}
          monogram="letter"
          className="ring-2 ring-background"
        />
      ))}
      {overflow && rest > 0 ? (
        <AvatarGroupCount className="size-5 text-[10px] ring-2 ring-background">+{rest}</AvatarGroupCount>
      ) : null}
    </AvatarGroup>
  );
}
