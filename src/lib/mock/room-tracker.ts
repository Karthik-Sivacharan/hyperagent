// The work a room is talking about, as the tasks its tracker lays out.
// Static like every other mock in this directory: no clock, no randomness,
// every relative time a pre-baked string, so the server render and the client
// render agree.
//
// WHERE THIS SHAPE COMES FROM. rooms.ts already carries the conversation.
// This carries what the conversation is about, and it is deliberately not the
// fleet shape in teams.ts (docs/plans/2026-09-17-room-tracker.md §1).
//
//   - One task per row, never one agent per row. A fleet readout collapses an
//     agent into a single state, which cannot say that Media Lab Director is
//     stuck on one render and fine on another. That sentence is the whole
//     reason the board exists, so an agent holds as many cards as it holds
//     tasks, in whichever lanes those tasks are in.
//
//   - Five lanes in reading order, what the person owes first through to what
//     is finished last. Where /teams has `review` this has `blocked`. A room
//     is not a review queue, because an agent that wants eyes on something
//     asks, and asking is `needs-you`. A room is exactly where a stuck agent
//     surfaces, because the person who can unstick it is reading the channel
//     (§3).
//
//   - `assigneeId` is one field where teams.ts carries two. A room's people
//     and a room's agents are on the same roster, so work sits on either
//     without a second column, and some of it sits on people: the board is
//     the room's work, not an inventory of its agents.
//
//   - `sourceMessageId` is the trip back. A task came out of something
//     somebody said, and a card that cannot return to that message would make
//     the tracker a second product rather than the room's other half.
//
//   - `caption` is one line of state in words, and it changes register with
//     the lane: on needs-you it is the ask, on blocked the reason, on working
//     what is happening now, on done the outcome. Queued work has not started,
//     so it usually has nothing to say and carries none.
//
// THE TASKS. 34 across the four rooms, every lane populated in every room so
// no board opens empty. room_capability_checks holds 16 of them, because it
// is the room with the conversation: Media Lab Director carries four tasks in
// four different lanes, tracing the approval gate through the logs while
// blocked by that same gate on the next render, which is the contradiction
// the board is built to show. Tool-Error Triage carries three and EvalBot
// three, Yuki and Zippy two each, so every agent on the composer's bar is one
// face standing for more than one run. Two sit on people, one on the
// signed-in account.
//
// Only room_capability_checks has messages in rooms.ts, so it is the only
// room whose tasks carry a `sourceMessageId`, and there all sixteen do: the
// trip back is the point, so a card in the room the board was designed on is
// not allowed to be the one that goes nowhere. Each id is a real top-level
// message in that room (m_1 through m_11, skipping the two membership
// events), and a message carries as many tasks as it asked for things: the
// 9:12 from the account asks for two and carries two, and the overnight
// failure report carries three, the retry, the sweep that found it and the
// backoff its thread settled on. Two of them had nothing honest to
// point at, so rooms.ts gained the messages they came out of rather than a
// link to something near enough. Ids leave gaps the way a shared counter
// does when other rooms draw from it.

/** The five lanes, and the state a card is in. */
export type TaskStatus = "needs-you" | "blocked" | "working" | "queued" | "done";

/** Reading order: what the person owes first, what is finished last. */
export const TASK_STATUS_ORDER: readonly TaskStatus[] = ["needs-you", "blocked", "working", "queued", "done"];

export type RoomTask = {
  id: string;
  /** The room this belongs to (`Room.id`). */
  roomId: string;
  /** A deliverable named with a verb and an object. */
  title: string;
  status: TaskStatus;
  /** Who is doing it (`RoomMember.id`): usually an agent, sometimes a person. */
  assigneeId: string;
  /** One line of state, in words. The ask, the reason, the live step, or the outcome. */
  caption?: string;
  /** Steps, on queued and working tasks only. */
  progress?: { done: number; total: number };
  /** The message this came out of, so a card can jump back to it (`RoomMessage.id`, same room). */
  sourceMessageId?: string;
  /** Pre-baked relative label. Never computed: the two renders have to agree. */
  updated: string;
};

