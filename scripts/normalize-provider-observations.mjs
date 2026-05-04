#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const defaultOutputPath = path.join(root, ".foundation/provider-observations.normalized.json");
const defaultSummaryPath = path.join(root, ".foundation/provider-observations.normalized.md");

function timestamp(value) {
  const parsed = Date.parse(value ?? "");
  return Number.isNaN(parsed) ? null : parsed;
}

function isIsoTimestamp(value) {
  return typeof value === "string" && timestamp(value) !== null;
}

function parseArgs(argv) {
  const args = {
    input: null,
    output: defaultOutputPath,
    summary: defaultSummaryPath
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const value = argv[index + 1];

    if (arg === "--input") {
      if (!value || value.startsWith("--")) throw new Error("Missing path after --input.");
      args.input = value;
      index += 1;
      continue;
    }

    if (arg === "--output") {
      if (!value || value.startsWith("--")) throw new Error("Missing path after --output.");
      args.output = value;
      index += 1;
      continue;
    }

    if (arg === "--summary") {
      if (!value || value.startsWith("--")) throw new Error("Missing path after --summary.");
      args.summary = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!args.input) {
    throw new Error("Usage: node scripts/normalize-provider-observations.mjs --input <path> [--output <path>] [--summary <path>]");
  }

  return args;
}

function resolvePath(candidatePath) {
  return path.isAbsolute(candidatePath) ? candidatePath : path.resolve(root, candidatePath);
}

function toRelativePath(candidatePath) {
  const relative = path.relative(root, candidatePath);
  return relative && !relative.startsWith("..") ? relative.replaceAll("\\", "/") : candidatePath;
}

function validateCaptureEntry(sectionLabel, entry) {
  if (!entry || typeof entry !== "object") {
    throw new Error(`${sectionLabel}: entries must be objects`);
  }
  if (typeof entry.slug !== "string" || entry.slug.length === 0) {
    throw new Error(`${sectionLabel}: slug is required`);
  }
  if (!isIsoTimestamp(entry.observedAt)) {
    throw new Error(`${sectionLabel}:${entry.slug}: observedAt must be an ISO timestamp`);
  }
  if (typeof entry.status !== "string" || entry.status.length === 0) {
    throw new Error(`${sectionLabel}:${entry.slug}: status is required`);
  }
}

function validateCapturePack(pack) {
  if (!pack || typeof pack !== "object") {
    throw new Error("Capture pack must be an object");
  }
  if (pack.schemaVersion !== 1) {
    throw new Error("Capture pack schemaVersion must be 1");
  }
  if (!["example", "operator-capture"].includes(pack.captureMode)) {
    throw new Error("Capture pack captureMode must be example or operator-capture");
  }
  if (!["partial", "full"].includes(pack.coverage)) {
    throw new Error("Capture pack coverage must be partial or full");
  }
  if (!isIsoTimestamp(pack.generatedAt)) {
    throw new Error("Capture pack generatedAt must be an ISO timestamp");
  }
  if (!pack.source || typeof pack.source !== "object" || typeof pack.source.label !== "string" || pack.source.label.length === 0) {
    throw new Error("Capture pack source.label is required");
  }

  for (const [sectionLabel, entries] of [
    ["github.repos", pack.github?.repos ?? []],
    ["github.checks", pack.github?.checks ?? []],
    ["vercel.projects", pack.vercel?.projects ?? []],
    ["vercel.deployments", pack.vercel?.deployments ?? []],
    ["supabase.projects", pack.supabase?.projects ?? []]
  ]) {
    if (!Array.isArray(entries)) {
      throw new Error(`${sectionLabel} must be an array when present`);
    }
    for (const entry of entries) {
      validateCaptureEntry(sectionLabel, entry);
    }
  }
}

function ensureProject(map, slug, name) {
  if (!map.has(slug)) {
    map.set(slug, {
      slug,
      name: name ?? undefined
    });
  }
  const project = map.get(slug);
  if (!project.name && name) {
    project.name = name;
  }
  return project;
}

function copyFacetFields(entry, fields) {
  const facet = {
    observedAt: entry.observedAt,
    status: entry.status
  };

  if (entry.summary) {
    facet.summary = entry.summary;
  }

  for (const field of fields) {
    if (entry[field] !== undefined) {
      facet[field] = entry[field];
    }
  }

  return facet;
}

function buildNormalizedObservation(pack) {
  const projectMap = new Map();

  for (const entry of pack.github?.repos ?? []) {
    const project = ensureProject(projectMap, entry.slug, entry.name);
    project.githubRepo = copyFacetFields(entry, ["exists", "owner", "repo", "fullName", "url", "visibility", "defaultBranch"]);
    if (entry.repo && !project.githubRepo.name) {
      project.githubRepo.name = entry.repo;
    }
  }

  for (const entry of pack.github?.checks ?? []) {
    const project = ensureProject(projectMap, entry.slug, entry.name);
    project.githubChecks = copyFacetFields(entry, ["workflowName", "conclusion", "commitSha", "runId", "branch"]);
  }

  for (const entry of pack.vercel?.projects ?? []) {
    const project = ensureProject(projectMap, entry.slug, entry.name);
    project.vercelProject = copyFacetFields(entry, ["teamSlug", "projectNames", "projectIds"]);
  }

  for (const entry of pack.vercel?.deployments ?? []) {
    const project = ensureProject(projectMap, entry.slug, entry.name);
    project.vercelDeployment = copyFacetFields(entry, [
      "target",
      "projectName",
      "deploymentId",
      "alias",
      "githubCommitSha",
      "message",
      "gitDirty"
    ]);
  }

  for (const entry of pack.supabase?.projects ?? []) {
    const project = ensureProject(projectMap, entry.slug, entry.name);
    project.supabaseProject = copyFacetFields(entry, ["projectRef", "projectName", "region", "postgresVersion", "organization"]);
  }

  const projects = [...projectMap.values()].sort((left, right) => left.slug.localeCompare(right.slug));

  return {
    $schema: "../packages/contracts/provider-observations.schema.json",
    schemaVersion: 1,
    captureMode: pack.captureMode,
    coverage: pack.coverage,
    generatedAt: pack.generatedAt,
    source: {
      label: `${pack.source.label}-normalized`,
      summary: `Normalized from ${pack.source.label} using scripts/normalize-provider-observations.mjs. ${pack.source.summary ?? ""}`.trim()
    },
    projects
  };
}

function renderSummary(pack, normalized, inputPath, outputPath) {
  const lines = [
    "# Provider Observation Normalization Summary",
    "",
    `- Input capture: \`${inputPath}\``,
    `- Output observation: \`${outputPath}\``,
    `- Capture mode: \`${pack.captureMode}\``,
    `- Coverage: \`${pack.coverage}\``,
    `- Generated at: \`${pack.generatedAt}\``,
    "",
    "## Source Counts",
    "",
    `- GitHub repos: ${(pack.github?.repos ?? []).length}`,
    `- GitHub checks: ${(pack.github?.checks ?? []).length}`,
    `- Vercel projects: ${(pack.vercel?.projects ?? []).length}`,
    `- Vercel deployments: ${(pack.vercel?.deployments ?? []).length}`,
    `- Supabase projects: ${(pack.supabase?.projects ?? []).length}`,
    "",
    "## Normalized Projects",
    "",
    "| Slug | GitHub repo | GitHub checks | Vercel project | Vercel deployment | Supabase project |",
    "| --- | --- | --- | --- | --- | --- |"
  ];

  for (const project of normalized.projects) {
    lines.push(
      `| ${project.slug} | ${project.githubRepo ? "yes" : "-"} | ${project.githubChecks ? "yes" : "-"} | ${project.vercelProject ? "yes" : "-"} | ${project.vercelDeployment ? "yes" : "-"} | ${project.supabaseProject ? "yes" : "-"} |`
    );
  }

  lines.push("", "## Operator Rule", "", "Normalized observations are review inputs only. Use them with `pnpm foundation proof refresh --draft --observations <path>` and keep runtime outputs under `.foundation/`.");
  return lines.join("\n") + "\n";
}

const { input, output, summary } = parseArgs(process.argv.slice(2));
const inputPath = resolvePath(input);
const outputPath = resolvePath(output);
const summaryPath = resolvePath(summary);

const raw = await readFile(inputPath, "utf8");
const pack = JSON.parse(raw);
validateCapturePack(pack);

const normalized = buildNormalizedObservation(pack);

await mkdir(path.dirname(outputPath), { recursive: true });
await mkdir(path.dirname(summaryPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(normalized, null, 2) + "\n", "utf8");
await writeFile(summaryPath, renderSummary(pack, normalized, toRelativePath(inputPath), toRelativePath(outputPath)), "utf8");

console.log(`Normalized ${toRelativePath(inputPath)}`);
console.log(`Wrote ${toRelativePath(outputPath)}`);
console.log(`Wrote ${toRelativePath(summaryPath)}`);
