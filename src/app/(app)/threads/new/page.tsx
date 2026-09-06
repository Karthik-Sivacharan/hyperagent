import { Composer } from "@/components/composer/composer";

// Foundation placeholder for the home screen: hero + composer only. The
// home-page branch replaces this with the full page (quick actions, recent
// threads, featured showcase) per docs/reference/pages/threads-new.html.
export default function NewThreadPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="relative flex h-full flex-col items-center overflow-auto" style={{ scrollbarGutter: "stable" }}>
        <div className="flex w-full max-w-5xl flex-1 flex-col items-center gap-24 px-6 py-12">
          <section className="flex w-full max-w-3xl flex-col gap-6 pt-8">
            <div className="flex flex-col items-center gap-4">
              <h1 className="font-display font-semibold tracking-[-0.01em] text-5xl text-foreground">
                Let&apos;s get to work.
              </h1>
            </div>
            <Composer />
          </section>
        </div>
      </div>
    </div>
  );
}
