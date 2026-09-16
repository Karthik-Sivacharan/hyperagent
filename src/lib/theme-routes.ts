// Routes whose design has one theme. The app defaults to dark and lets the
// visitor choose (src/app/layout.tsx); a route listed here is shown in its
// theme whatever that choice is, and the choice itself is left untouched.
const LIGHT_ONLY_ROUTES = ["/landing"];

export function forcedThemeFor(pathname: string | null): "light" | undefined {
  if (!pathname) return undefined;
  const lightOnly = LIGHT_ONLY_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  return lightOnly ? "light" : undefined;
}
