// Rooms: the shared channel where a team and its agents work in the open.
// Static for the clone, the same way every other mock in this folder is: the
// UI is the deliverable, so nothing here talks to a server and every id is
// stable enough to key a list and deep-link a thread.
//
// Message prose uses the same two inline markers the thread mock uses plus a
// third: **bold**, `code`, and @[member-id] for a mention, which
// `src/components/rooms/room-rich-text.tsx` resolves against the roster below.

import type { GlyphTone } from "@/components/brand/agent-glyph";
import { currentUser } from "@/lib/mock/user";

/** Who is talking: a person on the team, or an agent that belongs to it. */
export type RoomMemberKind = "human" | "agent";

export type RoomMember = {
  id: string;
  name: string;
  kind: RoomMemberKind;
  /** People: the monogram their avatar falls back to. */
  initials?: string;
  /** People: a photo, when the account has one. */
  avatarUrl?: string;
  /** Agents: the glyph that is their face (`src/components/brand/agent-glyph`). */
  glyph?: { shape: string; tone: GlyphTone };
  /** One line under the name in the member list and the hover card. */
  role?: string;
};

export type RoomBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "bullets"; items: string[] };

/** The avatar stack and count under a message that started a thread. */
export type RoomReplySummary = {
  count: number;
  /** Members whose faces stack under the message, in the order they replied. */
  participantIds: string[];
  /** "Last reply 20 hours ago" — written, not computed, like every other mock label. */
  lastReplyLabel: string;
};

export type RoomReaction = {
  emoji: string;
  count: number;
  /** The signed-in account already reacted: the pill reads as pressed. */
  reacted?: boolean;
};

export type RoomMessage = {
  id: string;
  authorId: string;
  /** Clock label exactly as the room renders it ("10:14 AM"). */
  time: string;
  blocks: RoomBlock[];
  /**
   * A membership event rather than something someone wrote ("joined the
   * room."). Rendered as one quiet line: no reply bar, no reactions.
   */
  system?: boolean;
  /**
   * The schedule that posted this message, when an agent spoke on a timer
   * rather than in reply to a person ("Daily Motivational Quote").
   */
  schedule?: string;
  reactions?: RoomReaction[];
  /** The thread hanging off this message, if anyone replied. */
  replies?: RoomReplySummary;
};

/** Messages under one date separator. */
export type RoomDay = {
  /** "Yesterday", "Today", "Tuesday, 15 September". */
  label: string;
  messages: RoomMessage[];
};

/** A message's replies, keyed by the id of the message they hang off. */
export type RoomThread = {
  rootId: string;
  replies: RoomMessage[];
};

export type Room = {
  id: string;
  /** The URL segment, and the name after the `#`. */
  slug: string;
  /** One line under the name in the directory and the header's hover card. */
  topic: string;
  /** Feature flag the room is exercising, shown as a badge beside the name. */
  badge?: string;
  starred?: boolean;
  /** Scheduled jobs posting into this room; the count on the header's clock pill. */
  scheduleCount: number;
  memberIds: string[];
  /** Unread messages, for the sidebar row and the directory. */
  unread?: number;
  days: RoomDay[];
  threads: RoomThread[];
};

/* --------------------------------------------------------------- roster */

