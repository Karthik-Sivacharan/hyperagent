// Dates and counts as v1 prints them. Store timestamps carry no zone and are
// read as local wall time, so the server and the browser print the same day.

const day = (value: string) => new Date(`${value.slice(0, 10)}T00:00:00`);

/** "Nov 15" */
export const fmtDay = (value: string | null) =>
  value ? day(value).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "none";

/** "Sep 3, 14:46" */
export const fmtStamp = (value: string | null) =>
  value
    ? `${new Date(value.slice(0, 19)).toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${value.slice(11, 16)}`
    : "none";

/** "Nov 2 – Nov 16" */
export const fmtWindow = (start: string, end: string) => `${fmtDay(start)} – ${fmtDay(end)}`;

export const fmtInt = (value: number) => value.toLocaleString("en-US");
