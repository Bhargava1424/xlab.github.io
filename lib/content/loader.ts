// Low-level file readers for content/. Everything here is filesystem + parsing only —
// no Zod validation (that happens in index.ts, where errors from every file are
// collected and reported together instead of failing on the first one found).
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { load as loadYaml } from "js-yaml";
import type { ZodType } from "zod";

const CONTENT_ROOT = path.join(process.cwd(), "content");

export class ContentValidationError extends Error {}

/** Parse+validate a single value against a schema, tagging errors with their source file. */
export function validateOrCollect<T>(
  schema: ZodType<T>,
  value: unknown,
  sourceLabel: string,
  errors: string[]
): T | undefined {
  const result = schema.safeParse(value);
  if (!result.success) {
    for (const issue of result.error.issues) {
      const at = issue.path.length ? ` at "${issue.path.join(".")}"` : "";
      errors.push(`${sourceLabel}${at}: ${issue.message}`);
    }
    return undefined;
  }
  return result.data;
}

/** Throw a single aggregated error if any validation errors were collected. */
export function assertNoErrors(errors: string[], context: string): void {
  if (errors.length > 0) {
    throw new ContentValidationError(
      `Content validation failed (${context}) — ${errors.length} error(s):\n` +
        errors.map((e) => `  - ${e}`).join("\n")
    );
  }
}

function absPath(relativePath: string): string {
  return path.join(CONTENT_ROOT, relativePath);
}

/** Read+parse a single YAML file relative to content/. Returns undefined if missing. */
export function readYaml(relativePath: string): unknown {
  const full = absPath(relativePath);
  if (!fs.existsSync(full)) return undefined;
  const raw = fs.readFileSync(full, "utf-8");
  return loadYaml(raw);
}

/** Read+parse every *.yaml/*.yml file directly inside a directory relative to content/. */
export function readYamlDir(
  relativeDir: string
): { file: string; data: unknown }[] {
  const full = absPath(relativeDir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .sort()
    .map((file) => ({
      file: path.join(relativeDir, file),
      data: loadYaml(fs.readFileSync(path.join(full, file), "utf-8")),
    }));
}

/** Read+parse every *.mdx file directly inside a directory relative to content/. */
export function readMdxDir(
  relativeDir: string
): { file: string; frontmatter: unknown; body: string }[] {
  const full = absPath(relativeDir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .sort()
    .map((file) => {
      const raw = fs.readFileSync(path.join(full, file), "utf-8");
      const { data, content } = matter(raw);
      return { file: path.join(relativeDir, file), frontmatter: data, body: content.trim() };
    });
}
