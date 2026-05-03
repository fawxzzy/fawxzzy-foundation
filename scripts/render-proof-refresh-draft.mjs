#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const registryPath = path.join(root, "data/projects.json");
const outputJsonPath = path.join(root, ".foundation/proof-refresh-draft.json");
const outputMdPath = path.join(root, ".foundation/proof-refresh-draft.md");

const dispositions = [
  "unchanged-proof",
  "stale-proof",
  "provider-newer-than-registry",
  "provider-missing"
];

const policyFlags = [
  "accepted-private-source",
  "historical-mapping"
];

function timestamp(value) {
  const parsed = Date.parse(value ?? "");
  return Number.isNaN(parsed) ? null : parsed;
}

function latestObservation(project) {
  const candidates = [
    ["github", project.health?.github?.checkedAt],
    ["vercel", project.health?.vercel?.checkedAt],
    ["deployment", project.health?.deployment?.checkedAt]
  ]
    .map(([source, checkedAt]) => ({ source, checkedAt, time: timestamp(checkedAt) }))
    .filter((entry) => entry.time !== null)
    .sort((left, right) => right.time - left.time);

  return candidates[0] ?? null;
}

function isProofStale(proof, now = Date.now()) {
  if (!proof?.lastDeploymentProofAt || typeof proof.staleAfterHours !== "number") return false;
  const observedAt = timestamp(proof.lastDeploymentProofAt);
  if (observedAt === null) return false;
  return now - observedAt > proof.staleAfterHours * 60 * 60 * 1000;
}

function getHistoricalMappings(project) {
  return (project.vercel?.projects ?? []).filter((entry) => entry.role === "historical");
}

function isProviderMissing(project) {
  if (project.repo?.exists === true && project.health?.github?.status === "missing") {
    return true;
  }

  if (project.vercel?.exists && ["missing", "not-found"].includes(project.health?.vercel?.status ?? "")) {
    return true;
  }

  if (project.vercel?.exists && project.health?.deployment?.status === "missing") {
    return true;
  }

  return false;
}

function isProviderNewerThanRegistry(project) {
  const proofTime = Math.max(
    timestamp(project.health?.proof?.checkedAt) ?? Number.NEGATIVE_INFINITY,
    timestamp(project.health?.proof?.lastDeploymentProofAt) ?? Number.NEGATIVE_INFINITY
  );
  const observedTime = latestObservation(project)?.time ?? Number.NEGATIVE_INFINITY;
  return observedTime > proofTime;
}

function immutableFields(project) {
  if (project.slug !== "foundation") return [];

  const fields = [];
  if (project.health?.proof?.promotionProofCommitSha) {
    fields.push("health.proof.promotionProofCommitSha");
  }
  if (project.health?.proof?.promotionProofDeploymentId) {
    fields.push("health.proof.promotionProofDeploymentId");
  }
  if (project.promotion?.registryCommit?.sha) {
    fields.push("promotion.registryCommit.sha");
  }
  return fields;
}

function getDisposition(project, now = Date.now()) {
  if (isProviderMissing(project)) return "provider-missing";
  if (isProviderNewerThanRegistry(project)) return "provider-newer-than-registry";
  if (isProofStale(project.health?.proof, now)) return "stale-proof";
  return "unchanged-proof";
}

function getPolicyFlags(project) {
  const flags = [];
  const qualityStates = new Set(project.health?.proof?.qualityStates ?? []);

  if (qualityStates.has("accepted-private-source")) {
    flags.push("accepted-private-source");
  }

  if (qualityStates.has("legacy-mapping") || getHistoricalMappings(project).length > 0) {
    flags.push("historical-mapping");
  }

  return flags;
}

