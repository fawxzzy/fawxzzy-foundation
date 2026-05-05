#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { access, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
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
const splitStateRequiredProjects = new Set([
  "foundation",
  "fitness",
  "playbook",
  "lifeline",
  "atlas",
  "mazer",
  "trove",
  "nat-1-games"
]);
const scorecardRequiredProjects = new Set([
  "foundation",
  "fitness",
  "playbook",
  "lifeline",
  "atlas",
  "mazer",
  "trove",
  "nat-1-games"
]);
const desiredLifecycleStates = new Set(["active", "incubating", "observed-deployment", "planned", "historical"]);
const desiredRoleStates = new Set(["control-plane", "application", "governance-runtime", "operator-runtime", "workspace-architecture"]);
const observedRepoStates = new Set(["verified", "missing", "private-source", "not-applicable", "unknown"]);
const observedDeploymentStates = new Set(["ready", "missing", "not-applicable", "unknown"]);
const observedDatabaseStates = new Set(["observed", "not-applicable", "unknown"]);
const observedProofStates = new Set(["current", "stale", "pending", "not-applicable"]);
const healthOverallStates = new Set(["healthy", "warning", "blocked", "unknown"]);
const healthQualityStates = new Set(["clean", "accepted-private-source", "advisory", "blocked"]);
const scorecardStatuses = new Set(["scored", "pending-split-migration"]);
const scorecardVerdicts = new Set(["healthy", "warning", "blocked", "unknown"]);
const scorecardDimensionStates = new Set(["pass", "warn", "fail", "not-applicable"]);
const registryChangeBundleStatuses = new Set(["proposed", "approved", "rejected", "superseded"]);
const registryChangeSourceKinds = new Set(["proof-refresh-draft", "provider-observation", "supabase-inventory-draft", "manual"]);
const registryChangeOperationTypes = new Set(["add", "replace", "remove"]);
const registryChangeEvidenceKinds = new Set([
  "proof-refresh-draft",
  "provider-observation",
  "supabase-advisor",
  "supabase-inventory-draft",
  "deployment-proof",
  "manual-note"
]);
const registryChangeApprovalStatuses = new Set(["pending", "approved", "rejected", "superseded"]);
const sha256Pattern = /^[a-f0-9]{64}$/i;

