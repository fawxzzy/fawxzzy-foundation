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

function renderPromotion(project) {
  const promotion = project.promotion;
  if (!promotion) return "";

  const lines = [`### ${project.name}`];

  lines.push(`- Current label: \`${promotion.label}\``);
  if (promotion.targetLabel) lines.push(`- Promotion target: \`${promotion.targetLabel}\``);
  if (promotion.blockedOn) lines.push(`- Blocked on: \`${promotion.blockedOn}\``);
  for (const note of promotion.notes ?? []) lines.push(`- ${note}`);
  if (promotion.sourceNote) lines.push(`- ${promotion.sourceNote}`);

  if (promotion.registryCommit?.sha && promotion.registryCommit?.message) {
    lines.push(
      `- ${promotion.registryCommit.label ?? "Registry commit"}: \`${promotion.registryCommit.sha}\` (${promotion.registryCommit.message})`
    );
  }

  if (promotion.vercelObservation?.projectName && promotion.vercelObservation?.status) {
    lines.push(`- Vercel project \`${promotion.vercelObservation.projectName}\`: ${promotion.vercelObservation.status}`);
  }

  if (promotion.vercelObservation?.visibleProjects?.length) {
    lines.push(`- Visible Vercel projects: ${promotion.vercelObservation.visibleProjects.map((item) => `\`${item}\``).join(", ")}`);
  }

  if (promotion.checklist?.length) {
    lines.push("", "| Gate | State |", "| --- | --- |");
    for (const item of promotion.checklist) {
      lines.push(`| ${escapeMd(item.label)} | ${item.done ? "[x]" : "[ ]"} |`);
    }
  }

  if (promotion.nextValidMove?.length) {
    lines.push("", "Next valid move:");
    for (const [index, step] of promotion.nextValidMove.entries()) {
      lines.push(`${index + 1}. ${step}`);
    }
  }

  return lines.join("\n");
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

const promotionSections = projects
  .map((project) => renderPromotion(project))
  .filter(Boolean)
  .join("\n\n");

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

${promotionSections ? `\n## Promotion Ledger\n\n${promotionSections}\n` : ""}

## Principles

${registry.principles.map((principle) => `- ${principle}`).join("\n")}
`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, md, "utf8");
console.log(`Rendered ${path.relative(root, outputPath)}`);
