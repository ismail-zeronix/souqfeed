import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Loaded from node_modules at runtime rather than bundled.
  serverExternalPackages: ["bullmq"],
};

export default nextConfig;