const requiredFiles = [
  "README.md",
  "FOUNDATION.md",
  "AGENTS.md",
  "foundation.config.json",
  "data/projects.json",
  "packages/contracts/foundation.schema.json",
  "packages/cli/bin/foundation.mjs",
  "packages/core/src/index.ts",
  "packages/contracts/proof-refresh-draft.schema.json",
  "packages/contracts/registry-change-bundle.schema.json",
  "packages/contracts/provider-capture.schema.json",
  "packages/contracts/provider-observations.schema.json",
  "packages/contracts/supabase-inventory-draft.schema.json",
  "scripts/render-registry.mjs",
  "scripts/render-console-data.mjs",
  "scripts/normalize-provider-observations.mjs",
  "scripts/render-proof-refresh-draft.mjs",
  "scripts/render-registry-change-bundle.mjs",
  "scripts/render-supabase-inventory-draft.mjs",
  "scripts/serve-console.mjs",
  "docs/architecture/FOUNDATION_BLUEPRINT.md",
  "docs/architecture/PROJECT_REGISTRY.md",
  "docs/roadmap/FOUNDATION_ROADMAP.md",
  "docs/operations/PROOF_REFRESH.md",
  "docs/operations/REGISTRY_CHANGE_BUNDLES.md",
  "docs/operations/PROVIDER_CAPTURE.md",
  "docs/operations/PROVIDER_OBSERVATIONS.md",
  "docs/operations/SUPABASE_INVENTORY.md",
  "fixtures/provider-capture.example.json",
  "fixtures/provider-observations.example.json",
  "fixtures/registry-change-bundle.example.json",
  "fixtures/supabase-inventory.example.json",
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

async function readText(relativePath) {
  try {
    return await readFile(path.join(root, relativePath), "utf8");
  } catch (error) {
    errors.push(`${relativePath}: ${error.message}`);
    return null;
  }
}

async function listJsonFixtures(relativePath) {
  const directoryPath = path.join(root, relativePath);
  const entries = await readdir(directoryPath, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const childRelativePath = path.posix.join(relativePath.replaceAll("\\", "/"), entry.name);
    if (entry.isDirectory()) {
      files.push(...await listJsonFixtures(childRelativePath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(childRelativePath);
    }
  }

  return files.sort();
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

function isGitTracked(relativePath) {
  const result = spawnSync("git", ["ls-files", "--error-unmatch", relativePath], {
    cwd: root,
    encoding: "utf8"
  });
  return result.status === 0;
}

function containsUnsafeExampleContent(value, pathParts = []) {
  const unsafeKeyPattern = /(token|secret|password|authorization|cookie|api[-_]?key|credential|database[_-]?url|env(ironment)?)/i;
  const unsafeValuePattern = /(ghp_|github_pat_|postgres:\/\/[^@\s]+@|service_role|bearer\s+[a-z0-9._-]+|sbp_|sk_live_|xox[baprs]-|-----begin)/i;

  if (Array.isArray(value)) {
    return value.some((entry, index) => containsUnsafeExampleContent(entry, [...pathParts, String(index)]));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).some(([key, entry]) => {
      if (unsafeKeyPattern.test(key) && !pathParts.includes("countsByName")) {
        return true;
      }
      return containsUnsafeExampleContent(entry, [...pathParts, key]);
    });
  }

  if (typeof value === "string") {
    return unsafeValuePattern.test(value);
  }

  return false;
}

function validateExampleFixture(filePath, fixture) {
  if (!fixture || typeof fixture !== "object") {
    errors.push(`${filePath} must be a JSON object`);
    return;
  }

  if (containsUnsafeExampleContent(fixture)) {
    errors.push(`${filePath} must not contain tokens, secrets, credentials, environment dumps, or connection strings`);
  }

  if (filePath.endsWith(".example.json")) {
    if (fixture.captureMode !== undefined && fixture.captureMode !== "example") {
      errors.push(`${filePath} captureMode must be example`);
    }
    if (!isIsoTimestamp(fixture.generatedAt)) {
      errors.push(`${filePath} generatedAt must be an ISO timestamp`);
    }
  }
}

function validateRegistryChangeBundleFixture(filePath, fixture) {
  if (fixture.schemaVersion !== 1) {
    errors.push(`${filePath} schemaVersion must be 1`);
  }
  if (!registryChangeBundleStatuses.has(fixture.status)) {
    errors.push(`${filePath} status must be proposed, approved, rejected, or superseded`);
  }
  if (fixture.mutationAuthority !== "none") {
    errors.push(`${filePath} mutationAuthority must be none`);
  }

  if (!fixture.source || typeof fixture.source !== "object") {
    errors.push(`${filePath} source is required`);
  } else {
    if (!registryChangeSourceKinds.has(fixture.source.kind)) {
      errors.push(`${filePath} source.kind must be a supported bundle source kind`);
    }
    if (typeof fixture.source.path !== "string" || fixture.source.path.length === 0) {
      errors.push(`${filePath} source.path is required`);
    }
    if (typeof fixture.source.summary !== "string" || fixture.source.summary.length === 0) {
      errors.push(`${filePath} source.summary is required`);
    }
    if (typeof fixture.source.sha256 !== "string" || !sha256Pattern.test(fixture.source.sha256)) {
      errors.push(`${filePath} source.sha256 must be a 64 character hexadecimal string`);
    }
  }

  if (!Array.isArray(fixture.affectedProjects) || fixture.affectedProjects.length === 0) {
    errors.push(`${filePath} affectedProjects must include at least one project slug`);
  }

  if (!Array.isArray(fixture.operations) || fixture.operations.length === 0) {
    errors.push(`${filePath} operations must include at least one change operation`);
  } else {
    for (const operation of fixture.operations) {
      if (!registryChangeOperationTypes.has(operation?.op)) {
        errors.push(`${filePath} operation.op must be add, replace, or remove`);
      }
      if (typeof operation?.path !== "string" || operation.path.length === 0) {
        errors.push(`${filePath} operation.path is required`);
      }
      if (typeof operation?.summary !== "string" || operation.summary.length === 0) {
        errors.push(`${filePath} operation.summary is required`);
      }
      if (typeof operation?.requiresReview !== "boolean") {
        errors.push(`${filePath} operation.requiresReview must be boolean`);
      }
    }
  }

  if (!Array.isArray(fixture.evidence) || fixture.evidence.length === 0) {
    errors.push(`${filePath} evidence must include at least one supporting reference`);
  } else {
    for (const evidence of fixture.evidence) {
      if (!registryChangeEvidenceKinds.has(evidence?.kind)) {
        errors.push(`${filePath} evidence.kind must be a supported evidence kind`);
      }
      if (typeof evidence?.summary !== "string" || evidence.summary.length === 0) {
        errors.push(`${filePath} evidence.summary is required`);
      }
      if (typeof evidence?.reference !== "string" || evidence.reference.length === 0) {
        errors.push(`${filePath} evidence.reference is required`);
      }
    }
  }

  if (!fixture.approval || typeof fixture.approval !== "object") {
    errors.push(`${filePath} approval is required`);
    return;
  }

  if (typeof fixture.approval.required !== "boolean") {
    errors.push(`${filePath} approval.required must be boolean`);
  }
  if (!registryChangeApprovalStatuses.has(fixture.approval.status)) {
    errors.push(`${filePath} approval.status must be pending, approved, rejected, or superseded`);
  }
  if (fixture.approval.approvedBy !== null && typeof fixture.approval.approvedBy !== "string") {
    errors.push(`${filePath} approval.approvedBy must be string or null`);
  }
  if (fixture.approval.approvedAt !== null && !isIsoTimestamp(fixture.approval.approvedAt)) {
    errors.push(`${filePath} approval.approvedAt must be null or an ISO timestamp`);
  }
  if (!Array.isArray(fixture.approval.notes)) {
    errors.push(`${filePath} approval.notes must be an array`);
  }

  if (fixture.status === "proposed" && fixture.approval.status !== "pending") {
    errors.push(`${filePath} proposed bundles must keep approval.status pending`);
  }
  if (fixture.status === "approved") {
    if (fixture.approval.status !== "approved") {
      errors.push(`${filePath} approved bundles must keep approval.status approved`);
    }
    if (!fixture.approval.approvedBy || !fixture.approval.approvedAt) {
      errors.push(`${filePath} approved bundles must include approvedBy and approvedAt`);
    }
  }
  if (fixture.status === "rejected" && fixture.approval.status !== "rejected") {
    errors.push(`${filePath} rejected bundles must keep approval.status rejected`);
  }
  if (fixture.status === "superseded" && fixture.approval.status !== "superseded") {
    errors.push(`${filePath} superseded bundles must keep approval.status superseded`);
  }
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

function validateSplitState(projectLabel, project) {
  if (!project.desiredState || typeof project.desiredState !== "object") {
    errors.push(`${projectLabel}: desiredState is required for migrated projects`);
    return;
  }
  if (!desiredLifecycleStates.has(project.desiredState.lifecycle)) {
    errors.push(`${projectLabel}: desiredState.lifecycle must be a supported lifecycle`);
  }
  if (!desiredRoleStates.has(project.desiredState.role)) {
    errors.push(`${projectLabel}: desiredState.role must be a supported role`);
  }
  if (!project.desiredState.summary || typeof project.desiredState.summary !== "string") {
    errors.push(`${projectLabel}: desiredState.summary is required`);
  }
  if (!project.desiredState.ownerIntent || typeof project.desiredState.ownerIntent !== "string") {
    errors.push(`${projectLabel}: desiredState.ownerIntent is required`);
  }

  if (!project.observedState || typeof project.observedState !== "object") {
    errors.push(`${projectLabel}: observedState is required for migrated projects`);
  } else {
    if (!observedRepoStates.has(project.observedState.repo)) {
      errors.push(`${projectLabel}: observedState.repo must be a supported state`);
    }
    if (!observedDeploymentStates.has(project.observedState.deployment)) {
      errors.push(`${projectLabel}: observedState.deployment must be a supported state`);
    }
    if (!observedDatabaseStates.has(project.observedState.database)) {
      errors.push(`${projectLabel}: observedState.database must be a supported state`);
    }
    if (!observedProofStates.has(project.observedState.proof)) {
      errors.push(`${projectLabel}: observedState.proof must be a supported state`);
    }
    if (!project.observedState.summary || typeof project.observedState.summary !== "string") {
      errors.push(`${projectLabel}: observedState.summary is required`);
    }
  }

  if (!project.healthState || typeof project.healthState !== "object") {
    errors.push(`${projectLabel}: healthState is required for migrated projects`);
  } else {
    if (!healthOverallStates.has(project.healthState.overall)) {
      errors.push(`${projectLabel}: healthState.overall must be a supported state`);
    }
    if (!healthQualityStates.has(project.healthState.quality)) {
      errors.push(`${projectLabel}: healthState.quality must be a supported state`);
    }
    if (!Array.isArray(project.healthState.warnings)) {
      errors.push(`${projectLabel}: healthState.warnings must be an array`);
    }
    if (!Array.isArray(project.healthState.blockers)) {
      errors.push(`${projectLabel}: healthState.blockers must be an array`);
    }
    if (!project.healthState.summary || typeof project.healthState.summary !== "string") {
      errors.push(`${projectLabel}: healthState.summary is required`);
    }
  }

  if (project.status !== project.desiredState.lifecycle) {
    errors.push(`${projectLabel}: legacy status must match desiredState.lifecycle for migrated projects`);
  }
}

function validateScorecard(projectLabel, project, requiresScorecard) {
  const scorecard = project.scorecard;

  if (!scorecard) {
    if (requiresScorecard) {
      errors.push(`${projectLabel}: scorecard is required for migrated split-state projects`);
    }
    return;
  }

  if (!scorecardStatuses.has(scorecard.status)) {
    errors.push(`${projectLabel}: scorecard.status must be scored or pending-split-migration`);
  }

  if (!requiresScorecard && scorecard.status === "scored") {
    errors.push(`${projectLabel}: non-migrated projects must not be scored until split-state migration is complete`);
  }

  if (scorecard.status === "pending-split-migration") {
    return;
  }

  if (!scorecardVerdicts.has(scorecard.verdict)) {
    errors.push(`${projectLabel}: scorecard.verdict must be a supported verdict`);
  }
  if (typeof scorecard.score !== "number" || typeof scorecard.maxScore !== "number") {
    errors.push(`${projectLabel}: scorecard.score and scorecard.maxScore must be numbers`);
  }
  if (!Array.isArray(scorecard.dimensions) || scorecard.dimensions.length === 0) {
    errors.push(`${projectLabel}: scorecard.dimensions must include at least one dimension`);
  }
  if (!Array.isArray(scorecard.warnings)) {
    errors.push(`${projectLabel}: scorecard.warnings must be an array`);
  }
  if (!Array.isArray(scorecard.blockers)) {
    errors.push(`${projectLabel}: scorecard.blockers must be an array`);
  }
  if (!scorecard.nextAction || typeof scorecard.nextAction !== "string") {
    errors.push(`${projectLabel}: scorecard.nextAction is required`);
  }

  for (const dimension of scorecard.dimensions ?? []) {
    if (!dimension.key || typeof dimension.key !== "string") {
      errors.push(`${projectLabel}: scorecard dimension key is required`);
    }
    if (!dimension.label || typeof dimension.label !== "string") {
      errors.push(`${projectLabel}: scorecard dimension label is required`);
    }
    if (!scorecardDimensionStates.has(dimension.state)) {
      errors.push(`${projectLabel}: scorecard dimension ${dimension.key} must use a supported state`);
    }
    if (typeof dimension.points !== "number" || typeof dimension.maxPoints !== "number") {
      errors.push(`${projectLabel}: scorecard dimension ${dimension.key} must include numeric points`);
    }
    if (!dimension.summary || typeof dimension.summary !== "string") {
      errors.push(`${projectLabel}: scorecard dimension ${dimension.key} summary is required`);
    }
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
const fixtureFiles = await listJsonFixtures("fixtures");
const gitignore = await readText(".gitignore");
const now = Date.now();

if (gitignore) {
  const lines = gitignore.split(/\r?\n/).map((line) => line.trim());
  const protectsFoundationRuntime =
    lines.includes(".foundation/*") ||
    (lines.includes(".foundation/proof-refresh-draft.json") && lines.includes(".foundation/proof-refresh-draft.md"));

  if (!protectsFoundationRuntime) {
    errors.push(".gitignore must ignore .foundation/proof-refresh-draft.json and .foundation/proof-refresh-draft.md");
  }
}

for (const runtimeArtifact of [
  ".foundation/proof-refresh-draft.json",
  ".foundation/proof-refresh-draft.md",
  ".foundation/provider-observations.normalized.json",
  ".foundation/provider-observations.normalized.md",
  ".foundation/registry-change-bundle.json",
  ".foundation/registry-change-bundle.md",
  ".foundation/supabase-inventory.live-input.json",
  ".foundation/supabase-inventory-draft.json",
  ".foundation/supabase-inventory-draft.md"
]) {
  if (isGitTracked(runtimeArtifact)) {
    errors.push(`${runtimeArtifact} must remain untracked runtime output`);
  }
}

for (const fixtureFile of fixtureFiles) {
  const fixture = await readJson(fixtureFile);
  if (!fixture) continue;
  validateExampleFixture(fixtureFile, fixture);

  if (fixtureFile === "fixtures/provider-observations.example.json") {
    if (fixture.schemaVersion !== 1) {
      errors.push(`${fixtureFile} schemaVersion must be 1`);
    }
    if (!["partial", "full"].includes(fixture.coverage)) {
      errors.push(`${fixtureFile} coverage must be partial or full`);
    }
    if (!Array.isArray(fixture.projects) || fixture.projects.length === 0) {
      errors.push(`${fixtureFile} must include at least one project`);
    }
  }

  if (fixtureFile === "fixtures/provider-capture.example.json") {
    if (fixture.schemaVersion !== 1) {
      errors.push(`${fixtureFile} schemaVersion must be 1`);
    }
    if (!["partial", "full"].includes(fixture.coverage)) {
      errors.push(`${fixtureFile} coverage must be partial or full`);
    }
    const hasProviderEvidence =
      (fixture.github?.repos?.length ?? 0) +
      (fixture.github?.checks?.length ?? 0) +
      (fixture.vercel?.projects?.length ?? 0) +
      (fixture.vercel?.deployments?.length ?? 0) +
      (fixture.supabase?.projects?.length ?? 0);
    if (hasProviderEvidence === 0) {
      errors.push(`${fixtureFile} must include at least one provider evidence entry`);
    }
  }

  if (fixtureFile === "fixtures/supabase-inventory.example.json") {
    if (fixture.schemaVersion !== 1) {
      errors.push(`${fixtureFile} schemaVersion must be 1`);
    }
    if (fixture.status !== "proposal-only") {
      errors.push(`${fixtureFile} status must be proposal-only`);
    }
    if (fixture.mutationAuthority !== "none") {
      errors.push(`${fixtureFile} mutationAuthority must be none`);
    }
    if (!fixture.project?.projectRef || !fixture.project?.projectName) {
      errors.push(`${fixtureFile} must include project ref and project name`);
    }
    if (!Array.isArray(fixture.database?.tables) || fixture.database.tables.length === 0) {
      errors.push(`${fixtureFile} must include at least one table summary`);
    }
    if (!Array.isArray(fixture.advisors?.security?.findings)) {
      errors.push(`${fixtureFile} must include security advisor findings`);
    }
    if (!Array.isArray(fixture.advisors?.performance?.findings)) {
      errors.push(`${fixtureFile} must include performance advisor findings`);
    }
    if (!fixture.posture?.publicAppRlsPosture || !fixture.posture?.systemSchemaRlsPosture || !fixture.posture?.overallRlsPosture) {
      errors.push(`${fixtureFile} must include split RLS posture fields`);
    }
    if (!fixture.posture?.privacyClaimPosture || !["unclaimed", "draft", "proved", "blocked"].includes(fixture.posture.privacyClaimPosture)) {
      errors.push(`${fixtureFile} privacyClaimPosture must be unclaimed, draft, proved, or blocked`);
    }
  }

  if (fixtureFile === "fixtures/registry-change-bundle.example.json") {
    validateRegistryChangeBundleFixture(fixtureFile, fixture);
  }
}

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

    if (splitStateRequiredProjects.has(project.slug)) {
      validateSplitState(label, project);
    }
    validateScorecard(label, project, scorecardRequiredProjects.has(project.slug));

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

  const activeProjects = registry.projects.filter((project) => (project.desiredState?.lifecycle ?? project.status) === "active").length;
  if (consoleData.summary?.activeProjects !== activeProjects) {
    errors.push("Console data active project count does not match registry. Run pnpm build.");
  }

  const scoredProjects = (consoleData.projects ?? []).filter((project) => project.scorecard?.status === "scored").length;
  if (consoleData.summary?.scoredProjects !== scoredProjects) {
    errors.push("Console data scored project count does not match registry. Run pnpm build.");
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
