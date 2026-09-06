export type MemoryOwner = {
  id: string;
  name: string;
  count: number;
};

// Owners listed in the left column of /memories. The live account has only
// its personal space and no memories yet.
export const memoryOwners: MemoryOwner[] = [{ id: "personal", name: "Personal", count: 0 }];

export const memoryFilters = [
  { id: "pinned", label: "Pinned only" },
  { id: "agent", label: "Created by agents" },
  { id: "manual", label: "Added manually" },
];