// The three colleagues' faces are placeholder portraits from i.pravatar.cc,
// which serves Unsplash-licensed photographs; they are vendored into
// `public/avatars/` rather than hot-linked so the room renders with the
// network off and nobody's face changes under us between screenshots.
export const roomMembers: RoomMember[] = [
  {
    id: "you",
    name: currentUser.name,
    kind: "human",
    initials: currentUser.initials,
    avatarUrl: currentUser.avatarUrl,
    role: "Workspace owner",
  },
  {
    id: "priya",
    name: "Priya Raghunathan",
    kind: "human",
    initials: "PR",
    avatarUrl: "/avatars/priya.jpg",
    role: "Product engineer",
  },
  {
    id: "dan",
    name: "Dan Whitfield",
    kind: "human",
    initials: "DW",
    avatarUrl: "/avatars/dan.jpg",
    role: "Infrastructure",
  },
  { id: "mara", name: "Mara Osei", kind: "human", initials: "MO", avatarUrl: "/avatars/mara.jpg", role: "Design" },
  {
    id: "media-lab",
    name: "Media Lab Director",
    kind: "agent",
    glyph: { shape: "pinwheel", tone: "tangerine" },
    role: "Renders and image pipelines",
  },
  {
    id: "triage",
    name: "Tool-Error Triage",
    kind: "agent",
    glyph: { shape: "hammerhead", tone: "sand" },
    role: "Watches failed tool calls",
  },
  {
    id: "evalbot",
    name: "EvalBot",
    kind: "agent",
    // Trefoil for the shape it is paid to have: three lobes pulled into one
    // answer, which is what 62 cases reduced to a verdict looks like. It is
    // also the only round silhouette among this room's agents, so it survives
    // the facepile where slot-stack's notches silted up into a blob.
    glyph: { shape: "trefoil", tone: "sand" },
    role: "Runs the eval suite on every merge",
  },
  {
    id: "yuki",
    name: "Yuki",
    kind: "agent",
    glyph: { shape: "bell", tone: "sand" },
    role: "Release notes and changelogs",
  },
  {
    id: "zippy",
    name: "Zippy",
    kind: "agent",
    glyph: { shape: "sweep", tone: "sand" },
    role: "Keeps the backlog tidy",
  },
];

const byId = new Map(roomMembers.map((member) => [member.id, member]));

/** The member behind an id, or `undefined` for one that has left the room. */
export function roomMember(id: string): RoomMember | undefined {
  return byId.get(id);
}

/* ---------------------------------------------------------------- rooms */

