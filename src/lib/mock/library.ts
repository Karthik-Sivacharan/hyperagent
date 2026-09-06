export type SelectOption = { value: string; label: string };

// Filter menus on /library. The live account has no items, so only the
// closed triggers are captured in the dump; the first option of each menu is
// the label the trigger shows there.
export const librarySortOptions: SelectOption[] = [
  { value: "newest", label: "Newest" },
  { value: "oldest", label: "Oldest" },
  { value: "name", label: "Name" },
];

export const libraryTypeOptions: SelectOption[] = [
  { value: "all", label: "Type" },
  { value: "document", label: "Documents" },
  { value: "image", label: "Images" },
  { value: "code", label: "Code" },
  { value: "data", label: "Data" },
];

export const libraryVisibilityOptions: SelectOption[] = [
  { value: "all", label: "Visibility" },
  { value: "private", label: "Private" },
  { value: "team", label: "Team" },
];

export const librarySourceOptions: SelectOption[] = [
  { value: "all", label: "Source" },
  { value: "threads", label: "Threads" },
  { value: "agents", label: "Agents" },
  { value: "uploads", label: "Uploads" },
];
