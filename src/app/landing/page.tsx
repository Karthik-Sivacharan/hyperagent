import type { Metadata } from "next";

import { LandingPage } from "@/components/landing/landing-page";

export const metadata: Metadata = {
  title: "Hand off the weekly work · Hyperagent",
  description:
    "Each recurring job gets an agent with its own computer. It works in your tools, reports in Slack, and holds anything risky until you approve it.",
};

// Outside the (app) route group on purpose, like /signup: a marketing page
// gets the root layout only (fonts, theme, tooltips) and none of the app
// shell. src/lib/theme-routes.ts forces it light.
export default function Page() {
  return <LandingPage />;
}