const capabilityChecks: Room = {
  id: "room_capability_checks",
  slug: "room-capability-checks",
  topic: "Where we prove a new agent capability before it ships",
  badge: "Beta",
  starred: true,
  scheduleCount: 1,
  memberIds: ["you", "priya", "dan", "mara", "media-lab", "triage", "evalbot", "yuki", "zippy"],
  days: [
    {
      label: "Yesterday",
      messages: [
        {
          id: "m_1",
          authorId: "priya",
          time: "9:49 AM",
          blocks: [
            {
              kind: "paragraph",
              text: "@[media-lab] render what you think this team looks like, and do it as a background job rather than inline.",
            },
          ],
          replies: { count: 1, participantIds: ["media-lab"], lastReplyLabel: "Last reply yesterday" },
        },
        {
          id: "m_2",
          authorId: "priya",
          time: "10:14 AM",
          blocks: [
            {
              kind: "paragraph",
              text: "@[media-lab] the delegation flag is on now. Same render, one change: everyone is a cat.",
            },
          ],
          replies: {
            count: 3,
            participantIds: ["media-lab", "priya"],
            lastReplyLabel: "Last reply yesterday",
          },
        },
        {
          id: "m_3",
          authorId: "dan",
          time: "10:20 AM",
          blocks: [
            {
              kind: "paragraph",
              text: "I set approval mode to `never_ask` while you were in there. @[media-lab] can you spin up one more background job on top of the one already queued?",
            },
          ],
          replies: {
            count: 7,
            participantIds: ["media-lab", "dan", "triage"],
            lastReplyLabel: "Last reply 20 hours ago",
          },
        },
        {
          id: "m_10",
          authorId: "priya",
          time: "12:06 PM",
          blocks: [
            {
              kind: "paragraph",
              text: "@[zippy] both renders are in now, so the tickets we filed against the inline path are dead weight. Archive anything on the render board that has not moved since the flag went on. I count nine.",
            },
          ],
        },
        {
          id: "m_4",
          authorId: "yuki",
          time: "2:06 PM",
          system: true,
          blocks: [{ kind: "paragraph", text: "was added to the room by Priya Raghunathan." }],
        },
        {
          id: "m_11",
          authorId: "priya",
          time: "2:09 PM",
          blocks: [
            {
              kind: "paragraph",
              text: "@[yuki] you have missed the morning, and the delegation thread is the part worth reading: self-delegation works, and the approval gate nobody asked for is still open. Write it up for the changelog and keep it under unreleased, because none of it has shipped.",
            },
          ],
        },
        {
          id: "m_5",
          authorId: "mara",
          time: "7:18 PM",
          system: true,
          blocks: [{ kind: "paragraph", text: "joined the room." }],
        },
      ],
    },
    {
      label: "Today",
      messages: [
        {
          id: "m_6",
          authorId: "media-lab",
          time: "8:01 AM",
          schedule: "Daily standup note",
          blocks: [
            { kind: "paragraph", text: "Morning. One thing from yesterday, one thing for today." },
            {
              kind: "paragraph",
              text: "Self-delegation held up under the flag: eleven background jobs, no orphaned workers, one approval gate that still fires when it should not.",
            },
            {
              kind: "paragraph",
              text: "Today I would like that gate closed, because everything downstream of it is waiting on a human to click a button nobody asked for.",
            },
          ],
          reactions: [
            { emoji: "👀", count: 3 },
            { emoji: "🔥", count: 1, reacted: true },
          ],
        },
        {
          id: "m_7",
          authorId: "triage",
          time: "8:47 AM",
          blocks: [
            {
              kind: "paragraph",
              text: "Overnight sweep: **4 failed tool calls**, all the same shape. The worker asks for `render.queue` before the flag has propagated, gets a 403, and retries into the same wall.",
            },
            {
              kind: "bullets",
              items: [
                "3 of the 4 recovered on the second retry, so nothing is lost.",
                "The fourth is still parked in `pending_approval` from last night.",
                "Nothing here needs a human, but the parked job will not clear itself.",
              ],
            },
          ],
          replies: { count: 2, participantIds: ["dan", "triage"], lastReplyLabel: "Last reply 42 minutes ago" },
          reactions: [{ emoji: "🙏", count: 2 }],
        },
        {
          id: "m_8",
          authorId: "you",
          time: "9:12 AM",
          blocks: [
            {
              kind: "paragraph",
              text: "@[triage] clear the parked one and leave the gate alone until @[evalbot] has a run on the new flag. I would rather find out here than in the release.",
            },
          ],
        },
        {
          id: "m_9",
          authorId: "evalbot",
          time: "9:14 AM",
          blocks: [
            {
              kind: "paragraph",
              text: "Queued. `capability/self-delegation` is 62 cases, about nine minutes. I will post the diff against last night's run when it lands.",
            },
          ],
          reactions: [{ emoji: "✅", count: 2 }],
        },
      ],
    },
  ],
  threads: [
    {
      rootId: "m_3",
      replies: [
        {
          id: "r_3_1",
          authorId: "media-lab",
          time: "10:16 AM",
          blocks: [
            {
              kind: "paragraph",
              text: "Flag received, and this one is going out as a real background job rather than inline. A worker is spinning up now: same prompt, two renderers, side by side when it checks back in.",
            },
          ],
        },
        {
          id: "r_3_2",
          authorId: "dan",
          time: "10:19 AM",
          blocks: [
            {
              kind: "paragraph",
              text: "@[media-lab] double-check your own config while you are in there. Can you actually delegate to yourself?",
            },
          ],
        },
        {
          id: "r_3_3",
          authorId: "media-lab",
          time: "10:19 AM",
          blocks: [
            {
              kind: "paragraph",
              text: "@[dan] checked. Short answer: **yes, self-delegation works**. The longer answer is the interesting part.",
            },
            {
              kind: "bullets",
              items: [
                "Delegation scope is an explicit allowlist, not the whole workspace, and approval mode is `never_ask`.",
                "The allowlist is not enumerated in the config payload I can read, but the practical test passed: the spawn from two minutes ago (me, to a copy of me) was accepted and is sitting in the queue.",
              ],
            },
            {
              kind: "paragraph",
              text: "**One wrinkle:** the spawn came back `pending_approval` rather than auto-starting, even with approval mode set to `never_ask`. Somebody in this room has to click Approve before the worker moves. I cannot tell from here whether that gate is the room's behaviour for self-spawns or part of what the flag is meant to remove.",
            },
            {
              kind: "paragraph",
              text: "**Mechanics:** with delegation set to an explicit list, room members cannot see or edit that list from the config card. It only moves through the agent editor. If you want me delegable workspace-wide, that is a one-field change and I can draft it.",
            },
          ],
          reactions: [{ emoji: "🧠", count: 2 }],
        },
        {
          id: "r_3_4",
          authorId: "triage",
          time: "10:24 AM",
          blocks: [
            {
              kind: "paragraph",
              text: "For the record, the gate fired four times overnight on self-spawns and zero times on spawns from a person. That is a clean enough split to call it a rule rather than a flake.",
            },
          ],
        },
        {
          id: "r_3_5",
          authorId: "dan",
          time: "10:31 AM",
          blocks: [
            {
              kind: "paragraph",
              text: "Good. Draft the one-field change, do not apply it. I want @[evalbot] green on the current flag before we widen anything.",
            },
          ],
        },
        {
          id: "r_3_6",
          authorId: "media-lab",
          time: "10:33 AM",
          blocks: [{ kind: "paragraph", text: "Drafted and parked. It is one line in the agent editor when you want it." }],
          reactions: [{ emoji: "👍", count: 3 }],
        },
        {
          id: "r_3_7",
          authorId: "media-lab",
          time: "11:58 AM",
          blocks: [
            {
              kind: "paragraph",
              text: "Renders are back, both of them. Posting to the room rather than burying them in here.",
            },
          ],
        },
      ],
    },
    {
      rootId: "m_7",
      replies: [
        {
          id: "r_7_1",
          authorId: "dan",
          time: "8:52 AM",
          blocks: [{ kind: "paragraph", text: "@[triage] what is the retry backoff set to? Three attempts into a 403 is not a retry, it is a loop." }],
        },
        {
          id: "r_7_2",
          authorId: "triage",
          time: "8:55 AM",
          blocks: [
            {
              kind: "paragraph",
              text: "`200ms`, fixed, three attempts. I agree it is too tight for a permission error. Exponential from one second would have cleared all four without anyone noticing.",
            },
          ],
        },
      ],
    },
    {
      rootId: "m_1",
      replies: [
        {
          id: "r_1_1",
          authorId: "media-lab",
          time: "9:51 AM",
          blocks: [
            {
              kind: "paragraph",
              text: "Ran it inline: the background-job flag is off for me. Rendered anyway so you have something to look at, but the job path is the thing you wanted tested.",
            },
          ],
        },
      ],
    },
    {
      rootId: "m_2",
      replies: [
        {
          id: "r_2_1",
          authorId: "media-lab",
          time: "10:15 AM",
          blocks: [{ kind: "paragraph", text: "Queued as a job this time. Cats confirmed." }],
        },
        {
          id: "r_2_2",
          authorId: "priya",
          time: "10:18 AM",
          blocks: [{ kind: "paragraph", text: "Perfect. That is the flag working." }],
        },
        {
          id: "r_2_3",
          authorId: "media-lab",
          time: "10:41 AM",
          blocks: [{ kind: "paragraph", text: "Both renders posted. The second one is better and I will not be taking questions." }],
          reactions: [{ emoji: "😹", count: 4 }],
        },
      ],
    },
  ],
};

