// Temporary stand-in used by routes that have not been cloned yet, so the
// sidebar navigation works on every branch. Each page branch replaces its own.
export function PagePlaceholder({ title }: { title: string }) {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-8 py-6">
        <h1 className="font-semibold text-2xl text-foreground">{title}</h1>
        <p className="mt-2 text-muted-foreground text-sm">Not cloned yet.</p>
      </div>
    </div>
  );
}
