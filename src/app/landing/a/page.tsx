import type { Metadata } from "next";

import { LandingPageA } from "@/components/landing-v2/a/landing-page";

export const metadata: Metadata = {
  title: "A team of agents for the weekly work · Hyperagent",
  description:
    "Hyperagent gives your business a team of agents with names and jobs. They do the recurring work, report back in Slack or email, and ask before anything that matters.",
};

// Landing v2, variant A (product first). Outside the (app) route group like
// /landing: the root layout only, no app shell; src/lib/theme-routes.ts
// forces it light.
export default function Page() {
  return <LandingPageA />;
}
