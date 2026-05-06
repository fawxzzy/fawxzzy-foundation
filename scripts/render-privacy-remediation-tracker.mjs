#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputJsonPath = path.join(root, ".foundation/privacy-remediation-tracker.json");
const outputMdPath = path.join(root, ".foundation/privacy-remediation-tracker.md");

const severities = new Set(["low", "moderate", "high", "critical"]);
const statuses = new Set(["open", "planned", "in-progress", "blocked", "deferred", "resolved"]);
const privacyClaimPostures = new Set(["unclaimed", "draft", "proved", "blocked"]);

function parseArgs(argv) {
  const args = { input: null };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing path after --input.");
      }
      args.input = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!args.input) {
    throw new Error("Usage: node scripts/render-privacy-remediation-tracker.mjs --input <path>");
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

function isIsoTimestamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function normalizeRecommendedUpdates(items) {
  if (!Array.isArray(items)) {
    throw new Error("recommendedRegistryUpdates must be an array");
  }

  return items.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`recommendedRegistryUpdates[${index}] must be an object`);
    }
    if (typeof item.path !== "string" || item.path.length === 0) {
      throw new Error(`recommendedRegistryUpdates[${index}].path is required`);
    }
    if (typeof item.summary !== "string" || item.summary.length === 0) {
      throw new Error(`recommendedRegistryUpdates[${index}].summary is required`);
    }
    if (typeof item.requiresApproval !== "boolean") {
      throw new Error(`recommendedRegistryUpdates[${index}].requiresApproval must be boolean`);
    }

    return {
      path: item.path,
      summary: item.summary,
      requiresApproval: item.requiresApproval
    };
  });
}

function normalizeItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("items must include at least one remediation item");
  }

  return items.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`items[${index}] must be an object`);
    }
    if (typeof item.findingClass !== "string" || item.findingClass.length === 0) {
      throw new Error(`items[${index}].findingClass is required`);
    }
    if (!severities.has(item.severity)) {
      throw new Error(`items[${index}].severity must be low, moderate, high, or critical`);
    }
    if (!Array.isArray(item.affectedSurfaces) || item.affectedSurfaces.length === 0) {
      throw new Error(`items[${index}].affectedSurfaces must include at least one surface`);
    }
    if (typeof item.ownerRepo !== "string" || item.ownerRepo.length === 0) {
      throw new Error(`items[${index}].ownerRepo is required`);
    }
    if (!statuses.has(item.remediationStatus)) {
      throw new Error(`items[${index}].remediationStatus must be open, planned, in-progress, blocked, deferred, or resolved`);
    }
    for (const field of ["proposedNextAction", "riskIfIgnored", "evidenceReference"]) {
      if (typeof item[field] !== "string" || item[field].length === 0) {
        throw new Error(`items[${index}].${field} is required`);
      }
    }
    if (typeof item.requiresFitnessOrSupabaseAction !== "boolean") {
      throw new Error(`items[${index}].requiresFitnessOrSupabaseAction must be boolean`);
    }

    return {
      findingClass: item.findingClass,
      severity: item.severity,
      affectedSurfaces: item.affectedSurfaces.map((surface) => String(surface)),
      ownerRepo: item.ownerRepo,
      remediationStatus: item.remediationStatus,
      proposedNextAction: item.proposedNextAction,
      riskIfIgnored: item.riskIfIgnored,
      evidenceReference: item.evidenceReference,
      requiresFitnessOrSupabaseAction: item.requiresFitnessOrSupabaseAction
    };
  });
}