function buildRationale(project, disposition, flags, observation, now = Date.now()) {
  const items = [];
  const proof = project.health?.proof;

  if (disposition === "provider-missing") {
    items.push("One or more expected provider surfaces are recorded as missing in the current registry health facets.");
  }

  if (disposition === "provider-newer-than-registry" && observation?.checkedAt) {
    items.push(
      `The latest provider observation is ${observation.source} at ${observation.checkedAt}, which is newer than the recorded proof timestamp.`
    );
  }

  if (disposition === "stale-proof" && proof?.lastDeploymentProofAt) {
    items.push(
      `The deployment proof is older than the ${proof.staleAfterHours} hour freshness window (${proof.lastDeploymentProofAt}).`
    );
  }

  if (disposition === "unchanged-proof") {
    items.push("Current provider observations and recorded proof remain aligned within the existing freshness window.");
  }

  if (flags.includes("accepted-private-source")) {
    items.push("Private source provenance is intentionally accepted through the current proof policy.");
  }

  const historical = getHistoricalMappings(project);
  if (flags.includes("historical-mapping")) {
    const names = historical.map((entry) => entry.name);
    items.push(
      names.length
        ? `Historical deployment mappings remain recorded for review: ${names.join(", ")}.`
        : "Historical deployment mapping is still recorded in the current proof policy."
    );
  }

  if (project.slug === "foundation" && immutableFields(project).length > 0) {
    items.push("Pinned Foundation promotion proof stays immutable; draft review can refresh live observation notes without rewriting the pinned promotion proof.");
  }

  if (items.length === 0 && isProofStale(project.health?.proof, now)) {
    items.push("Proof freshness window has elapsed.");
  }

  return items;
}

function buildProposedActions(project, disposition, flags) {
  const actions = [];

  if (disposition === "provider-missing") {
    actions.push("Inspect provider inventory and confirm whether the missing surface is expected before editing the registry.");
  } else if (disposition === "provider-newer-than-registry") {
    actions.push("Review the newer provider observation and decide whether to promote it into data/projects.json.");
  } else if (disposition === "stale-proof") {
    actions.push("Capture a fresh provider observation and compare it against the recorded proof before editing the registry.");
  } else {
    actions.push("No registry mutation proposed; keep the current proof as-is.");
  }

  if (flags.includes("accepted-private-source")) {
    actions.push("Preserve explicit accepted-private-source policy unless source visibility intent changes.");
  }

  if (flags.includes("historical-mapping")) {
    actions.push("Keep historical mappings documented unless a reviewed provider observation proves they should be removed.");
  }

  if (project.slug === "foundation" && immutableFields(project).length > 0) {
    actions.push("Do not rewrite the pinned Foundation promotion proof without an explicit override.");
  }

  return actions;
}

