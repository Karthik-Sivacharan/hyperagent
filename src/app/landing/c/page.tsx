import type { Metadata } from "next";

import { LandingPageC } from "@/components/landing-v2/c/landing-page";

export const metadata: Metadata = {
  title: "Hand off the weekly work | Hyperagent",
  description:
    "Each recurring job gets an agent with its own computer. It works in your tools, reports in Slack, and holds anything risky until you approve it.",
};

// Landing v2, variant C ("Ink"). Like /landing it lives outside the (app)
// route group: the root layout only, no app shell. src/lib/theme-routes.ts
// forces /landing/* light; the page wrapper puts `dark` back on its own
// subtree, so the whole page renders on the ink ground.
export default function Page() {
  return <LandingPageC />;
}
