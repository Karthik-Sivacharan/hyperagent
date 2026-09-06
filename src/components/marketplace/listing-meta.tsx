import { Download, Star } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { ListingAuthor, ListingTags } from "@/lib/mock/marketplace";

// The pieces every marketplace card shares, transcribed from
// docs/reference/pages/marketplace.html and skills.html: the author row, the
// category / "+N" tag pills and the star + install counts. Keep the class
// strings verbatim; they are the source of the pixel match.

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
      <span className="relative size-5 shrink-0 overflow-hidden rounded-full bg-muted">
        <FillImage src={author.avatarUrl} />
      </span>
    );
  }
  return (
    <div
      data-slot="icon-tile"
      className="flex shrink-0 items-center justify-center size-5 rounded-full bg-muted text-muted-foreground font-medium text-[10px]"
    >
      {author.name.charAt(0).toUpperCase()}
    </div>
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
        <span className="truncate text-muted-foreground text-sm">{author.name}</span>
      </TextTooltip>
    </div>
  );
}

export function ListingTagPills({ tags }: { tags: ListingTags }) {
  return (
    <div className="flex min-w-0 items-center gap-1">
      <span className="rounded-[4px] bg-muted-foreground/10 px-1.5 py-0.5 text-xs text-muted-foreground truncate">
        {tags.category}
      </span>
      {tags.more > 0 && (
        <span className="rounded-[4px] bg-muted-foreground/10 px-1.5 py-0.5 text-xs text-muted-foreground shrink-0">
          +{tags.more}
        </span>
      )}
    </div>
  );
}

export function ListingStatPills({ stars, installs }: { stars: number; installs: number }) {
  return (
    <div className="flex flex-wrap items-center gap-y-4 overflow-hidden whitespace-nowrap max-h-4 gap-x-3 text-foreground text-xs shrink-0">
      <span className="flex items-center gap-1" aria-label={`${stars} stars`}>
        <Star className="shrink-0 text-muted-foreground size-4" aria-hidden="true" />
        {stars}
      </span>
      <span className="flex items-center gap-1" aria-label={`${installs} installs`}>
        <Download className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
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
