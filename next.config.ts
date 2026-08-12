import type { NextConfig } from "next";
import path from "path";

import { BASE_PATH } from "./lib/base-path";

// The GitHub account "xlab" is owned by an unrelated third party, so this repo
// (Bhargava1424/xlab.github.io) can never be a root-domain user/org Pages site —
// it deploys as a project page at bhargava1424.github.io/xlab.github.io/, which
// requires this prefix on every route/asset. If the repo or account is ever
// renamed, update BASE_PATH in lib/base-path.ts — that's the only place it's
// defined (SPEC.md §2/§1, decided 2026-08-11).
const nextConfig: NextConfig = {
  output: "export",
  basePath: BASE_PATH,
  assetPrefix: BASE_PATH,

  // Emit route/index.html instead of route.html so nested static routes
  // (e.g. /blog/<slug>) resolve unambiguously as directories on GitHub Pages.
  trailingSlash: true,

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