function renderMarkdown(draft) {
  const lines = [
    "# Proof Refresh Draft",
    "",
    "- Status: `proposal-only`",
    "- Mutation authority: `none`",
    `- Generated: \`${draft.generatedAt}\``,
    `- Source registry: \`${draft.sourceRegistry.path}\` at \`${draft.sourceRegistry.updatedAt}\``,
    "",
    "## Workflow",
    ""
  ];

  for (const step of draft.workflow) {
    lines.push(`1. ${step}`);
  }

  lines.push("", "## Summary", "");
  lines.push(`- Projects reviewed: ${draft.summary.totalProjects}`);
  for (const disposition of dispositions) {
    lines.push(`- ${disposition}: ${draft.summary.dispositionCounts[disposition]}`);
  }
  for (const flag of policyFlags) {
    lines.push(`- ${flag}: ${draft.summary.policyFlagCounts[flag]}`);
  }
  lines.push(`- Immutable promotion proof projects: ${draft.summary.immutablePromotionProofProjects}`);
  lines.push("", "## Project Decisions", "");
  lines.push("| Project | Disposition | Policy flags | Observed at | Proof checked at |");
  lines.push("| --- | --- | --- | --- | --- |");

  for (const project of draft.projects) {
    lines.push(
      `| ${project.slug} | \`${project.disposition}\` | ${project.policyFlags.length ? project.policyFlags.map((flag) => `\`${flag}\``).join(", ") : "-" } | ${project.observedAt ? `\`${project.observedAt}\`` : "-"} | \`${project.proofCheckedAt}\` |`
    );
  }

  for (const project of draft.projects) {
    lines.push("", `### ${project.name}`, "");
    lines.push(`- Disposition: \`${project.disposition}\``);
    if (project.policyFlags.length) {
      lines.push(`- Policy flags: ${project.policyFlags.map((flag) => `\`${flag}\``).join(", ")}`);
    }
    if (project.lastDeploymentProofAt) {
      lines.push(`- Last deployment proof: \`${project.lastDeploymentProofAt}\``);
    }
    if (project.immutablePromotionProof) {
      lines.push(`- Immutable fields: ${project.immutableFields.map((field) => `\`${field}\``).join(", ")}`);
    }
    for (const rationale of project.rationale) {
      lines.push(`- Rationale: ${rationale}`);
    }
    for (const action of project.proposedActions) {
      lines.push(`- Proposed action: ${action}`);
    }
  }

  lines.push("", "## Operator Rule", "", "Review only. Edit `data/projects.json` manually after approval, then run `pnpm build` and `pnpm verify:local`.");
  return lines.join("\n") + "\n";
}

const registry = JSON.parse(await readFile(registryPath, "utf8"));
const now = Date.now();

const projects = [...registry.projects]
  .sort((left, right) => {
    if (left.priority !== right.priority) return left.priority - right.priority;
    return left.slug.localeCompare(right.slug);
  })
  .map((project) => {
    const observation = latestObservation(project);
    const disposition = getDisposition(project, now);
    const flags = getPolicyFlags(project);
    const immutable = immutableFields(project);

    return {
      slug: project.slug,
      name: project.name,
      disposition,
      policyFlags: flags,
      observedAt: observation?.checkedAt ?? null,
      proofCheckedAt: project.health.proof.checkedAt,
      lastDeploymentProofAt: project.health.proof.lastDeploymentProofAt ?? null,
      immutablePromotionProof: immutable.length > 0,
      immutableFields: immutable,
      rationale: buildRationale(project, disposition, flags, observation, now),
      proposedActions: buildProposedActions(project, disposition, flags)
    };
  });

const dispositionCounts = Object.fromEntries(dispositions.map((value) => [value, 0]));
const policyFlagCounts = Object.fromEntries(policyFlags.map((value) => [value, 0]));

for (const project of projects) {
  dispositionCounts[project.disposition] += 1;
  for (const flag of project.policyFlags) {
    policyFlagCounts[flag] += 1;
  }
}

const draft = {
  schemaVersion: 1,
  status: "proposal-only",
  mutationAuthority: "none",
  generatedAt: new Date().toISOString(),
  sourceRegistry: {
    path: "data/projects.json",
    updatedAt: registry.updatedAt
  },
  workflow: [
    "Read provider observation already recorded in the registry health facets.",
    "Compare proof timestamps and quality policy against those observations.",
    "Render a proposal-only draft under .foundation/ for operator review.",
    "Apply approved edits to data/projects.json manually.",
    "Run pnpm build and pnpm verify:local before commit."
  ],
  summary: {
    totalProjects: projects.length,
    dispositionCounts,
    policyFlagCounts,
    immutablePromotionProofProjects: projects.filter((project) => project.immutablePromotionProof).length
  },
  projects
};

await mkdir(path.dirname(outputJsonPath), { recursive: true });
await writeFile(outputJsonPath, JSON.stringify(draft, null, 2) + "\n", "utf8");
await writeFile(outputMdPath, renderMarkdown(draft), "utf8");

console.log(`Rendered ${path.relative(root, outputJsonPath)}`);
console.log(`Rendered ${path.relative(root, outputMdPath)}`);
