import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev indicator sits bottom-left, over the sidebar's account row, and
  // shows up in every screenshot comparison; the clone has no use for it.
  devIndicators: false,
};

export default nextConfig;
