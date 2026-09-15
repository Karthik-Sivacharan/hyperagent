import type { Metadata } from "next";

import { LandingPageD } from "@/components/landing-v2/d/landing-page";

export const metadata: Metadata = {
  title: "A team of agents for the weekly work · Hyperagent",
  description:
    "Hyperagent gives your business a team of agents with names and jobs. They do the recurring work, report back in Slack or email, and ask before anything that matters.",
};

// Landing v2, variant D (variant A's copy, centred hero). Outside the (app)
// route group like /landing: the root layout only, no app shell;
// src/lib/theme-routes.ts forces it light.
export default function Page() {
  return <LandingPageD />;
}
