#!/usr/bin/env node
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const errors = [];
const warnings = [];
const proofQualityCatalog = {
  clean: {
    kind: "clean",
    summary: "Current proof is acceptable as clean public-source provenance."
  },
  "accepted-private-source": {
    kind: "accepted",
    summary: "Source is intentionally private, and Vercel metadata provides accepted current provenance without counting as a warning."
  },
  dirty: {
    kind: "warning",
    summary: "READY deployment metadata includes gitDirty and needs a clean replacement proof before the warning can clear."
  },
  "private-source": {
    kind: "warning",
    summary: "Source is private; this is acceptable when intentional, but the provenance policy should stay explicit."
  },
  "legacy-mapping": {
    kind: "warning",
    summary: "Legacy deployment mapping still needs reconciliation before proof can be treated as clean."
  },
  "pending-confirmation": {
    kind: "warning",
    summary: "Observation exists, but operator confirmation is still pending."
  }
};
const proofQualityStates = new Set(Object.keys(proofQualityCatalog));
const warningClasses = new Map();

const requiredFiles = [
  "README.md",
  "FOUNDATION.md",
  "AGENTS.md",
  "foundation.config.json",
  "data/projects.json",
  "packages/contracts/foundation.schema.json",
  "packages/cli/bin/foundation.mjs",
  "packages/core/src/index.ts",
  "scripts/render-registry.mjs",
  "scripts/render-console-data.mjs",
  "scripts/serve-console.mjs",
  "docs/architecture/FOUNDATION_BLUEPRINT.md",
  "docs/architecture/PROJECT_REGISTRY.md",
  "apps/console/public/index.html",
  "apps/console/public/assets/main.js",
  "apps/console/public/assets/styles.css",
  "apps/console/public/foundation.projects.json",
  ".playbook/ai-contract.json"
];