const releaseRoom: Room = {
  id: "room_release_train",
  slug: "release-train",
  topic: "Everything that ships, in the order it ships",
  scheduleCount: 3,
  memberIds: ["you", "dan", "mara", "yuki", "evalbot"],
  unread: 4,
  days: [],
  threads: [],
};

const designRoom: Room = {
  id: "room_design_review",
  slug: "design-review",
  topic: "Work in progress, looked at before it is finished",
  scheduleCount: 0,
  memberIds: ["you", "mara", "priya", "zippy"],
  days: [],
  threads: [],
};

const incidentsRoom: Room = {
  id: "room_incidents",
  slug: "incidents",
  topic: "Paged, triaged, written up",
  scheduleCount: 2,
  memberIds: ["you", "dan", "triage", "evalbot"],
  unread: 1,
  days: [],
  threads: [],
};

export const rooms: Room[] = [capabilityChecks, releaseRoom, designRoom, incidentsRoom];

/** The rooms the sidebar lists above "View all". */
export const recentRooms = rooms.slice(0, 2);

export function roomBySlug(slug: string): Room | undefined {
  return rooms.find((room) => room.slug === slug);
}

/** The replies hanging off a message, or an empty list when nobody replied. */
export function roomThread(room: Room, rootId: string): RoomMessage[] {
  return room.threads.find((thread) => thread.rootId === rootId)?.replies ?? [];
}

/** Every message in the room, flattened across its date groups. */
export function roomMessages(room: Room): RoomMessage[] {
  return room.days.flatMap((day) => day.messages);
}
