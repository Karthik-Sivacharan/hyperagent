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
};
