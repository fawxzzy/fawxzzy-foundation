#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputJsonPath = path.join(root, ".foundation/lifeline-receipt-projection.json");
const outputMdPath = path.join(root, ".foundation/lifeline-receipt-projection.md");

const approvalStates = new Set(["approved", "pending", "not-required", "rejected", "unknown"]);
const executionStates = new Set(["succeeded", "warning", "failed", "pending", "not-run"]);
const healthcheckStates = new Set(["passed", "warning", "failed", "not-applicable", "unknown"]);
const rollbackStates = new Set(["available", "unavailable", "not-applicable", "unknown"]);
const riskClasses = new Set(["low", "moderate", "high", "critical", "unknown"]);

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
    throw new Error("Usage: node scripts/render-lifeline-receipt-projection.mjs --input <path>");
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

function normalizeProjection(input, inputPath) {
  if (!input || typeof input !== "object") {
    throw new Error("Lifeline receipt projection input must be an object");
  }
  if (input.schemaVersion !== 1) {
    throw new Error("Lifeline receipt projection schemaVersion must be 1");
  }
  if (input.status !== "proposal-only") {
    throw new Error("Lifeline receipt projection status must be proposal-only");
  }
  if (input.mutationAuthority !== "none") {
    throw new Error("Lifeline receipt projection mutationAuthority must be none");
  }
  if (!["example", "operator-capture"].includes(input.captureMode)) {
    throw new Error("Lifeline receipt projection captureMode must be example or operator-capture");
  }
  if (!isIsoTimestamp(input.generatedAt)) {
    throw new Error("Lifeline receipt projection generatedAt must be an ISO timestamp");
  }
  if (!input.input || typeof input.input !== "object") {
    throw new Error("Lifeline receipt projection input block is required");
  }
  if (!["example", "operator-capture"].includes(input.input.captureMode)) {
    throw new Error("Lifeline receipt projection input.captureMode must be example or operator-capture");
  }
  if (!isIsoTimestamp(input.input.generatedAt)) {
    throw new Error("Lifeline receipt projection input.generatedAt must be an ISO timestamp");
  }
  if (!input.lifeline || typeof input.lifeline !== "object") {
    throw new Error("Lifeline identity block is required");
  }
  if (!isIsoTimestamp(input.lifeline.observedAt)) {
    throw new Error("lifeline.observedAt must be an ISO timestamp");
  }
  for (const field of ["slug", "name", "repoFullName", "visibility", "defaultBranch"]) {
    if (typeof input.lifeline[field] !== "string" || input.lifeline[field].length === 0) {
      throw new Error(`lifeline.${field} is required`);
    }
  }
  if (!input.receipt || typeof input.receipt !== "object") {
    throw new Error("receipt block is required");
  }
  for (const field of ["targetRuntime", "environment", "action", "receiptId", "receiptPath", "summary"]) {
    if (typeof input.receipt[field] !== "string" || input.receipt[field].length === 0) {
      throw new Error(`receipt.${field} is required`);
    }
  }
  if (!approvalStates.has(input.receipt.approvalState)) {
    throw new Error("receipt.approvalState must be approved, pending, not-required, rejected, or unknown");
  }
  if (!executionStates.has(input.receipt.executionState)) {
    throw new Error("receipt.executionState must be succeeded, warning, failed, pending, or not-run");
  }
  if (!healthcheckStates.has(input.receipt.healthcheckState)) {
    throw new Error("receipt.healthcheckState must be passed, warning, failed, not-applicable, or unknown");
  }
  if (!rollbackStates.has(input.receipt.rollbackAvailability)) {
    throw new Error("receipt.rollbackAvailability must be available, unavailable, not-applicable, or unknown");
  }
  if (!riskClasses.has(input.receipt.riskClass)) {
    throw new Error("receipt.riskClass must be low, moderate, high, critical, or unknown");
  }
  if (!isIsoTimestamp(input.receipt.observedAt)) {
    throw new Error("receipt.observedAt must be an ISO timestamp");
  }
  if (!Array.isArray(input.warnings)) {
    throw new Error("warnings must be an array");
  }
  if (!Array.isArray(input.blockers)) {
    throw new Error("blockers must be an array");
  }

  return {
    schemaVersion: 1,
    status: "proposal-only",
    mutationAuthority: "none",
    captureMode: input.captureMode,
    generatedAt: input.generatedAt,
    input: {
      path: input.input.path || inputPath,
      captureMode: input.input.captureMode,
      generatedAt: input.input.generatedAt
    },
    lifeline: input.lifeline,
    receipt: input.receipt,
    warnings: input.warnings.map((item) => String(item)),
    blockers: input.blockers.map((item) => String(item)),
    recommendedRegistryUpdates: normalizeRecommendedUpdates(input.recommendedRegistryUpdates)
  };
}

