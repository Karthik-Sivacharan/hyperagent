import type { Metadata } from "next";

import { SignupScreen } from "@/components/signup/signup-screen";

export const metadata: Metadata = {
  title: "Sign up · Hyperagent",
  description: "Create a Hyperagent account.",
};

// Outside the (app) route group on purpose: an account gate gets the root
// layout only (fonts, theme, tooltips) and none of the app shell, so the
// column sits on an otherwise empty canvas.
export default function Page() {
  return <SignupScreen />;
}
