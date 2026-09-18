"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// The three ways into the same store: the pages dreaming composed, the runs
// that composed them, and the atoms underneath both. Only Pages shows for
// now; the other two routes still render when opened directly.

export function WikiTabs({ counts }: { counts: { pages: number; days: number; runs: number; atoms: number } }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/wiki", label: "Pages", note: String(counts.pages), active: !pathname.startsWith("/wiki/time") && !pathname.startsWith("/wiki/knowledge") },
    { href: "/wiki/time", label: "Over time", note: `${counts.days} days · ${counts.runs} runs`, active: pathname.startsWith("/wiki/time"), hidden: true },
    { href: "/wiki/knowledge", label: "Knowledge", note: `${counts.atoms.toLocaleString("en-US")} atoms`, active: pathname.startsWith("/wiki/knowledge"), hidden: true },
  ].filter((tab) => !tab.hidden);

  return (
    <nav aria-label="Wiki views" className="flex items-center gap-1 border-b border-border-subtle">
      {tabs.map((tab) => (
        <Button
          key={tab.href}
          variant="ghost"
          size="none"
          asChild
          className={cn(
            "h-auto gap-2 rounded-none border-b-2 border-transparent px-3 pb-2.5 text-sm font-normal text-muted-foreground hover:bg-transparent hover:text-foreground",
            tab.active && "border-foreground font-medium text-foreground",
          )}
        >
          <Link href={tab.href} aria-current={tab.active ? "page" : undefined}>
            {tab.label}
            <Badge variant="secondary">{tab.note}</Badge>
          </Link>
        </Button>
      ))}
    </nav>
  );
}
