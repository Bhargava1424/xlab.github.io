#!/usr/bin/env tsx
// Emits public/content-snapshot.json — the read view the Studio UI loads.
//
// The public site is a static export with no runtime filesystem, so the Studio cannot read
// content/ directly in the browser. This snapshot is generated at build time and served as
// a static asset alongside the site, which means it always matches exactly what is deployed.
//
// It includes draft and hidden records (Studio must be able to see and edit them); the site
// itself filters to published-only via lib/content/index.ts. Everything here is already
// public information — access/roster.yaml, which holds member identities and roles, is
// deliberately NOT part of content/ and never appears in this file.
//
// Runs automatically via the `prebuild` npm script.
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { loadAllRecords } from "../lib/content/index";

const OUT = path.join(process.cwd(), "public", "content-snapshot.json");

function gitRev(): string {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

const content = loadAllRecords();

const snapshot = {
  // Studio compares this against the live site's snapshot to tell whether an approved
  // change has finished deploying yet.
  generatedAt: new Date().toISOString(),
  commit: gitRev(),
  schemaVersion: 2,
  counts: {
    institutions: content.institutions.length,
    people: content.people.length,
    themes: content.researchThemes.length,
    projects: content.projects.length,
    publications: content.publications.length,
    posts: content.posts.length,
    recognitions: content.recognitions.length,
    service: content.service.length,
    courses: content.courses.length,
    sponsors: content.sponsors.length,
  },
  content,
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(snapshot), "utf-8");

const kb = Math.round(fs.statSync(OUT).size / 1024);
const total = Object.values(snapshot.counts).reduce((a, b) => a + b, 0);
console.log(`content-snapshot.json — ${total} records, ${kb} KB, commit ${snapshot.commit}`);
