#!/usr/bin/env node
import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputJsonPath = path.join(root, ".foundation/registry-change-bundle.json");
const outputMdPath = path.join(root, ".foundation/registry-change-bundle.md");

const bundleStatuses = new Set(["proposed", "approved", "rejected", "superseded"]);
const sourceKinds = new Set(["proof-refresh-draft", "provider-observation", "supabase-inventory-draft", "manual"]);
const operationTypes = new Set(["add", "replace", "remove"]);
const evidenceKinds = new Set([
  "proof-refresh-draft",
  "provider-observation",
  "supabase-advisor",
  "supabase-inventory-draft",
  "deployment-proof",
  "manual-note"
]);
const approvalStatuses = new Set(["pending", "approved", "rejected", "superseded"]);
const sha256Pattern = /^[a-f0-9]{64}$/i;

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
    throw new Error("Usage: node scripts/render-registry-change-bundle.mjs --input <path>");
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

async function exists(candidatePath) {
  try {
    await access(candidatePath);
    return true;
  } catch {
    return false;
  }
}

async function sha256File(candidatePath) {
  const raw = await readFile(candidatePath);
  return createHash("sha256").update(raw).digest("hex");
}

async function normalizeSource(source) {
  if (!source || typeof source !== "object") {
    throw new Error("Registry change bundle source is required");
  }
  if (!sourceKinds.has(source.kind)) {
    throw new Error("Registry change bundle source.kind must be proof-refresh-draft, provider-observation, supabase-inventory-draft, or manual");
  }
  if (typeof source.path !== "string" || source.path.length === 0) {
    throw new Error("Registry change bundle source.path is required");
  }
  if (typeof source.summary !== "string" || source.summary.length === 0) {
    throw new Error("Registry change bundle source.summary is required");
  }

  const absolutePath = resolvePath(source.path);
  const fileExists = await exists(absolutePath);
  let sha256 = source.sha256;

  if ((sha256 === undefined || sha256 === null || sha256 === "auto") && fileExists) {
    sha256 = await sha256File(absolutePath);
  }

  if (typeof sha256 !== "string" || !sha256Pattern.test(sha256)) {
    throw new Error("Registry change bundle source.sha256 must be a 64 character hexadecimal string");
  }

  if (fileExists) {
    const actualSha = await sha256File(absolutePath);
    if (actualSha !== sha256) {
      throw new Error(`Registry change bundle source SHA-256 does not match ${toRelativePath(absolutePath)}`);
    }
  }

  return {
    kind: source.kind,
    path: toRelativePath(absolutePath),
    sha256,
    summary: source.summary
  };
}

function normalizeAffectedProjects(affectedProjects) {
  if (!Array.isArray(affectedProjects) || affectedProjects.length === 0) {
    throw new Error("Registry change bundle affectedProjects must include at least one project slug");
  }

  const unique = [...new Set(affectedProjects.map((value) => String(value)))];
  if (unique.some((value) => value.length === 0)) {
    throw new Error("Registry change bundle affectedProjects entries must be non-empty strings");
  }
  return unique;
}

function normalizeOperations(operations) {
  if (!Array.isArray(operations) || operations.length === 0) {
    throw new Error("Registry change bundle operations must include at least one change operation");
  }

  return operations.map((operation, index) => {
    if (!operation || typeof operation !== "object") {
      throw new Error(`Registry change bundle operation ${index + 1} must be an object`);
    }
    if (!operationTypes.has(operation.op)) {
      throw new Error(`Registry change bundle operation ${index + 1} op must be add, replace, or remove`);
    }
    if (typeof operation.path !== "string" || operation.path.length === 0) {
      throw new Error(`Registry change bundle operation ${index + 1} path is required`);
    }
    if (typeof operation.summary !== "string" || operation.summary.length === 0) {
      throw new Error(`Registry change bundle operation ${index + 1} summary is required`);
    }
    if (typeof operation.requiresReview !== "boolean") {
      throw new Error(`Registry change bundle operation ${index + 1} requiresReview must be boolean`);
    }

    return {
      op: operation.op,
      path: operation.path,
      summary: operation.summary,
      requiresReview: operation.requiresReview
    };
  });
}

function normalizeEvidence(evidence) {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    throw new Error("Registry change bundle evidence must include at least one reference");
  }

  return evidence.map((entry, index) => {
    if (!entry || typeof entry !== "object") {
      throw new Error(`Registry change bundle evidence ${index + 1} must be an object`);
    }
    if (!evidenceKinds.has(entry.kind)) {
      throw new Error(`Registry change bundle evidence ${index + 1} kind must be supported`);
    }
    if (typeof entry.summary !== "string" || entry.summary.length === 0) {
      throw new Error(`Registry change bundle evidence ${index + 1} summary is required`);
    }
    if (typeof entry.reference !== "string" || entry.reference.length === 0) {
      throw new Error(`Registry change bundle evidence ${index + 1} reference is required`);
    }

    return {
      kind: entry.kind,
      summary: entry.summary,
      reference: toRelativePath(resolvePath(entry.reference))
    };
  });
}

