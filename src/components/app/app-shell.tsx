import Link from "next/link";
import { IconEdit, IconMenu2 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { HyperagentMark } from "@/components/app/brand-icons";
import { Sidebar } from "@/components/app/sidebar";
import type { Workspace } from "@/components/app/workspace-switcher";
import { wikiWorkspace } from "@/lib/mock/wiki";

// The app frame from hyperagent.com: a full-height flex row with the glass
// gradient and a 1.5%-opacity fractal-noise overlay behind the sidebar and
// <main>. Pages own everything inside <main> (their own scroll container,
// header, padding), exactly as the site does.

// The workspaces the sidebar's switcher lists, the selected one first: the
// workspace the wiki's store describes, then the account's own space. Read
// here, on the server, so the sidebar (a client component) gets two plain
// rows and never the store itself.
const WORKSPACES: Workspace[] = [
  {
    id: "workspace",
    name: wikiWorkspace.name,
    detail: `${wikiWorkspace.memberCount} ${wikiWorkspace.memberCount === 1 ? "member" : "members"}`,
  },
  { id: "personal", name: "Personal" },
];

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex h-dvh-below-banners w-full touch-pan-y overflow-hidden"
      style={{ marginTop: "var(--fixed-banner-stack-height, 0px)", overscrollBehavior: "none" }}
    >
      <div className="absolute inset-0 bg-glass-gradient" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015] mix-blend-overlay"
        style={{ backgroundImage: NOISE }}
      />
      <div className="relative z-10 flex size-full flex-col md:flex-row">
        <Sidebar workspaces={WORKSPACES} />
        <main
          className="safe-area-top-below-banners-md flex flex-1 flex-col overflow-hidden"
          style={{ paddingRight: "env(safe-area-inset-right)" }}
        >
          <header className="safe-area-top-below-banners w-full glass-panel border-border-subtle border-b sticky top-0 z-40 md:hidden">
            <div className="flex h-14 items-center justify-between px-4">
              <Button variant="ghost" size="icon" className="size-10 shrink-0" aria-label="Open navigation menu">
                <IconMenu2 className="size-4" aria-hidden="true" />
              </Button>
              <Link className="group flex items-center gap-2" href="/threads/new">
                <HyperagentMark className="size-5 shrink-0 text-primary" />
                <span className="text-logo">Hyperagent</span>
              </Link>
              <Button variant="ghost" size="icon" className="size-10 shrink-0" aria-label="Create new thread">
                <IconEdit className="size-4" aria-hidden="true" />
              </Button>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