function renderMarkdown(projection) {
  const lines = [
    "# Lifeline Receipt Projection",
    "",
    "- Status: `proposal-only`",
    "- Mutation authority: `none`",
    `- Generated: \`${projection.generatedAt}\``,
    `- Input: \`${projection.input.path}\``,
    `- Input capture mode: \`${projection.input.captureMode}\``,
    "",
    "## Lifeline",
    "",
    `- Slug: \`${projection.lifeline.slug}\``,
    `- Name: ${projection.lifeline.name}`,
    `- Repo: \`${projection.lifeline.repoFullName}\``,
    `- Visibility: \`${projection.lifeline.visibility}\``,
    `- Default branch: \`${projection.lifeline.defaultBranch}\``,
    `- Observed at: \`${projection.lifeline.observedAt}\``,
    "",
    "## Receipt",
    "",
    `- Target runtime: \`${projection.receipt.targetRuntime}\``,
    `- Environment: \`${projection.receipt.environment}\``,
    `- Action: \`${projection.receipt.action}\``,
    `- Receipt ID: \`${projection.receipt.receiptId}\``,
    `- Receipt path: \`${projection.receipt.receiptPath}\``,
    `- Approval state: \`${projection.receipt.approvalState}\``,
    `- Execution state: \`${projection.receipt.executionState}\``,
    `- Healthcheck state: \`${projection.receipt.healthcheckState}\``,
    `- Rollback availability: \`${projection.receipt.rollbackAvailability}\``,
    `- Risk class: \`${projection.receipt.riskClass}\``,
    `- Observed at: \`${projection.receipt.observedAt}\``,
    `- Summary: ${projection.receipt.summary}`
  ];

  if (projection.warnings.length > 0) {
    lines.push("", "## Warnings", "");
    for (const warning of projection.warnings) {
      lines.push(`- ${warning}`);
    }
  }

  if (projection.blockers.length > 0) {
    lines.push("", "## Blockers", "");
    for (const blocker of projection.blockers) {
      lines.push(`- ${blocker}`);
    }
  }

  lines.push("", "## Recommended Registry Updates", "", "| Path | Approval | Summary |", "| --- | --- | --- |");
  for (const item of projection.recommendedRegistryUpdates) {
    lines.push(`| \`${item.path}\` | ${item.requiresApproval ? "required" : "optional"} | ${item.summary} |`);
  }

  lines.push("", "## Operator Rule", "", "Review only. This projection does not execute Lifeline and does not mutate the Foundation registry.");
  return lines.join("\n") + "\n";
}

const { input } = parseArgs(process.argv.slice(2));
const inputPath = resolvePath(input);
const raw = await readFile(inputPath, "utf8");
const projection = JSON.parse(raw);
const normalizedProjection = normalizeProjection(projection, toRelativePath(inputPath));

await mkdir(path.dirname(outputJsonPath), { recursive: true });
await writeFile(outputJsonPath, JSON.stringify(normalizedProjection, null, 2) + "\n", "utf8");
await writeFile(outputMdPath, renderMarkdown(normalizedProjection), "utf8");

console.log(`Rendered ${toRelativePath(outputJsonPath)}`);
console.log(`Rendered ${toRelativePath(outputMdPath)}`);
