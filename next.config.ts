import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // GitHub Pages static export — xlab.github.io is a user/org-level Pages site
  // served at the domain root, so no basePath/assetPrefix.
  output: "export",

  // Static export can't use the default Next.js image optimization API (no
  // server to run it). Images are served as-is from public/.
  images: {
    unoptimized: true,
  },

  // Pin the workspace root to this directory. labbench/schema-visualizer has
  // its own package.json + lockfile, which would otherwise make Next.js guess
  // the wrong monorepo root and warn/misbehave.
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
