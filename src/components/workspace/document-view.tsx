import { Fragment, type ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { DocumentBlock, WorkspaceDocument } from "@/lib/mock/workspace";

// A document artifact, read in place. On the site this is an <iframe> onto a
// separate page with its own sheet (a system font stack, slate greys); here it
// is the brand's reading type on the card's own surface, so it follows the
// theme and sits in the same vocabulary as the thread beside it. The site's
// measure is kept: 40px sides, 32px top, 32px between the header and each
// section, a hairline under every section heading and 16px after it.

// `**strong**` and `` `code` ``: the only two marks the mock copy uses.
function renderRuns(text: string): ReactNode {
  return text
    .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
    .filter(Boolean)
    .map((part, i) => {
      if (part.startsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
      return <Fragment key={i}>{part}</Fragment>;
    });
}

function Block({ block }: { block: DocumentBlock }) {
  switch (block.kind) {
    case "paragraph":
      return <p>{renderRuns(block.text)}</p>;
    case "list":
      return (
        <ul>
          {block.items.map((item) => (
            <li key={item}>{renderRuns(item)}</li>
          ))}
        </ul>
      );
    case "placeholder":
      return <p className="text-foreground-low">{block.text}</p>;
  }
}

export function DocumentView({ document }: { document: WorkspaceDocument }) {
  return (
    // Radix wraps the viewport's children in a `display: table` box that sizes
    // to its content; `block` keeps the column at the card's width
    // (thread-view.tsx and the agent panel reach into the same box).
    <ScrollArea className="size-full" viewportProps={{ className: "[&>div]:!block" }}>
      <article className="px-10 pt-8 pb-10">
        <header className="mb-8">
          <h1 className="font-heading text-2xl text-balance">
            <span aria-hidden="true" className="mr-2">
              {document.icon}
            </span>
            {document.title}
          </h1>
          <p className="mt-2 text-muted-foreground">{document.description}</p>
        </header>
        {document.sections.map((section) => (
          <section key={section.heading} className="mb-8 last:mb-0">
            <h2 className="mb-4 border-border-subtle border-b pb-1.5 font-heading text-xl">{section.heading}</h2>
            <div className="genui-prose">
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>
          </section>
        ))}
      </article>
    </ScrollArea>
  );
}
