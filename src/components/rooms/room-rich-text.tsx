import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AgentGlyph } from "@/components/brand/agent-glyph";
import { roomMember, type RoomMember } from "@/lib/mock/rooms";

// Room prose is plain strings with three markers: **bold**, `code`, and
// @[member-id] for a mention. Same reasoning as the thread's rich-text.tsx —
// the mock writes the strings, so a split on the markers is the whole
// renderer and no markdown library is pulled in for it.
//
// Mentions resolve against the roster rather than carrying their own label, so
// a name that changes in one place changes everywhere it was said.

const TOKENS = /(\*\*[^*]+\*\*|`[^`]+`|@\[[a-z0-9-]+\])/g;

/**
 * A mention as it reads inside a sentence: the live site's inline reference
 * chip (`rounded-lg` on a tint fill), carrying the speaker's face at the size
 * of the surrounding line so the eye finds it without a colour being spent.
 * Agents get their glyph; people get a monogram on the same small tile, so a
 * mention carries the room's one avatar silhouette down into the sentence.
 */
export function MentionChip({ member, className }: { member: RoomMember; className?: string }) {
  return (
    <span
      data-slot="room-mention"
      className={cn(
        "-my-0.5 inline-flex items-center gap-1 rounded-lg bg-tint-10 px-1.5 py-0.5 align-baseline font-medium text-foreground",
        "transition-colors duration-[var(--duration-fast)] ease-out-quart hover:bg-tint-15",
        className,
      )}
    >
      {member.kind === "agent" && member.glyph ? (
        <AgentGlyph shape={member.glyph.shape} tone={member.glyph.tone} size={14} className="shrink-0 rounded-xs" />
      ) : (
        <span
          aria-hidden="true"
          className="flex size-3.5 shrink-0 items-center justify-center rounded-xs bg-tint-20 text-[8px] font-medium text-muted-foreground"
        >
          {member.initials}
        </span>
      )}
      {member.name}
    </span>
  );
}

/** `**bold**`, `` `code` `` and `@[id]` inside one line of room prose. */
export function renderRoomInline(text: string): ReactNode {
  return text
    .split(TOKENS)
    .filter(Boolean)
    .map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-strong text-foreground">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={i}
            className="rounded-sm bg-tint-10 px-1 py-0.5 font-mono text-[0.85em] text-foreground"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith("@[")) {
        const member = roomMember(part.slice(2, -1));
        return member ? <MentionChip key={i} member={member} /> : <Fragment key={i}>{part}</Fragment>;
      }
      return <Fragment key={i}>{part}</Fragment>;
    });
}
