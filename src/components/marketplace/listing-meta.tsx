import { IconDownload, IconStar } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { IconTile } from "@/components/ui/icon-tile";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ListingAuthor, ListingTags } from "@/lib/mock/marketplace";

// The pieces every marketplace card shares, transcribed from
// docs/reference/pages/marketplace.html and skills.html: the author row, the
// category / "+N" tag pills and the star + install counts. Phase 2 keeps the
// element tree and metrics and moves the skin onto the brand: the author line
// and the counts are third-tier provenance (`text-foreground-low`, figures in
// the mono label face) and the tags are secondary badges (docs/brand/
// design.md §4.1, §8).

/** next/image `fill` output: the img the site renders inside a sized box. */
export function FillImage({ src, className = "object-cover" }: { src: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt=""
      loading="lazy"
      decoding="async"
      className={className}
      src={src}
      style={{ position: "absolute", height: "100%", width: "100%", inset: 0, color: "transparent" }}
    />
  );
}

/** Wraps clamped text so hovering reveals the whole of it, as on the site. */
export function TextTooltip({ text, children }: { text: string; children: React.ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent className="max-w-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

export function AuthorAvatar({ author }: { author: ListingAuthor }) {
  if (author.avatarUrl) {
    return (
      <span className="relative size-5 shrink-0 overflow-hidden rounded-full bg-tint-10">
        <FillImage src={author.avatarUrl} />
      </span>
    );
  }
  // A letter on a tint ground: the third tier steps up to muted-foreground
  // there (design.md §4.1).
  return (
    <IconTile size="xs" shape="circle" tone="tint">
      {author.name.charAt(0).toUpperCase()}
    </IconTile>
  );
}

export function ListingAuthorRow({
  author,
  className = "flex items-center gap-2",
}: {
  author: ListingAuthor;
  className?: string;
}) {
  return (
    <div className={className}>
      <AuthorAvatar author={author} />
      <TextTooltip text={author.name}>
        <span className="truncate text-foreground-low text-sm">{author.name}</span>
      </TextTooltip>
    </div>
  );
}

export function ListingTagPills({ tags }: { tags: ListingTags }) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <Badge variant="secondary" className="min-w-0 shrink">
        <span className="min-w-0 truncate">{tags.category}</span>
      </Badge>
      {tags.more > 0 && <Badge variant="secondary">+{tags.more}</Badge>}
    </div>
  );
}

export function ListingStatPills({ stars, installs }: { stars: number; installs: number }) {
  return (
    <div className="flex flex-wrap items-center gap-y-4 overflow-hidden whitespace-nowrap max-h-4 gap-x-3 text-label-12-mono text-foreground-low shrink-0">
      <span className="flex items-center gap-1" aria-label={`${stars} stars`}>
        <IconStar className="shrink-0 size-4" aria-hidden="true" />
        {stars}
      </span>
      <span className="flex items-center gap-1" aria-label={`${installs} installs`}>
        <IconDownload className="size-4 shrink-0" aria-hidden="true" />
        {installs}
      </span>
    </div>
  );
}

/** Card footer: tag pills on the left, star + install counts on the right. */
export function ListingFooter({
  tags,
  stars,
  installs,
}: {
  tags: ListingTags;
  stars: number;
  installs: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <ListingTagPills tags={tags} />
      <ListingStatPills stars={stars} installs={installs} />
    </div>
  );
}
