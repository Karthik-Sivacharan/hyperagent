"use client";

import Link from "next/link";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { WikiLinkTarget } from "@/lib/mock/wiki";

// The composed page body. Dreaming writes a small markdown dialect — headings,
// lists, tables, quotes, `[[topic|label]]` wikilinks and
// `[cite:memoryAtom:<id>]` citation stamps — so the renderer is a line parser
// here rather than a markdown dependency. Citations render as the footnote
// number the page's citation list gives them and open the atom drawer.

const INLINE =
  /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]|\[cite:memoryAtom:([^\]]+)\]|\*\*([^*]+)\*\*|`([^`]+)`|(?<![\w*])\*([^*\n]+)\*(?![\w*])/g;

export type InlineContext = {
  /** Citation number per atom id, in the order the page lists them. */
  cites: Map<string, number>;
  links: Record<string, WikiLinkTarget>;
  onAtom: (id: string) => void;
  /** Headings render their links as plain text, as the composer wrote them. */
  plainLinks?: boolean;
};

export function renderInline(text: string, ctx: InlineContext, keyPrefix = "i") {
  const out: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  let index = 0;

  while ((match = INLINE.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${index++}`;
    const [, linkKey, linkLabel, citeId, bold, code, em] = match;

    if (linkKey !== undefined) {
      const raw = linkKey.trim();
      const target = ctx.links[raw.toLowerCase().replace(/\s+/g, "-")];
      const label = linkLabel || target?.title || raw;
      if (ctx.plainLinks || !target?.slug) {
        out.push(
          <span key={key} className={cn(target ? "text-foreground underline decoration-border underline-offset-4 decoration-dotted" : undefined)}>
            {label}
          </span>,
        );
      } else {
        out.push(
          <Link
            key={key}
            href={`/wiki/${target.slug}`}
            className="text-foreground underline decoration-border underline-offset-4 transition-colors duration-(--duration-fast) ease-out-quart hover:decoration-brand-accent"
          >
            {label}
          </Link>,
        );
      }
    } else if (citeId !== undefined) {
      const id = citeId.trim();
      const number = ctx.cites.get(id);
      out.push(
        <CiteMark key={key} id={id} number={number} onAtom={ctx.onAtom} />,
      );
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
    last = INLINE.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function CiteMark({ id, number, onAtom }: { id: string; number?: number; onAtom: (id: string) => void }) {
  return (
    <sup>
      <Button
        variant="ghost"
        size="none"
        onClick={() => onAtom(id)}
        title={id}
        aria-label={`Open the atom this cites (${id})`}
        className="ml-0.5 rounded-xs bg-tint-10 px-1 text-[10px] leading-4 text-foreground-low tabular-nums hover:bg-brand-subtle hover:text-brand-subtle-foreground"
      >
        {number ?? "↗"}
      </Button>
    </sup>
  );
}

type Block =
  | { kind: "heading"; level: 2 | 3 | 4; id?: string; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] }
  | { kind: "quote"; text: string }
  | { kind: "table"; head: string[]; rows: string[][] }
  | { kind: "rule" };

const cells = (line: string) =>
  line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());

/** The `## ` headings of a body, in order, with the ids the article's contents rail links to. */
export function bodyHeadings(content: string) {
  return parseBlocks(content)
    .filter((block): block is Extract<Block, { kind: "heading" }> => block.kind === "heading" && block.level === 2)
    .map((block) => ({ id: block.id as string, text: block.text.replace(/\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g, (_, key, label) => label || key).replace(/[*`]/g, "") }));
}

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let paragraph: string[] = [];
  let quote: string[] = [];
  let table: { head: string[]; rows: string[][] } | null = null;
  let headingCount = 0;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push({ kind: "list", ...list });
    list = null;
  };
  const flushQuote = () => {
    if (quote.length) blocks.push({ kind: "quote", text: quote.join(" ") });
    quote = [];
  };
  const flushTable = () => {
    if (table) blocks.push({ kind: "table", ...table });
    table = null;
  };

  for (const raw of content.split("\n")) {
    const line = raw.replace(/\s+$/, "");

    if (/^\s*\|/.test(line)) {
      flushParagraph();
      flushList();
      flushQuote();
      if (/^\s*\|?\s*:?-{2,}/.test(line)) continue;
      if (!table) table = { head: cells(line), rows: [] };
      else table.rows.push(cells(line));
      continue;
    }
    flushTable();

    if (/^>\s?/.test(line)) {
      flushParagraph();
      flushList();
      quote.push(line.replace(/^>\s?/, ""));
      continue;
    }
    flushQuote();

    if (/^(-{3,}|\*{3,})$/.test(line.trim())) {
      flushParagraph();
      flushList();
      blocks.push({ kind: "rule" });
      continue;
    }
    const heading = line.match(/^(#{2,4})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length as 2 | 3 | 4;
      blocks.push({
        kind: "heading",
        level,
        id: level === 2 ? `sec-${headingCount++}` : undefined,
        text: heading[2],
      });
      continue;
    }
    if (/^#\s/.test(line)) {
      flushParagraph();
      flushList();
      continue;
    }
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      flushParagraph();
      const ordered = !bullet;
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push((bullet ?? numbered)![1]);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraph.push(line.trim());
  }

  flushParagraph();
  flushList();
  flushQuote();
  flushTable();
  return blocks;
}

export function WikiBody({ content, ctx }: { content: string; ctx: InlineContext }) {
  const blocks = parseBlocks(content);

  return (
    <div className="flex flex-col gap-4 text-sm leading-6 text-foreground">
      {blocks.map((block, index) => {
        const key = `b-${index}`;
        switch (block.kind) {
          case "heading": {
            if (block.level === 2) {
              return (
                <h2
                  key={key}
                  id={block.id}
                  className="mt-6 scroll-mt-24 border-t border-border-subtle pt-5 font-heading text-base text-foreground first:mt-0 first:border-0 first:pt-0"
                >
                  {renderInline(block.text, { ...ctx, plainLinks: true }, key)}
                </h2>
              );
            }
            const Tag = block.level === 3 ? "h3" : "h4";
            return (
              <Tag key={key} className="mt-2 font-heading text-sm text-foreground">
                {renderInline(block.text, { ...ctx, plainLinks: true }, key)}
              </Tag>
            );
          }
          case "paragraph":
            return <p key={key}>{renderInline(block.text, ctx, key)}</p>;
          case "list": {
            const Tag = block.ordered ? "ol" : "ul";
            return (
              <Tag
                key={key}
                className={cn(
                  "flex flex-col gap-1.5 pl-5",
                  block.ordered ? "list-decimal" : "list-disc",
                  "marker:text-foreground-low",
                )}
              >
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`} className="pl-1">
                    {renderInline(item, ctx, `${key}-${itemIndex}`)}
                  </li>
                ))}
              </Tag>
            );
          }
          case "quote":
            return (
              <blockquote key={key} className="border-l-2 border-border pl-4 text-muted-foreground">
                {renderInline(block.text, ctx, key)}
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
                            {renderInline(cell, ctx, `${key}-r-${rowIndex}-${cellIndex}`)}
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
      })}
    </div>
  );
}
