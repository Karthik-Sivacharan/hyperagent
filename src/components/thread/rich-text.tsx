import { Fragment, type ReactNode } from "react";

// The site renders assistant markdown through a markdown pipeline. The mock
// strings only use bold runs (**like this**), so a split on the markers is all
// the clone needs; no markdown library.
export function renderInline(text: string): ReactNode {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      ),
    );
}
