"use client";

import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { parseBlocks, type Block, type InlineContext } from "@/components/wiki/wiki-body";
import { TopicIcon } from "@/components/wiki/topic-chip";
import { CitePreview } from "@/components/wiki/v1/cite-preview";
import type { WikiAtom, WikiGroupId } from "@/lib/mock/wiki";

// The composed body in v1. The blocks are the original renderer's; two
// things differ inline. The first time the page names a Topic, the mention
// carries the Topic's type icon; the first time each section names it, the
// mention is underlined as a link; later mentions in that section are links
// in plain ink that underline on hover, so a section that names the same
// person nine times is not nine underlines. A citation previews its atom on
// hover or focus and opens the drawer on a click.

const INLINE =
  /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]|\[cite:memoryAtom:([^\]]+)\]|\*\*([^*]+)\*\*|`([^`]+)`|(?<![\w*])\*([^*\n]+)\*(?![\w*])/g;

export type BodyContext = InlineContext & {
  atoms: Record<string, WikiAtom>;
  linkGroups: Record<string, WikiGroupId>;
};

const FIRST = "text-foreground underline decoration-border underline-offset-4 transition-colors duration-(--duration-fast) ease-out-quart hover:decoration-brand-accent";
const REPEAT = "text-foreground decoration-border underline-offset-4 hover:underline";

/** The Topics already named: in the whole page (for the icon) and in this section (for the underline). */
type Seen = { page: Set<string>; section: Set<string> };

/** One run of inline text. A heading passes no `seen`: its mentions are plain text and do not count. */
function renderInline(text: string, ctx: BodyContext, keyPrefix: string, seen?: Seen) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let index = 0;
  let match: RegExpExecArray | null;
  const pattern = new RegExp(INLINE.source, "g");

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${index++}`;
    const [, linkKey, linkLabel, citeId, bold, code, em] = match;

    if (linkKey !== undefined) {
      const slugKey = linkKey.trim().toLowerCase().replace(/\s+/g, "-");
      const target = ctx.links[slugKey];
      const label = linkLabel || target?.title || linkKey.trim();
      if (!seen || !target) {
        out.push(<span key={key}>{label}</span>);
      } else {
        const first = !seen.section.has(slugKey);
        const introduce = !seen.page.has(slugKey);
        seen.section.add(slugKey);
        seen.page.add(slugKey);
        const content = introduce ? (
          <>
            <TopicIcon group={ctx.linkGroups[slugKey] ?? "concept"} className="mr-0.5 inline align-[-0.125em]" />
            {label}
          </>
        ) : (
          label
        );
        out.push(
          target.slug ? (
            <Link key={key} href={`/wiki/${target.slug}`} className={first ? FIRST : REPEAT}>
              {content}
            </Link>
          ) : (
            <span key={key}>{content}</span>
          ),
        );
      }
    } else if (citeId !== undefined) {
      const id = citeId.trim();
      out.push(<CitePreview key={key} id={id} number={ctx.cites.get(id)} atom={ctx.atoms[id]} onAtom={ctx.onAtom} />);
    } else if (bold !== undefined) {
      out.push(
        <strong key={key} className="font-medium text-foreground">
          {bold}
        </strong>,
      );
    } else if (code !== undefined) {
      out.push(
        <code key={key} className="rounded-xs bg-tint-10 px-1 py-0.5 text-label-12-mono">
          {code}
        </code>,
      );
    } else if (em !== undefined) {
      out.push(
        <em key={key} className="italic">
          {em}
        </em>,
      );
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderBlock(block: Block, key: string, ctx: BodyContext, seen: Seen) {
  switch (block.kind) {
    case "heading": {
      if (block.level === 2) {
        return (
          <h2
            key={key}
            id={block.id}
            className="mt-6 scroll-mt-24 border-t border-border-subtle pt-5 font-heading text-base text-foreground first:mt-0 first:border-0 first:pt-0"
          >
            {renderInline(block.text, ctx, key)}
          </h2>
        );
      }
      const Tag = block.level === 3 ? "h3" : "h4";
      return (
        <Tag key={key} className="mt-2 font-heading text-sm text-foreground">
          {renderInline(block.text, ctx, key)}
        </Tag>
      );
    }
    case "paragraph":
      return <p key={key}>{renderInline(block.text, ctx, key, seen)}</p>;
    case "list": {
      const Tag = block.ordered ? "ol" : "ul";
      return (
        <Tag
          key={key}
          className={cn("flex flex-col gap-1.5 pl-5", block.ordered ? "list-decimal" : "list-disc", "marker:text-foreground-low")}
        >
          {block.items.map((item, itemIndex) => (
            <li key={`${key}-${itemIndex}`} className="pl-1">
              {renderInline(item, ctx, `${key}-${itemIndex}`, seen)}
            </li>
          ))}
        </Tag>
      );
    }
    case "quote":
      return (
        <blockquote key={key} className="border-l-2 border-border pl-4 text-muted-foreground">
          {renderInline(block.text, ctx, key, seen)}
        </blockquote>
      );
    case "table":
      return (
        <div key={key} className="overflow-x-auto rounded-md shadow-edge">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border-subtle bg-tint-5">
                {block.head.map((cell, cellIndex) => (
                  <th key={`${key}-h-${cellIndex}`} className="px-3 py-2 text-label-12-caps text-foreground-low">
                    {renderInline(cell, ctx, `${key}-h-${cellIndex}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={`${key}-r-${rowIndex}`} className="border-b border-border-subtle last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td key={`${key}-r-${rowIndex}-${cellIndex}`} className="px-3 py-2 align-top text-foreground">
                      {renderInline(cell, ctx, `${key}-r-${rowIndex}-${cellIndex}`, seen)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "rule":
      return <hr key={key} className="border-border-subtle" />;
    default:
      return <Fragment key={key} />;
  }
}

export function BodyV1({ content, ctx }: { content: string; ctx: BodyContext }) {
  // Sections start at each `##`; the text before the first one is a section too.
  const nodes: React.ReactNode[] = [];
  const seen: Seen = { page: new Set<string>(), section: new Set<string>() };
  for (const [index, block] of parseBlocks(content).entries()) {
    if (block.kind === "heading" && block.level === 2) seen.section = new Set<string>();
    nodes.push(renderBlock(block, `b-${index}`, ctx, seen));
  }

  return <div className="flex flex-col gap-4 text-sm leading-6 text-foreground">{nodes}</div>;
}