async function exists(relativePath) {
  try {
    await access(path.join(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

async function readJson(relativePath) {
  try {
    const raw = await readFile(path.join(root, relativePath), "utf8");
    return JSON.parse(raw);
  } catch (error) {
    errors.push(`${relativePath}: ${error.message}`);
    return null;
  }
}

function isIsoTimestamp(value) {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isProofStale(proof, now = Date.now()) {
  if (!proof?.lastDeploymentProofAt || typeof proof.staleAfterHours !== "number") return false;
  const observedAt = Date.parse(proof.lastDeploymentProofAt);
  if (Number.isNaN(observedAt)) return false;
  return now - observedAt > proof.staleAfterHours * 60 * 60 * 1000;
}

function getProofQualityStates(proof) {
  return Array.isArray(proof?.qualityStates) ? proof.qualityStates : [];
}

function getProofQualityDefinition(state) {
  return proofQualityCatalog[state];
}

function hasProofQualityWarning(proof) {
  return getProofQualityStates(proof).some((state) => getProofQualityDefinition(state)?.kind === "warning");
}

function getProofWarningStates(proof) {
  return getProofQualityStates(proof).filter((state) => getProofQualityDefinition(state)?.kind === "warning");
}

function recordWarningClass(state, projectLabel) {
  if (!warningClasses.has(state)) {
    warningClasses.set(state, new Set());
  }
  warningClasses.get(state).add(projectLabel);
}

function getProofRemediationClasses(proof) {
  return Array.isArray(proof?.remediation?.classes) ? proof.remediation.classes : [];
}

function validateHealthFacet(projectLabel, facetName, facet) {
  if (!facet || typeof facet !== "object") {
    errors.push(`${projectLabel}: missing health.${facetName}`);
    return;
  }

  if (!facet.status) errors.push(`${projectLabel}: health.${facetName}.status is required`);
  if (!facet.summary) errors.push(`${projectLabel}: health.${facetName}.summary is required`);
  if (!isIsoTimestamp(facet.checkedAt)) {
    errors.push(`${projectLabel}: health.${facetName}.checkedAt must be an ISO timestamp`);
  }
}

for (const file of requiredFiles) {
  if (!(await exists(file))) {
    errors.push(`Missing required file: ${file}`);
  }
}

const config = await readJson("foundation.config.json");
const registry = await readJson("data/projects.json");
const consoleData = await readJson("apps/console/public/foundation.projects.json");
const now = Date.now();

if (config) {
  if (config.name !== "fawxzzy-foundation") errors.push("foundation.config.json name must be fawxzzy-foundation");
  if (!config.registryPath || config.registryPath !== "data/projects.json") errors.push("foundation.config.json registryPath must be data/projects.json");
  if (!config.governance?.verificationCommand) errors.push("foundation.config.json must define governance.verificationCommand");
}

if (registry) {
  if (registry.schemaVersion !== 1) errors.push("data/projects.json schemaVersion must be 1");
  if (!Array.isArray(registry.projects) || registry.projects.length === 0) errors.push("data/projects.json must include projects[]");

  const slugs = new Set();
  const repoNames = new Set();

  for (const project of registry.projects ?? []) {
    const label = project.slug ?? "<missing-slug>";
    for (const field of ["slug", "name", "kind", "status", "summary"]) {
      if (!project[field]) errors.push(`${label}: missing ${field}`);
    }
    if (typeof project.priority !== "number") errors.push(`${label}: priority must be a number`);
    if (slugs.has(project.slug)) errors.push(`Duplicate project slug: ${project.slug}`);
    slugs.add(project.slug);

    if (!project.repo?.fullName) errors.push(`${label}: missing repo.fullName`);
    if (project.repo?.fullName) repoNames.add(project.repo.fullName);
    if (!Array.isArray(project.stack)) errors.push(`${label}: stack must be an array`);
    if (!Array.isArray(project.contracts)) errors.push(`${label}: contracts must be an array`);
    if (!Array.isArray(project.nextActions) || project.nextActions.length === 0) errors.push(`${label}: nextActions must include at least one action`);

    if (!project.health || typeof project.health !== "object") {
      errors.push(`${label}: health is required`);
      continue;
    }

    if (!project.health.status) errors.push(`${label}: health.status is required`);
    if (!project.health.summary) errors.push(`${label}: health.summary is required`);

    validateHealthFacet(label, "github", project.health.github);
    validateHealthFacet(label, "vercel", project.health.vercel);
    validateHealthFacet(label, "deployment", project.health.deployment);
    validateHealthFacet(label, "proof", project.health.proof);

    const proof = project.health.proof;
    if (typeof proof?.staleAfterHours !== "number" || proof.staleAfterHours <= 0) {
      errors.push(`${label}: health.proof.staleAfterHours must be a positive number`);
    }

    if (proof?.lastDeploymentProofAt !== null && proof?.lastDeploymentProofAt !== undefined && !isIsoTimestamp(proof.lastDeploymentProofAt)) {
      errors.push(`${label}: health.proof.lastDeploymentProofAt must be null or an ISO timestamp`);
    }

    const qualityStates = getProofQualityStates(proof);
    for (const qualityState of qualityStates) {
      if (!proofQualityStates.has(qualityState)) {
        errors.push(`${label}: health.proof.qualityStates includes unsupported state ${qualityState}`);
      }
    }
    if (proof?.qualitySummary !== undefined && typeof proof.qualitySummary !== "string") {
      errors.push(`${label}: health.proof.qualitySummary must be a string when present`);
    }
    if (proof?.remediation !== undefined) {
      if (!proof.remediation || typeof proof.remediation !== "object") {
        errors.push(`${label}: health.proof.remediation must be an object when present`);
      } else {
        if (!proof.remediation.summary || typeof proof.remediation.summary !== "string") {
          errors.push(`${label}: health.proof.remediation.summary must be a string when present`);
        }
        if (!Array.isArray(proof.remediation.classes) || proof.remediation.classes.length === 0) {
          errors.push(`${label}: health.proof.remediation.classes must include at least one entry when remediation is present`);
        }
      }
    }

    const remediationClasses = getProofRemediationClasses(proof);
    const remediationStates = new Set();
    for (const remediation of remediationClasses) {
      if (!remediation?.state || typeof remediation.state !== "string") {
        errors.push(`${label}: health.proof.remediation.classes[].state is required`);
        continue;
      }
      remediationStates.add(remediation.state);
      if (!proofQualityStates.has(remediation.state)) {
        errors.push(`${label}: health.proof.remediation.classes includes unsupported state ${remediation.state}`);
      }
      if (!remediation.summary || typeof remediation.summary !== "string") {
        errors.push(`${label}: health.proof.remediation.${remediation.state}.summary must be a string`);
      }
      if (!remediation.owner || typeof remediation.owner !== "string") {
        errors.push(`${label}: health.proof.remediation.${remediation.state}.owner must be a string`);
      }
      if (!Array.isArray(remediation.nextActions) || remediation.nextActions.length === 0) {
        errors.push(`${label}: health.proof.remediation.${remediation.state}.nextActions must include at least one action`);
      }
      if (!Array.isArray(remediation.safeProofRefreshCriteria) || remediation.safeProofRefreshCriteria.length === 0) {
        errors.push(`${label}: health.proof.remediation.${remediation.state}.safeProofRefreshCriteria must include at least one criterion`);
      }
    }

    if (project.repo?.exists === true) {
      if (!project.repo.url) errors.push(`${label}: repo.url must be set when repo.exists is true`);
      if (!project.repo.visibility) warnings.push(`${label}: repo.visibility should be recorded when repo.exists is true`);
      if (!project.repo.defaultBranch) warnings.push(`${label}: repo.defaultBranch should be recorded when repo.exists is true`);
      if (project.health.github.status === "missing") {
        errors.push(`${label}: health.github.status cannot be missing when repo.exists is true`);
      }
    }

    if (project.vercel?.exists) {
      if (project.health.vercel.status === "not-applicable") {
        errors.push(`${label}: health.vercel.status cannot be not-applicable when vercel.exists is true`);
      }
    } else if (project.health.vercel.status !== "not-applicable") {
      warnings.push(`${label}: health.vercel.status should usually be not-applicable when no Vercel mapping exists`);
    }

    if (project.health.deployment.status === "ready") {
      for (const field of ["deploymentId", "target", "alias", "githubCommitSha"]) {
        if (!project.health.deployment[field]) {
          errors.push(`${label}: health.deployment.${field} is required when deployment status is ready`);
        }
      }
      if (!proof?.lastDeploymentProofAt) {
        errors.push(`${label}: ready deployment requires health.proof.lastDeploymentProofAt`);
      }
    }

    if (proof?.status === "current" && !proof?.lastDeploymentProofAt) {
      errors.push(`${label}: current proof requires health.proof.lastDeploymentProofAt`);
    }

    if (proof?.status === "current" && qualityStates.length === 0) {
      warnings.push(`${label}: current proof should classify health.proof.qualityStates`);
    }

    if (qualityStates.includes("clean") && qualityStates.length > 1) {
      errors.push(`${label}: clean proof quality cannot be combined with other quality states`);
    }

    if (project.health.deployment?.gitDirty === true && !qualityStates.includes("dirty")) {
      warnings.push(`${label}: deployment metadata is gitDirty but proof quality is not marked dirty`);
    }

    if (
      project.health.github?.status === "private-source" &&
      !qualityStates.includes("private-source") &&
      !qualityStates.includes("accepted-private-source")
    ) {
      warnings.push(`${label}: private-source GitHub status should usually be reflected in proof quality`);
    }

    for (const qualityState of getProofWarningStates(proof)) {
      recordWarningClass(qualityState, label);
      if (!remediationStates.has(qualityState)) {
        errors.push(`${label}: proof warning state ${qualityState} must include remediation metadata`);
      }
    }

    if (isProofStale(proof, now)) {
      warnings.push(`${label}: deployment proof is stale (${proof.lastDeploymentProofAt}, window ${proof.staleAfterHours}h)`);
    }
  }

  if (!slugs.has("foundation")) errors.push("Registry must include foundation project");
  if (!repoNames.has("fawxzzy/fawxzzy-foundation")) errors.push("Registry must include fawxzzy/fawxzzy-foundation");

  const foundation = registry.projects.find((project) => project.slug === "foundation");
  if (foundation?.health?.proof?.promotionProofCommitSha && foundation?.promotion?.registryCommit?.sha) {
    if (foundation.health.proof.promotionProofCommitSha !== foundation.promotion.registryCommit.sha) {
      errors.push("foundation: promotion proof commit must match promotion.registryCommit.sha");
    }
  }
  if (foundation?.health?.proof?.latestObservedCommitSha && foundation?.health?.deployment?.githubCommitSha) {
    if (foundation.health.proof.latestObservedCommitSha !== foundation.health.deployment.githubCommitSha) {
      errors.push("foundation: latest observed proof commit must match health.deployment.githubCommitSha");
    }
  }
  if (foundation?.health?.proof?.latestObservedDeploymentId && foundation?.health?.deployment?.deploymentId) {
    if (foundation.health.proof.latestObservedDeploymentId !== foundation.health.deployment.deploymentId) {
      errors.push("foundation: latest observed proof deployment must match health.deployment.deploymentId");
    }
  }
}

if (registry && consoleData) {
  if (consoleData.summary?.totalProjects !== registry.projects.length) {
    errors.push("Console data project count does not match registry. Run pnpm build.");
  }

  const staleProofProjects = (consoleData.projects ?? []).filter((project) => project.health?.proof?.isStale).length;
  if (consoleData.summary?.staleProofProjects !== staleProofProjects) {
    errors.push("Console data stale proof count does not match registry. Run pnpm build.");
  }

  const pendingProofProjects = (consoleData.projects ?? []).filter((project) => project.health?.proof?.status === "pending-proof").length;
  if (consoleData.summary?.pendingProofProjects !== pendingProofProjects) {
    errors.push("Console data pending proof count does not match registry. Run pnpm build.");
  }

  const proofWarningProjects = (consoleData.projects ?? []).filter((project) => hasProofQualityWarning(project.health?.proof)).length;
  if (consoleData.summary?.proofWarningProjects !== proofWarningProjects) {
    errors.push("Console data proof warning count does not match registry. Run pnpm build.");
  }

  const proofWarningStateCounts = {};
  for (const project of consoleData.projects ?? []) {
    for (const state of getProofWarningStates(project.health?.proof)) {
      proofWarningStateCounts[state] = (proofWarningStateCounts[state] ?? 0) + 1;
    }
  }
  if (JSON.stringify(consoleData.summary?.proofWarningStateCounts ?? {}) !== JSON.stringify(proofWarningStateCounts)) {
    errors.push("Console data proof warning state counts do not match registry. Run pnpm build.");
  }
}

const warningClassSummary = Object.fromEntries(
  [...warningClasses.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([state, labels]) => [state, [...labels].sort()])
);

const receipt = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  status: errors.length ? "failed" : "passed",
  errors,
  warnings,
  warningClasses: warningClassSummary,
  checkedFiles: requiredFiles.length
};

await mkdir(path.join(root, ".foundation"), { recursive: true });
await writeFile(path.join(root, ".foundation/verify.json"), JSON.stringify(receipt, null, 2) + "\n", "utf8");

if (errors.length) {
  console.error("Foundation verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  if (Object.keys(warningClassSummary).length) {
    console.error("Warning classes:");
    for (const [state, labels] of Object.entries(warningClassSummary)) {
      console.error(`- ${state}: ${labels.join(", ")} (${proofQualityCatalog[state].summary})`);
    }
  }
  process.exitCode = 1;
} else {
  console.log("Foundation verification passed.");
  console.log(`Checked files: ${requiredFiles.length}`);
  if (Object.keys(warningClassSummary).length) {
    console.log("Warning classes:");
    for (const [state, labels] of Object.entries(warningClassSummary)) {
      console.log(`- ${state}: ${labels.join(", ")} (${proofQualityCatalog[state].summary})`);
    }
  }
  if (warnings.length) {
    console.log("Additional warnings:");
    for (const warning of warnings) console.log(`- ${warning}`);
  }
  console.log("Receipt: .foundation/verify.json");
}
