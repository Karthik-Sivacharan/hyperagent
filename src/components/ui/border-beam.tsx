"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { BorderBeam as Beam, type BorderBeamProps as BeamProps } from "border-beam";

// An animated light that travels the edge of whatever it wraps: the one child
// keeps its own box, corners and focus, and the beam is drawn around it in
// layers that ignore the pointer. `border-beam` (MIT, no dependencies) does the
// drawing; it styles itself with an inline <style> and CSS variables, so no
// Tailwind class of ours reaches the effect and none of its reaches our box.
//
// Two things the package cannot know are settled here:
//
// - The theme. Its `auto` reads prefers-color-scheme, but the app's theme is
//   next-themes' `.dark` on <html> (and a forced route such as /landing), so
//   the beam is told which one the page is actually in.
// - The first paint. The theme is written into the beam's stylesheet, and the
//   server cannot know it, so the beam stays off until the client has mounted
//   and then fades in on the right colours, rather than hydrating on the dark
//   tuning and swapping it on a light page.
//
// `mono` is the default because Brand spends one accent, rarely; the three
// hued palettes are there for a surface that has earned the colour.
//
// It renders a <style> and then the wrapper <div>, so a parent that styles its
// first child (`first:`, `space-y-*`) counts the <style>, not the wrapper.
//
// The package also sets `overflow: hidden` on the wrapper, which clips all a
// child paints outside its box: a `ring-*`, a `shadow-*`, the brand's glass
// edge. The composer lost its outline to it in light mode. Every beam layer
// already clips itself to the rounded box (clip-path, or its own radius), so
// the wrapper is set back to `visible` here, inline, because the package's
// unlayered <style> beats any Tailwind utility.

export type BorderBeamProps = Omit<BeamProps, "theme"> & {
  /** Force a tuning; omitted, the beam follows the app theme. */
  theme?: "light" | "dark";
};

const subscribeNever = () => () => {};

export function BorderBeam({
  theme,
  size = "md",
  colorVariant = "mono",
  active = true,
  style,
  ...props
}: BorderBeamProps) {
  const { resolvedTheme, forcedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribeNever,
    () => true,
    () => false,
  );
  // Until mount the server's guess, "dark", on both sides of hydration: the
  // client's first render already knows a stored light theme, and a tuning
  // that differed from the server's would be a hydration mismatch in the
  // <style>. The beam is off until then, so the placeholder is never seen.
  const current = (forcedTheme ?? resolvedTheme) === "light" ? "light" : "dark";
  const tuning = theme ?? (mounted ? current : "dark");

  return (
    <Beam
      data-slot="border-beam"
      data-size={size}
      data-variant={colorVariant}
      size={size}
      colorVariant={colorVariant}
      theme={tuning}
      active={mounted && active}
      style={{ overflow: "visible", ...style }}
      {...props}
    />
  );
}