function normalizeTracker(tracker, inputPath) {
  if (!tracker || typeof tracker !== "object") {
    throw new Error("Privacy remediation tracker input must be an object");
  }
  if (tracker.schemaVersion !== 1) {
    throw new Error("Privacy remediation tracker schemaVersion must be 1");
  }
  if (tracker.status !== "proposal-only") {
    throw new Error("Privacy remediation tracker status must be proposal-only");
  }
  if (tracker.mutationAuthority !== "none") {
    throw new Error("Privacy remediation tracker mutationAuthority must be none");
  }
  if (!["example", "operator-capture"].includes(tracker.captureMode)) {
    throw new Error("Privacy remediation tracker captureMode must be example or operator-capture");
  }
  if (!isIsoTimestamp(tracker.generatedAt)) {
    throw new Error("Privacy remediation tracker generatedAt must be an ISO timestamp");
  }
  if (!tracker.input || typeof tracker.input !== "object") {
    throw new Error("Privacy remediation tracker input block is required");
  }
  if (!["example", "operator-capture"].includes(tracker.input.captureMode)) {
    throw new Error("Privacy remediation tracker input.captureMode must be example or operator-capture");
  }
  if (!isIsoTimestamp(tracker.input.generatedAt)) {
    throw new Error("Privacy remediation tracker input.generatedAt must be an ISO timestamp");
  }
  if (!tracker.project || typeof tracker.project !== "object") {
    throw new Error("Privacy remediation tracker project block is required");
  }
  for (const field of ["slug", "name", "ownerRepo"]) {
    if (typeof tracker.project[field] !== "string" || tracker.project[field].length === 0) {
      throw new Error(`project.${field} is required`);
    }
  }
  if (!isIsoTimestamp(tracker.project.observedAt)) {
    throw new Error("project.observedAt must be an ISO timestamp");
  }
  if (!privacyClaimPostures.has(tracker.privacyClaimPosture)) {
    throw new Error("privacyClaimPosture must be unclaimed, draft, proved, or blocked");
  }
  if (typeof tracker.summary !== "string" || tracker.summary.length === 0) {
    throw new Error("summary is required");
  }
  if (!Array.isArray(tracker.warnings)) {
    throw new Error("warnings must be an array");
  }
  if (!Array.isArray(tracker.blockers)) {
    throw new Error("blockers must be an array");
  }

  return {
    schemaVersion: 1,
    status: "proposal-only",
    mutationAuthority: "none",
    captureMode: tracker.captureMode,
    generatedAt: tracker.generatedAt,
    input: {
      path: tracker.input.path || inputPath,
      captureMode: tracker.input.captureMode,
      generatedAt: tracker.input.generatedAt
    },
    project: {
      slug: tracker.project.slug,
      name: tracker.project.name,
      ownerRepo: tracker.project.ownerRepo,
      observedAt: tracker.project.observedAt
    },
    privacyClaimPosture: tracker.privacyClaimPosture,
    summary: tracker.summary,
    items: normalizeItems(tracker.items),
    warnings: tracker.warnings.map((item) => String(item)),
    blockers: tracker.blockers.map((item) => String(item)),
    recommendedRegistryUpdates: normalizeRecommendedUpdates(tracker.recommendedRegistryUpdates)
  };
}

function renderMarkdown(tracker) {
  const lines = [
    "# Privacy Remediation Tracker",
    "",
    "- Status: `proposal-only`",
    "- Mutation authority: `none`",
    `- Generated: \`${tracker.generatedAt}\``,
    `- Input: \`${tracker.input.path}\``,
    `- Input capture mode: \`${tracker.input.captureMode}\``,
    "",
    "## Project",
    "",
    `- Slug: \`${tracker.project.slug}\``,
    `- Name: ${tracker.project.name}`,
    `- Owner repo: \`${tracker.project.ownerRepo}\``,
    `- Observed at: \`${tracker.project.observedAt}\``,
    `- Privacy claim posture: \`${tracker.privacyClaimPosture}\``,
    `- Summary: ${tracker.summary}`,
    "",
    "## Remediation Items",
    "",
    "| Finding class | Severity | Status | Owner repo | Requires action | Evidence reference |",
    "| --- | --- | --- | --- | --- | --- |"
  ];

  for (const item of tracker.items) {
    lines.push(`| \`${item.findingClass}\` | ${item.severity} | ${item.remediationStatus} | \`${item.ownerRepo}\` | ${item.requiresFitnessOrSupabaseAction ? "yes" : "no"} | \`${item.evidenceReference}\` |`);
    lines.push(`|  |  |  |  |  | Affected: ${item.affectedSurfaces.join(", ")} |`);
    lines.push(`|  |  |  |  |  | Next: ${item.proposedNextAction} |`);
    lines.push(`|  |  |  |  |  | Risk: ${item.riskIfIgnored} |`);
  }

  if (tracker.warnings.length > 0) {
    lines.push("", "## Warnings", "");
    for (const warning of tracker.warnings) {
      lines.push(`- ${warning}`);
    }
  }

  if (tracker.blockers.length > 0) {
    lines.push("", "## Blockers", "");
    for (const blocker of tracker.blockers) {
      lines.push(`- ${blocker}`);
    }
  }

  lines.push("", "## Recommended Registry Updates", "", "| Path | Approval | Summary |", "| --- | --- | --- |");
  for (const item of tracker.recommendedRegistryUpdates) {
    lines.push(`| \`${item.path}\` | ${item.requiresApproval ? "required" : "optional"} | ${item.summary} |`);
  }

  lines.push("", "## Operator Rule", "", "Review only. This tracker does not mutate Supabase, does not edit Fitness, and does not change the Foundation registry automatically.");
  return lines.join("\n") + "\n";
}

const { input } = parseArgs(process.argv.slice(2));
const inputPath = resolvePath(input);
const raw = await readFile(inputPath, "utf8");
const tracker = JSON.parse(raw);
const normalizedTracker = normalizeTracker(tracker, toRelativePath(inputPath));

await mkdir(path.dirname(outputJsonPath), { recursive: true });
await writeFile(outputJsonPath, JSON.stringify(normalizedTracker, null, 2) + "\n", "utf8");
await writeFile(outputMdPath, renderMarkdown(normalizedTracker), "utf8");

console.log(`Rendered ${toRelativePath(outputJsonPath)}`);
console.log(`Rendered ${toRelativePath(outputMdPath)}`);
