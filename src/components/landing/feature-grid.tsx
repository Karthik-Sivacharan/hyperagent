import { AssetSlot } from "./asset-slot";
import type { Feature } from "./content";

// Four features in a row (two on a tablet, one on a phone): the picture, then
// a title and one sentence at the same size, the title in the first text
// tier. `numbered` makes the list ordered and prints 01, 02… above each
// title for sighted readers (the <ol> already says it to a screen reader).
export function FeatureGrid({ items, numbered = false }: { items: Feature[]; numbered?: boolean }) {
  const List = numbered ? "ol" : "ul";
  return (
    <List className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => (
        <li key={item.title} className="flex flex-col gap-5">
          {item.asset ? <AssetSlot asset={item.asset} className="aspect-4/3" /> : null}
          <div className="flex flex-col gap-1">
            {numbered ? (
              <span aria-hidden="true" className="text-md text-foreground-low tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
            ) : null}
            <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
            <p className="text-base text-muted-foreground">{item.body}</p>
          </div>
        </li>
      ))}
    </List>
  );
}
