// The one surface every control floating on the wallpaper wears: the filter
// pill, the layout switch, the Browser pill and the dock.
//
// The site spells it `border-white/40 bg-white/40 backdrop-blur-[100px]
// dark:border-white/10 dark:bg-black/40`. Here it is the brand's glass: the
// elevated surface at 40% (white in light, neutral-900 in dark, so the fill is
// sand rather than steel and flips with the theme on its own), the brand's
// highlight as the rim (white at .5 / .15, the same rim the brand's shadows
// use), and the glass blur token. Over a wallpaper that is already soft, a 12px
// blur and the site's 100px read the same.
export const GLASS = "border border-(--highlight) bg-surface-elevated/40 backdrop-blur-glass";

// Text on that glass. The wallpaper stays light in both themes, so the brand's
// muted tiers (neutral-400 / -500 in dark) sink into the glass; these are the
// first tier at the site's strengths instead.
export const ON_GLASS = "text-foreground";
export const ON_GLASS_QUIET = "text-foreground/70";
export const ON_GLASS_LOW = "text-foreground/50";
