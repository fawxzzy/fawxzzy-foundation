#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputJsonPath = path.join(root, ".foundation/playbook-ingestion-draft.json");
const outputMdPath = path.join(root, ".foundation/playbook-ingestion-draft.md");

const receiptStatuses = new Set(["passed", "warning", "failed", "missing"]);
const artifactStatuses = new Set(["present", "partial", "missing"]);
const postureStates = new Set(["ready", "partial", "blocked"]);

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
    throw new Error("Usage: node scripts/render-playbook-ingestion-draft.mjs --input <path>");
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

function normalizeArtifact(item, label) {
  if (!item || typeof item !== "object") {
    throw new Error(`${label} artifact entry must be an object`);
  }
  if (typeof item.kind !== "string" || item.kind.length === 0) {
    throw new Error(`${label} artifact kind is required`);
  }
  if (typeof item.path !== "string" || item.path.length === 0) {
    throw new Error(`${label} artifact path is required`);
  }
  if (!artifactStatuses.has(item.status)) {
    throw new Error(`${label} artifact status must be present, partial, or missing`);
  }
  if (typeof item.summary !== "string" || item.summary.length === 0) {
    throw new Error(`${label} artifact summary is required`);
  }

  return {
    kind: item.kind,
    path: item.path,
    status: item.status,
    summary: item.summary
  };
}

