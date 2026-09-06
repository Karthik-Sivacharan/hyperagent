import { threads, type Thread } from "@/lib/mock/threads";

export type LearningAgentFilter = { id: string; label: string };

// Agent pills in the /learning filter bar. The live account has no agents,
// so the only choices are "All" and threads with no agent.
export const learningAgentFilters: LearningAgentFilter[] = [
  { id: "all", label: "All" },
  { id: "none", label: "No Agent" },
];

// Threads the learning page lists: every thread on the account, none of
// which is owned by an agent.
export const learningThreads: (Thread & { agentId: string | null })[] = threads.map((thread) => ({
  ...thread,
  agentId: null,
}));
