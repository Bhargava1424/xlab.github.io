// Studio client configuration.
//
// CLIENT-SAFE. Nothing in lib/studio/** may import lib/content/index.ts or
// lib/content/loader.ts — those use fs and would break the browser bundle. Import
// lib/content/schema.ts instead; it is pure Zod.

/** The xlab-gate Worker. Holds the only GitHub credential; see workers/xlab-gate/. */
export const GATE_URL = "https://xlab-gate.xlab-studio.workers.dev";

/**
 * Build-time snapshot of all content, published as a static asset by
 * scripts/build-snapshot.ts. A static site has no runtime filesystem, so this is how
 * Studio reads what is currently live. It includes drafts; the public site filters them.
 */
export const SNAPSHOT_PATH = "/content-snapshot.json";

/** localStorage key for the session bearer token. */
export const TOKEN_KEY = "xlab-studio-token";