export const ROOM_TASKS: RoomTask[] = [
  /* ------------------------------------------- room_capability_checks */

  // Needs you.
  {
    id: "t_101",
    roomId: "room_capability_checks",
    title: "Widen the delegation allowlist",
    status: "needs-you",
    assigneeId: "media-lab",
    caption: "The change is drafted and parked, it needs a yes",
    sourceMessageId: "m_3",
    updated: "18m ago",
  },
  {
    id: "t_102",
    roomId: "room_capability_checks",
    title: "Pick the baseline for the flag diff",
    status: "needs-you",
    assigneeId: "evalbot",
    caption: "Last night's run, or the last green release",
    sourceMessageId: "m_9",
    updated: "6m ago",
  },
  {
    id: "t_104",
    roomId: "room_capability_checks",
    title: "Decide whether the approval gate ships closed",
    status: "needs-you",
    assigneeId: "you",
    caption: "Media Lab Director asked for it closed this morning",
    sourceMessageId: "m_6",
    updated: "2h ago",
  },

  // Blocked.
  {
    id: "t_107",
    roomId: "room_capability_checks",
    title: "Start the second background render",
    status: "blocked",
    assigneeId: "media-lab",
    caption: "The spawn is parked in pending approval and cannot clear itself",
    sourceMessageId: "m_3",
    updated: "Yesterday",
  },
  {
    id: "t_108",
    roomId: "room_capability_checks",
    title: "Clear the job parked in pending approval",
    status: "blocked",
    assigneeId: "triage",
    caption: "The gate only opens for a person, and I am not one",
    sourceMessageId: "m_8",
    updated: "35m ago",
  },

  // Working.
  {
    id: "t_110",
    roomId: "room_capability_checks",
    title: "Trace the approval gate through the worker logs",
    status: "working",
    assigneeId: "media-lab",
    caption: "Reading last night's four spawns for a pattern",
    progress: { done: 3, total: 4 },
    sourceMessageId: "m_6",
    updated: "9m ago",
  },
  {
    id: "t_111",
    roomId: "room_capability_checks",
    title: "Retry the four failed render calls",
    status: "working",
    assigneeId: "triage",
    caption: "Three cleared on the second attempt, one to go",
    progress: { done: 3, total: 4 },
    sourceMessageId: "m_7",
    updated: "42m ago",
  },
  {
    id: "t_113",
    roomId: "room_capability_checks",
    title: "Run the self-delegation eval suite",
    status: "working",
    assigneeId: "evalbot",
    caption: "Through 41 of 62 cases on the new flag",
    progress: { done: 41, total: 62 },
    sourceMessageId: "m_8",
    updated: "4m ago",
  },
  {
    id: "t_119",
    roomId: "room_capability_checks",
    title: "Archive the stale render tickets",
    status: "working",
    assigneeId: "zippy",
    caption: "Four of the nine moved, five to go",
    progress: { done: 4, total: 9 },
    sourceMessageId: "m_10",
    updated: "6m ago",
  },

  // Queued.
  {
    id: "t_116",
    roomId: "room_capability_checks",
    title: "Rewrite the retry backoff for permission errors",
    status: "queued",
    assigneeId: "dan",
    progress: { done: 0, total: 3 },
    sourceMessageId: "m_7",
    updated: "1h ago",
  },
  {
    id: "t_117",
    roomId: "room_capability_checks",
    title: "Diff the eval run against last night",
    status: "queued",
    assigneeId: "evalbot",
    progress: { done: 0, total: 2 },
    sourceMessageId: "m_9",
    updated: "4m ago",
  },

  // Done.
  {
    id: "t_121",
    roomId: "room_capability_checks",
    title: "Render the team portrait twice",
    status: "done",
    assigneeId: "media-lab",
    caption: "Both passes posted to the room",
    sourceMessageId: "m_2",
    updated: "Yesterday",
  },
  {
    id: "t_122",
    roomId: "room_capability_checks",
    title: "Sweep the overnight tool calls",
    status: "done",
    assigneeId: "triage",
    caption: "Four failures, all the same 403 shape",
    sourceMessageId: "m_7",
    updated: "3h ago",
  },
  {
    id: "t_125",
    roomId: "room_capability_checks",
    title: "Summarise the delegation thread for the changelog",
    status: "done",
    assigneeId: "yuki",
    caption: "Three lines, filed under unreleased",
    sourceMessageId: "m_11",
    updated: "Yesterday",
  },
  {
    id: "t_126",
    roomId: "room_capability_checks",
    title: "Note the open approval gate under known issues",
    status: "done",
    assigneeId: "yuki",
    caption: "One line, linked to the thread",
    sourceMessageId: "m_11",
    updated: "2h ago",
  },
  {
    id: "t_120",
    roomId: "room_capability_checks",
    title: "Merge the duplicate render tickets",
    status: "done",
    assigneeId: "zippy",
    caption: "Six filed against the inline path, now two",
    sourceMessageId: "m_10",
    updated: "20m ago",
  },

  /* ----------------------------------------------- room_release_train */

  {
    id: "t_131",
    roomId: "room_release_train",
    title: "Approve the release notes for 4.12",
    status: "needs-you",
    assigneeId: "yuki",
    caption: "Two entries have no owner listed",
    updated: "25m ago",
  },
  {
    id: "t_134",
    roomId: "room_release_train",
    title: "Run the pre-release eval gate",
    status: "blocked",
    assigneeId: "evalbot",
    caption: "Staging is three commits behind main",
    updated: "1h ago",
  },
  {
    id: "t_136",
    roomId: "room_release_train",
    title: "Write the changelog for 4.12",
    status: "working",
    assigneeId: "yuki",
    caption: "Seven of eleven merged pull requests written up",
    progress: { done: 7, total: 11 },
    updated: "12m ago",
  },
  {
    id: "t_137",
    roomId: "room_release_train",
    title: "Stage the 4.12 build for the eval gate",
    status: "working",
    assigneeId: "dan",
    caption: "Building against tonight's main",
    updated: "20m ago",
  },
  {
    id: "t_140",
    roomId: "room_release_train",
    title: "Diff the 4.12 eval run against 4.11",
    status: "queued",
    assigneeId: "evalbot",
    progress: { done: 0, total: 2 },
    updated: "1h ago",
  },
  {
    id: "t_141",
    roomId: "room_release_train",
    title: "Draft the upgrade note for the delegation flag",
    status: "queued",
    assigneeId: "yuki",
    progress: { done: 0, total: 4 },
    updated: "Yesterday",
  },
  {
    id: "t_144",
    roomId: "room_release_train",
    title: "Sign off the release banner artwork",
    status: "done",
    assigneeId: "mara",
    caption: "Signed off, the dark variant took a lighter rule",
    updated: "Yesterday",
  },

  /* ----------------------------------------------- room_design_review */

  {
    id: "t_148",
    roomId: "room_design_review",
    title: "File the review notes as tickets",
    status: "needs-you",
    assigneeId: "zippy",
    caption: "Needs a project before anything can be filed",
    updated: "40m ago",
  },
  {
    id: "t_150",
    roomId: "room_design_review",
    title: "Redraw the empty lane illustration",
    status: "blocked",
    assigneeId: "mara",
    caption: "Waiting on the final lane names",
    updated: "2h ago",
  },
  {
    id: "t_151",
    roomId: "room_design_review",
    title: "Build the board card at compact width",
    status: "working",
    assigneeId: "priya",
    caption: "Lane widths first, then the card inside them",
    progress: { done: 1, total: 2 },
    updated: "15m ago",
  },
  {
    id: "t_154",
    roomId: "room_design_review",
    title: "Archive the closed design tickets",
    status: "queued",
    assigneeId: "zippy",
    progress: { done: 0, total: 6 },
    updated: "Yesterday",
  },
  {
    id: "t_156",
    roomId: "room_design_review",
    title: "Review the room header tabs",
    status: "done",
    assigneeId: "mara",
    caption: "Three tabs fit, the badge moves under the name",
    updated: "Yesterday",
  },

  /* -------------------------------------------------- room_incidents */

  {
    id: "t_159",
    roomId: "room_incidents",
    title: "Confirm the render queue is drained",
    status: "needs-you",
    assigneeId: "triage",
    caption: "Two jobs look stale and I cannot tell whose they are",
    updated: "11m ago",
  },
  {
    id: "t_162",
    roomId: "room_incidents",
    title: "Reopen the render queue for retries",
    status: "blocked",
    assigneeId: "triage",
    caption: "The worker token is still coming back 403",
    updated: "50m ago",
  },
  {
    id: "t_163",
    roomId: "room_incidents",
    title: "Replay the failed calls against the fix",
    status: "working",
    assigneeId: "evalbot",
    caption: "18 of 44 replayed, no new failures",
    progress: { done: 18, total: 44 },
    updated: "3m ago",
  },
  {
    id: "t_166",
    roomId: "room_incidents",
    title: "Write up the 403 storm",
    status: "queued",
    assigneeId: "dan",
    progress: { done: 0, total: 3 },
    updated: "1h ago",
  },
  {
    id: "t_168",
    roomId: "room_incidents",
    title: "Page the on-call for the 403 storm",
    status: "done",
    assigneeId: "triage",
    caption: "Paged overnight, acknowledged in four minutes",
    updated: "Yesterday",
  },
  {
    id: "t_169",
    roomId: "room_incidents",
    title: "Rerun the eval suite after the token fix",
    status: "done",
    assigneeId: "evalbot",
    caption: "62 cases, no regressions",
    updated: "4h ago",
  },
];

/** The room's tasks, in the order they are written above. */
export function tasksForRoom(roomId: string): RoomTask[] {
  return ROOM_TASKS.filter((task) => task.roomId === roomId);
}
