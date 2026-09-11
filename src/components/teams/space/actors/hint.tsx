// The one line that says the map can be walked (docs/plans/2026-09-11-teams-space-v1.md
// §4). Quiet: third-tier text in a corner, taking no pointer. The map names
// it as its description, so a screen reader hears it on arriving.

export function SpaceHint({ id, className }: { id: string; className?: string }) {
  return (
    <p id={id} className={className}>
      Arrow keys to walk. Drag anyone to move them.
    </p>
  );
}