function normalizeApproval(bundleStatus, approval) {
  if (!approval || typeof approval !== "object") {
    throw new Error("Registry change bundle approval is required");
  }
  if (typeof approval.required !== "boolean") {
    throw new Error("Registry change bundle approval.required must be boolean");
  }
  if (!approvalStatuses.has(approval.status)) {
    throw new Error("Registry change bundle approval.status must be pending, approved, rejected, or superseded");
  }
  if (approval.approvedBy !== null && approval.approvedBy !== undefined && typeof approval.approvedBy !== "string") {
    throw new Error("Registry change bundle approval.approvedBy must be string or null");
  }
  if (approval.approvedAt !== null && approval.approvedAt !== undefined && !isIsoTimestamp(approval.approvedAt)) {
    throw new Error("Registry change bundle approval.approvedAt must be null or an ISO timestamp");
  }
  if (!Array.isArray(approval.notes)) {
    throw new Error("Registry change bundle approval.notes must be an array");
  }

  if (bundleStatus === "proposed" && approval.status !== "pending") {
    throw new Error("Proposed registry change bundles must keep approval.status pending");
  }
  if (bundleStatus === "approved") {
    if (approval.status !== "approved") {
      throw new Error("Approved registry change bundles must keep approval.status approved");
    }
    if (!approval.approvedBy || !approval.approvedAt) {
      throw new Error("Approved registry change bundles must include approvedBy and approvedAt");
    }
  }
  if (bundleStatus === "rejected" && approval.status !== "rejected") {
    throw new Error("Rejected registry change bundles must keep approval.status rejected");
  }
  if (bundleStatus === "superseded" && approval.status !== "superseded") {
    throw new Error("Superseded registry change bundles must keep approval.status superseded");
  }

  return {
    required: approval.required,
    status: approval.status,
    approvedBy: approval.approvedBy ?? null,
    approvedAt: approval.approvedAt ?? null,
    notes: approval.notes.map((note) => String(note))
  };
}

async function normalizeBundle(bundle) {
  if (!bundle || typeof bundle !== "object") {
    throw new Error("Registry change bundle input must be an object");
  }
  if (bundle.schemaVersion !== 1) {
    throw new Error("Registry change bundle schemaVersion must be 1");
  }
  if (!bundleStatuses.has(bundle.status)) {
    throw new Error("Registry change bundle status must be proposed, approved, rejected, or superseded");
  }
  if (bundle.mutationAuthority !== "none") {
    throw new Error("Registry change bundle mutationAuthority must be none");
  }
  if (!isIsoTimestamp(bundle.generatedAt)) {
    throw new Error("Registry change bundle generatedAt must be an ISO timestamp");
  }

  return {
    schemaVersion: 1,
    status: bundle.status,
    mutationAuthority: "none",
    generatedAt: bundle.generatedAt,
    source: await normalizeSource(bundle.source),
    affectedProjects: normalizeAffectedProjects(bundle.affectedProjects),
    operations: normalizeOperations(bundle.operations),
    evidence: normalizeEvidence(bundle.evidence),
    approval: normalizeApproval(bundle.status, bundle.approval)
  };
}

function renderMarkdown(bundle) {
  const lines = [
    "# Registry Change Bundle",
    "",
    `- Status: \`${bundle.status}\``,
    "- Mutation authority: `none`",
    `- Generated: \`${bundle.generatedAt}\``,
    `- Source kind: \`${bundle.source.kind}\``,
    `- Source path: \`${bundle.source.path}\``,
    `- Source SHA-256: \`${bundle.source.sha256}\``,
    `- Source summary: ${bundle.source.summary}`,
    `- Affected projects: ${bundle.affectedProjects.map((slug) => `\`${slug}\``).join(", ")}`,
    "",
    "## Operations",
    "",
    "| Op | Path | Review | Summary |",
    "| --- | --- | --- | --- |"
  ];

  for (const operation of bundle.operations) {
    lines.push(`| ${operation.op} | \`${operation.path}\` | ${operation.requiresReview ? "required" : "optional"} | ${operation.summary} |`);
  }

  lines.push("", "## Evidence", "", "| Kind | Reference | Summary |", "| --- | --- | --- |");
  for (const entry of bundle.evidence) {
    lines.push(`| ${entry.kind} | \`${entry.reference}\` | ${entry.summary} |`);
  }

  lines.push("", "## Approval", "");
  lines.push(`- Required: ${bundle.approval.required ? "yes" : "no"}`);
  lines.push(`- Approval status: \`${bundle.approval.status}\``);
  lines.push(`- Approved by: ${bundle.approval.approvedBy ? `\`${bundle.approval.approvedBy}\`` : "-"}`);
  lines.push(`- Approved at: ${bundle.approval.approvedAt ? `\`${bundle.approval.approvedAt}\`` : "-"}`);
  if (bundle.approval.notes.length > 0) {
    for (const note of bundle.approval.notes) {
      lines.push(`- Note: ${note}`);
    }
  }

  lines.push("", "## Operator Rule", "", "Review only. Approved bundles still do not mutate `data/projects.json` automatically.");
  return lines.join("\n") + "\n";
}

const { input } = parseArgs(process.argv.slice(2));
const inputPath = resolvePath(input);
const raw = await readFile(inputPath, "utf8");
const bundle = JSON.parse(raw);
const normalizedBundle = await normalizeBundle(bundle);

await mkdir(path.dirname(outputJsonPath), { recursive: true });
await writeFile(outputJsonPath, JSON.stringify(normalizedBundle, null, 2) + "\n", "utf8");
await writeFile(outputMdPath, renderMarkdown(normalizedBundle), "utf8");

console.log(`Rendered ${toRelativePath(outputJsonPath)}`);
console.log(`Rendered ${toRelativePath(outputMdPath)}`);
