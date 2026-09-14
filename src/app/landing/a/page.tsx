import type { Metadata } from "next";

import { LandingPageA } from "@/components/landing-v2/a/landing-page";

export const metadata: Metadata = {
  title: "Hand off the weekly work · Hyperagent",
  description:
    "Each recurring job gets an agent with its own computer. It works in your tools, reports in Slack, and holds anything risky until you approve it.",
};

// Landing v2, variant A (product first). Outside the (app) route group like
// /landing: the root layout only, no app shell; src/lib/theme-routes.ts
// forces it light.
export default function Page() {
  return <LandingPageA />;
}
