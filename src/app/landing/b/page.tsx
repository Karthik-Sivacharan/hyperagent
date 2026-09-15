import type { Metadata } from "next";

import { LandingPageB } from "@/components/landing-v2/b/landing-page";

export const metadata: Metadata = {
  title: "Give every recurring job an agent · Hyperagent",
  description:
    "Each agent has its own computer and a brief you write once. It does the job on schedule, reports where your team talks, and holds anything risky until you approve it.",
};

// Landing v2, variant B. Outside the (app) route group like /landing: the
// root layout only, and src/lib/theme-routes.ts forces it light.
export default function Page() {
  return <LandingPageB />;
}
