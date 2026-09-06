import type { Metadata } from "next";
import { MarketplacePage } from "@/components/marketplace/marketplace-page";

export const metadata: Metadata = {
  title: "Marketplace | Hyperagent",
};

export default function Page() {
  return <MarketplacePage />;
}