function normalizeArtifactGroup(group, label) {
  if (!group || typeof group !== "object") {
    throw new Error(`${label} is required`);
  }
  if (!artifactStatuses.has(group.status)) {
    throw new Error(`${label}.status must be present, partial, or missing`);
  }
  if (!isIsoTimestamp(group.observedAt)) {
    throw new Error(`${label}.observedAt must be an ISO timestamp`);
  }
  if (typeof group.summary !== "string" || group.summary.length === 0) {
    throw new Error(`${label}.summary is required`);
  }
  if (!Array.isArray(group.items)) {
    throw new Error(`${label}.items must be an array`);
  }

  return {
    status: group.status,
    observedAt: group.observedAt,
    summary: group.summary,
    items: group.items.map((item, index) => normalizeArtifact(item, `${label}.items[${index}]`))
  };
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

function normalizeDraft(draft, inputPath) {
  if (!draft || typeof draft !== "object") {
    throw new Error("Playbook ingestion input must be an object");
  }
  if (draft.schemaVersion !== 1) {
    throw new Error("Playbook ingestion schemaVersion must be 1");
  }
  if (draft.status !== "proposal-only") {
    throw new Error("Playbook ingestion status must be proposal-only");
  }
  if (draft.mutationAuthority !== "none") {
    throw new Error("Playbook ingestion mutationAuthority must be none");
  }
  if (!["example", "operator-capture"].includes(draft.captureMode)) {
    throw new Error("Playbook ingestion captureMode must be example or operator-capture");
  }
  if (!isIsoTimestamp(draft.generatedAt)) {
    throw new Error("Playbook ingestion generatedAt must be an ISO timestamp");
  }
  if (!draft.input || typeof draft.input !== "object") {
    throw new Error("Playbook ingestion input block is required");
  }
  if (!["example", "operator-capture"].includes(draft.input.captureMode)) {
    throw new Error("Playbook ingestion input.captureMode must be example or operator-capture");
  }
  if (!isIsoTimestamp(draft.input.generatedAt)) {
    throw new Error("Playbook ingestion input.generatedAt must be an ISO timestamp");
  }
  if (!draft.playbook || typeof draft.playbook !== "object") {
    throw new Error("Playbook identity block is required");
  }
  if (!isIsoTimestamp(draft.playbook.observedAt)) {
    throw new Error("playbook.observedAt must be an ISO timestamp");
  }
  for (const field of ["slug", "name", "repoFullName", "visibility", "defaultBranch"]) {
    if (typeof draft.playbook[field] !== "string" || draft.playbook[field].length === 0) {
      throw new Error(`playbook.${field} is required`);
    }
  }
  if (!draft.verification || typeof draft.verification !== "object") {
    throw new Error("verification block is required");
  }
  if (!receiptStatuses.has(draft.verification.receiptStatus)) {
    throw new Error("verification.receiptStatus must be passed, warning, failed, or missing");
  }
  if (!isIsoTimestamp(draft.verification.observedAt)) {
    throw new Error("verification.observedAt must be an ISO timestamp");
  }
  for (const field of ["receiptPath", "command", "summary"]) {
    if (typeof draft.verification[field] !== "string" || draft.verification[field].length === 0) {
      throw new Error(`verification.${field} is required`);
    }
  }

  const commandArtifacts = normalizeArtifactGroup(draft.commandArtifacts, "commandArtifacts");
  const patternArtifacts = normalizeArtifactGroup(draft.patternArtifacts, "patternArtifacts");
  const policyArtifacts = normalizeArtifactGroup(draft.policyArtifacts, "policyArtifacts");

  if (!draft.posture || typeof draft.posture !== "object") {
    throw new Error("posture block is required");
  }
  if (!postureStates.has(draft.posture.readiness)) {
    throw new Error("posture.readiness must be ready, partial, or blocked");
  }
  if (!postureStates.has(draft.posture.policyCoverage)) {
    throw new Error("posture.policyCoverage must be ready, partial, or blocked");
  }
  if (!Array.isArray(draft.posture.warnings)) {
    throw new Error("posture.warnings must be an array");
  }
  if (!Array.isArray(draft.posture.blockers)) {
    throw new Error("posture.blockers must be an array");
  }
  if (typeof draft.posture.summary !== "string" || draft.posture.summary.length === 0) {
    throw new Error("posture.summary is required");
  }

  return {
    schemaVersion: 1,
    status: "proposal-only",
    mutationAuthority: "none",
    generatedAt: draft.generatedAt,
    input: {
      path: draft.input.path || inputPath,
      captureMode: draft.input.captureMode,
      generatedAt: draft.input.generatedAt
    },
    playbook: draft.playbook,
    verification: draft.verification,
    commandArtifacts,
    patternArtifacts,
    policyArtifacts,
    posture: {
      readiness: draft.posture.readiness,
      policyCoverage: draft.posture.policyCoverage,
      warnings: draft.posture.warnings.map((item) => String(item)),
      blockers: draft.posture.blockers.map((item) => String(item)),
      summary: draft.posture.summary
    },
    recommendedRegistryUpdates: normalizeRecommendedUpdates(draft.recommendedRegistryUpdates)
  };
}

function renderArtifactGroup(label, group, lines) {
  lines.push(`- ${label} status: \`${group.status}\``);
  lines.push(`- ${label} observed at: \`${group.observedAt}\``);
  lines.push(`- ${label} summary: ${group.summary}`);
  if (group.items.length > 0) {
    lines.push("", `### ${label} Items`, "", "| Kind | Path | Status | Summary |", "| --- | --- | --- | --- |");
    for (const item of group.items) {
      lines.push(`| ${item.kind} | \`${item.path}\` | ${item.status} | ${item.summary} |`);
    }
  }
}

function renderMarkdown(draft) {
  const lines = [
    "# Playbook Ingestion Draft",
    "",
    "- Status: `proposal-only`",
    "- Mutation authority: `none`",
    `- Generated: \`${draft.generatedAt}\``,
    `- Input: \`${draft.input.path}\``,
    `- Input capture mode: \`${draft.input.captureMode}\``,
    "",
    "## Playbook",
    "",
    `- Slug: \`${draft.playbook.slug}\``,
    `- Name: ${draft.playbook.name}`,
    `- Repo: \`${draft.playbook.repoFullName}\``,
    `- Visibility: \`${draft.playbook.visibility}\``,
    `- Default branch: \`${draft.playbook.defaultBranch}\``,
    `- Observed at: \`${draft.playbook.observedAt}\``,
    "",
    "## Verification",
    "",
    `- Receipt status: \`${draft.verification.receiptStatus}\``,
    `- Receipt path: \`${draft.verification.receiptPath}\``,
    `- Observed at: \`${draft.verification.observedAt}\``,
    `- Command: \`${draft.verification.command}\``,
    `- Summary: ${draft.verification.summary}`,
    "",
    "## Artifacts",
    ""
  ];

  renderArtifactGroup("Command artifacts", draft.commandArtifacts, lines);
  lines.push("");
  renderArtifactGroup("Pattern artifacts", draft.patternArtifacts, lines);
  lines.push("");
  renderArtifactGroup("Policy artifacts", draft.policyArtifacts, lines);

  lines.push("", "## Posture", "");
  lines.push(`- Readiness: \`${draft.posture.readiness}\``);
  lines.push(`- Policy coverage: \`${draft.posture.policyCoverage}\``);
  lines.push(`- Summary: ${draft.posture.summary}`);
  for (const warning of draft.posture.warnings) {
    lines.push(`- Warning: ${warning}`);
  }
  for (const blocker of draft.posture.blockers) {
    lines.push(`- Blocker: ${blocker}`);
  }

  lines.push("", "## Recommended Registry Updates", "", "| Path | Approval | Summary |", "| --- | --- | --- |");
  for (const item of draft.recommendedRegistryUpdates) {
    lines.push(`| \`${item.path}\` | ${item.requiresApproval ? "required" : "optional"} | ${item.summary} |`);
  }

  lines.push("", "## Operator Rule", "", "Review only. This draft does not execute Playbook and does not mutate the Foundation registry.");
  return lines.join("\n") + "\n";
}

const { input } = parseArgs(process.argv.slice(2));
const inputPath = resolvePath(input);
const raw = await readFile(inputPath, "utf8");
const draft = JSON.parse(raw);
const normalizedDraft = normalizeDraft(draft, toRelativePath(inputPath));

await mkdir(path.dirname(outputJsonPath), { recursive: true });
await writeFile(outputJsonPath, JSON.stringify(normalizedDraft, null, 2) + "\n", "utf8");
await writeFile(outputMdPath, renderMarkdown(normalizedDraft), "utf8");

console.log(`Rendered ${toRelativePath(outputJsonPath)}`);
console.log(`Rendered ${toRelativePath(outputMdPath)}`);
