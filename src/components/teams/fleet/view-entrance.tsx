"use client";

import * as React from "react";

// Whether the view on screen should play its own first-paint entrance (the
// board's lanes rising one after another, the list's groups, the org chart's
// rank-by-rank fade and camera settle).
//
// One entrance per page visit, on the first view the page paints. Switching
// views after that is the page cross-fade's job (teams-page.tsx), so the view
// that arrives renders at rest inside it: two entrances stacked on one
// switch read as a stutter, and the brand's stagger is for first paint only
// (docs/brand/design.md §8). teams-page.tsx provides the value; a view reads
// it on mount (motion reads `initial` only then), so the flag flipping to
// false while a first view is still on screen changes nothing.

const ViewEntranceContext = React.createContext(false);

export const ViewEntranceProvider = ViewEntranceContext.Provider;

export function useViewEntrance(): boolean {
  return React.useContext(ViewEntranceContext);
}
