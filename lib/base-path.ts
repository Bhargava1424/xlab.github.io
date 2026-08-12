// Single source of truth for where this site actually lives on GitHub Pages.
// The GitHub account "xlab" is owned by an unrelated third party (confirmed
// 2026-08-11), so this repo can never be a root-domain user/org Pages site —
// it deploys as a project page at <username>.github.io/<repo-name>/. If the
// GitHub account or the repo is ever renamed, this is the only place to update.
export const GITHUB_USERNAME = "Bhargava1424";
export const REPO_NAME = "xlab.github.io";

export const BASE_PATH = `/${REPO_NAME}`;
export const SITE_URL = `https://${GITHUB_USERNAME.toLowerCase()}.github.io${BASE_PATH}/`;

// next/image does NOT auto-prepend basePath to local asset src when
// images.unoptimized is true (a static-export requirement); every <Image src>
// built from a content/ path (not a Next.js-processed import) must route
// through this, or it 404s once deployed under the subpath.
export function withBasePath(assetPath: string): string {
  if (/^https?:\/\//.test(assetPath)) return assetPath;
  return `${BASE_PATH}${assetPath}`;
}
