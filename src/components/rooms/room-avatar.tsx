import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from "@/components/ui/avatar";
import { AgentGlyph } from "@/components/brand/agent-glyph";
import type { RoomMember } from "@/lib/mock/rooms";

// One face, one silhouette. A person and an agent both sit on the brand's
// rounded-square tile: a room is a list, and a list of mixed circles and
// squares reads as two lists. Who is an agent is answered by the glyph in the
// tile and by the name beside it, which is a stronger signal than a corner.
//
// The `Avatar` primitive is round everywhere else in the app and stays that
// way; the square is bought here, per instance, by overriding the radius it
// bakes into its root, its rim, its image and its fallback.

const PX = { sm: 20, default: 24, lg: 36 } as const;

export type RoomAvatarSize = keyof typeof PX;

/** Maps this component's sizes onto the `Avatar` primitive's own three. */
const AVATAR_SIZE = { sm: "sm", default: "sm", lg: "default" } as const;

// The glyph tile draws its own corner at 22% of its edge, so the radius a face
// needs is a different token at every size: 4px at 20, 6px at 24, 8px at 36.
// Written out rather than built, because Tailwind only emits a utility it can
// read verbatim in the source.
const GLYPH_RADIUS = { sm: "rounded-xs", default: "rounded-sm", lg: "rounded-md" } as const;
/** The same corner, plus the `after:` rim the primitive pins at `rounded-full`. */
const TILE_RADIUS = {
  sm: "rounded-xs after:rounded-xs",
  default: "rounded-sm after:rounded-sm",
  lg: "rounded-md after:rounded-md",
} as const;
// `Button` shrinks any `<svg>` inside it that does not name its own size, and
// the reply bar is a button: without this the glyph loses 4px to an icon rule
// and stops lining up with the faces it is stacked with.
const GLYPH_EDGE = { sm: "size-5", default: "size-6", lg: "size-9" } as const;

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
        className={cn("shrink-0", GLYPH_EDGE[size], GLYPH_RADIUS[size], className)}
      />
    );
  }

  return (
    <Avatar
      size={AVATAR_SIZE[size]}
      className={cn("shrink-0", TILE_RADIUS[size], className)}
      // The primitive's three sizes are the app's, not this column's, so the
      // edge is set here: a face 4px taller than the glyph beside it in a
      // stack is the thing the shared silhouette was supposed to stop.
      style={{ width: px, height: px }}
    >
      {member.avatarUrl ? <AvatarImage src={member.avatarUrl} alt="" className={GLYPH_RADIUS[size]} /> : null}
      <AvatarFallback className={cn(GLYPH_RADIUS[size], size === "lg" ? "text-sm" : "text-[10px]")}>
        {monogram === "letter" ? member.initials?.slice(0, 1) : member.initials}
      </AvatarFallback>
    </Avatar>
  );
}

/**
 * The stack of faces on a reply bar or a member count. `max` faces, then the
 * remainder as a count, which is the primitive's own `AvatarGroupCount`
 * behaviour squared off to match the tiles it is stacked against.
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
      {/* The primitive sizes this bubble off the group rather than off `size`,
          so it lands on the 24px corner whatever the faces beside it are. */}
      {overflow && rest > 0 ? (
        <AvatarGroupCount className="size-5 rounded-sm text-[10px] ring-2 ring-background">+{rest}</AvatarGroupCount>
      ) : null}
    </AvatarGroup>
  );
}
