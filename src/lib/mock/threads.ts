export type Thread = {
  id: string;
  title: string;
  summary: string;
  /** Human-relative label the site renders ("yesterday", "3 days ago"). */
  updatedLabel: string;
  updatedAt: string;
  messageCount: number;
  starred: boolean;
  model: string;
};

// The one thread on the live account when the reference was captured.
export const threads: Thread[] = [
  {
    id: "cmtlsm8nk0sn207ad13p8bpou",
    title: "Welcome to Hyperagent",
    summary:
      "Began an introductory interview to explore the assistant's capabilities and establish a productive working relationship.",
    updatedLabel: "yesterday",
    updatedAt: "2026-09-04T19:21:00-07:00",
    messageCount: 3,
    starred: false,
    model: "Opus 5",
  },
];

export const recentThreads = threads.slice(0, 5);
