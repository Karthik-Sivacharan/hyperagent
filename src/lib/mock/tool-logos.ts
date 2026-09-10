// Tool/product logos for the small integration tiles on an agent card (a row
// of ~24-32px square marks, like the "connected tools" strip on a Gumloop
// agent card). Static prototype, no runtime CDN: every file below lives in
// `public/tools/` so it ships with the app instead of depending on a
// third-party icon host at render time.
//
// Sources (fetched 2026-09-09):
//   - slack, figma: official multi-colour marks from Wikimedia Commons
//     (upload.wikimedia.org/wikipedia/commons/.../Slack_icon_2019.svg and
//     .../Figma-logo.svg) — full brand colours, no API key required.
//   - gmail, google-sheets, google-docs, google-calendar: Google's own
//     product-icon CDN (www.gstatic.com/images/branding/product/2x/
//     <name>_2020q4_48dp.png), 96x96 full-colour PNGs — no clean same-origin
//     SVG is published for these without an API key, hence PNG.
//   - notion, linear, github, hubspot: Simple Icons (cdn.simpleicons.org),
//     single-colour SVGs in the product's own brand hex — accurate, since
//     these marks are inherently single-tone.
//   - salesforce: CoreUI Icons brand set (via Wikimedia Commons), a
//     single-path outline recoloured here to Salesforce's brand blue
//     (#00A1E0) — simple-icons has dropped both "slack" and "salesforce"
//     (trademark takedown), so this and the Slack mark above use other
//     sources.
//   - airtable: airtable.com's own favicon (48x48 PNG), the real tri-colour
//     mark — simple-icons' Airtable glyph is single-colour only, and no
//     clean full-colour SVG is published elsewhere without an API key.
//   - app-store: Simple Icons, the glyph in Apple's own App Store blue.
//     Single-TONE but not monochrome, so it keeps its colour for the same
//     reason salesforce does (see the note below): the blue is the mark.
//   - linkedin: Wikimedia Commons (LinkedIn_icon.svg), the two-tone plate —
//     white wordmark on the brand blue. simple-icons has dropped this one
//     (trademark takedown), the same gap that sent slack and salesforce
//     elsewhere. The plate is what makes it legible at 12px on a tinted row:
//     a bare "in" glyph in blue disappears at that size.
//   - exa: exa.ai's own favicon, the 256px PNG inside `favicon.ico` (fetched
//     2026-09-10) — the real two-tone plate, a white mark on Exa's brand blue
//     (#1F40ED). simple-icons carries no Exa glyph at all, and the site
//     publishes no standalone SVG, so this follows airtable's precedent of
//     taking the vendor's own favicon. Same argument as linkedin for keeping
//     the plate: the white mark alone would have nothing to sit on at 12px.
//
// The last three arrived for the signup research rows
// (src/components/signup/research-signals.tsx), where the believable sources
// at signup are the public ones: a company's own site, its app-store listing,
// its open roles, the open web, and a neutral search index over that same web.
// Nothing is connected yet, so nothing here may claim to read an inbox or a
// repo the account has never authorised.
//
// Two of these are NOT full colour and must not be: Notion's and GitHub's
// marks are inherently monochrome, and both shipped from their sources as a
// hard-coded near-black (#000000 and #181717), which is invisible on the dark
// canvas. Both were rewritten to `fill="currentColor"` so they take the tile's
// text colour and flip with the theme. That is not a token bypass — it is what
// those two marks actually are. Any single-tone logo added here needs the same
// treatment; a logo with real brand colours (Slack, Gmail, Figma…) keeps them.
//
// Brand rule 10 (docs/brand/design.md §12): imagery is not tokenised — these
// keep each product's own colours rather than the app's palette.
//
// No allow-list entry is needed for that: scripts/brand/lint-tokens.mjs only
// walks `src/components` and `src/app` (its ROOTS), so nothing under
// `src/lib/mock` is scanned in the first place. A COMPONENT that inlines one
// of these marks as SVG would need to join the ALLOW list beside
// src/components/app/brand-icons.tsx — this manifest, which only holds paths
// to files in `public/`, does not.

export type ToolLogo = {
  id: string;
  name: string;
  src: string;
};

export const TOOL_LOGOS: Record<string, ToolLogo> = {
  slack: { id: "slack", name: "Slack", src: "/tools/slack.svg" },
  gmail: { id: "gmail", name: "Gmail", src: "/tools/gmail.png" },
  "google-sheets": { id: "google-sheets", name: "Google Sheets", src: "/tools/google-sheets.png" },
  "google-docs": { id: "google-docs", name: "Google Docs", src: "/tools/google-docs.png" },
  "google-calendar": { id: "google-calendar", name: "Google Calendar", src: "/tools/google-calendar.png" },
  notion: { id: "notion", name: "Notion", src: "/tools/notion.svg" },
  linear: { id: "linear", name: "Linear", src: "/tools/linear.svg" },
  github: { id: "github", name: "GitHub", src: "/tools/github.svg" },
  figma: { id: "figma", name: "Figma", src: "/tools/figma.svg" },
  hubspot: { id: "hubspot", name: "HubSpot", src: "/tools/hubspot.svg" },
  salesforce: { id: "salesforce", name: "Salesforce", src: "/tools/salesforce.svg" },
  airtable: { id: "airtable", name: "Airtable", src: "/tools/airtable.png" },
  "app-store": { id: "app-store", name: "the App Store", src: "/tools/app-store.svg" },
  linkedin: { id: "linkedin", name: "LinkedIn", src: "/tools/linkedin.svg" },
  exa: { id: "exa", name: "Exa", src: "/tools/exa.png" },
};
