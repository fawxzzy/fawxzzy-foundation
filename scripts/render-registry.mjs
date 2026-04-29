#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const registryPath = path.join(root, "data/projects.json");
const outputPath = path.join(root, "docs/architecture/PROJECT_REGISTRY.md");

function value(value) {
  if (value === null || value === undefined) return "unknown";
  if (typeof value === "boolean") return value ? "yes" : "no";
  return String(value);
}

function escapeMd(input) {
  return value(input).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function vercelLabel(project) {
  if (!project.vercel) return "-";
  if (project.vercel.projects?.length) return project.vercel.projects.map((item) => item.name).join(", ");
  return project.vercel.projectName ?? (project.vercel.exists ? "mapped" : "planned");
}

const registry = JSON.parse(await readFile(registryPath, "utf8"));
const projects = [...registry.projects].sort((a, b) => {
  if (a.priority !== b.priority) return a.priority - b.priority;
  return a.slug.localeCompare(b.slug);
});

const rows = projects.map((project) => [
  project.slug,
  project.name,
  project.kind,
  project.status,
  project.repo?.fullName ?? "-",
  value(project.repo?.exists),
  vercelLabel(project),
  project.nextActions?.[0] ?? "-"
]);

const md = `# Project Registry

Generated from \`data/projects.json\`. Do not hand-edit this file unless the generator is also updated.

Updated: ${registry.updatedAt}

## Summary

- Owner: ${registry.owner}
- Projects: ${projects.length}
- Active projects: ${projects.filter((project) => project.status === "active").length}
- Deployment-mapped projects: ${projects.filter((project) => project.vercel?.exists).length}

## Projects

| Slug | Name | Kind | Status | Repo | Repo exists | Vercel | First next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows.map((row) => `| ${row.map(escapeMd).join(" | ")} |`).join("\n")}

## Principles

${registry.principles.map((principle) => `- ${principle}`).join("\n")}
`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, md, "utf8");
console.log(`Rendered ${path.relative(root, outputPath)}`);
