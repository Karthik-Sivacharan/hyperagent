import { MaterialMark } from "@/components/brand/logo-motion/material-mark";
import { HomeComposer } from "@/components/home/home-composer";
import { QuickActions } from "@/components/home/quick-actions";

// The home screen (hyperagent.com/threads/new): the mark, the hero, the
// composer in its "Suggested for you" tray (home-composer.tsx) and the
// quick-action chips, centred in the window. Structure and classes follow
// docs/reference/pages/threads-new.html; the shell owns the mobile header
// above this scroll container.
//
// The live page also lists recent threads and a "See what Hyperagent is capable
// of building" showcase under the composer. Both are off for now, so the
// composer is the only thing on the page and sits in the middle of it rather
// than at the top of a list. RecentThreads and FeaturedShowcase stay in
// src/components/home/ for when they come back.
//
// The mark is the signup flow's MaterialMark at its 64px hero size, so the app
// greets you with the same object the signup flow ends on. It renders
// aria-hidden (no `label`): the sidebar already names the product.
//
// Centred with `my-auto`, not `justify-center`: in a window shorter than the
// block, `justify-center` overflows it upward as well as down, and the scroller
// cannot reach the part above its top edge, so the mark would be cut off and
// unreachable. Auto margins collapse to zero instead and the block starts at
// the top and scrolls.
export default function NewThreadPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="relative flex h-full flex-col items-center overflow-auto" style={{ scrollbarGutter: "stable" }}>
        <div className="flex w-full max-w-5xl flex-1 flex-col items-center px-6 py-12">
          <section className="my-auto flex w-full max-w-3xl flex-col gap-6">
            <div className="flex flex-col items-center gap-5">
              <MaterialMark size={64} className="block" />
              <h1 className="text-center font-display text-5xl text-balance text-foreground">
                Let&apos;s get to work.
              </h1>
            </div>
            <HomeComposer />
            <QuickActions />
          </section>
        </div>
      </div>
    </div>
  );
}
