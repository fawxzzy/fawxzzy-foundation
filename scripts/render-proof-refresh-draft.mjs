#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const registryPath = path.join(root, "data/projects.json");
const outputJsonPath = path.join(root, ".foundation/proof-refresh-draft.json");
const outputMdPath = path.join(root, ".foundation/proof-refresh-draft.md");

const primaryDispositions = [
  "unchanged-proof",
  "stale-proof",
  "provider-newer-than-registry",
  "provider-missing",
  "provider-conflict"
];

const supplementalClassifications = [
  "accepted-private-source",
  "historical-mapping",
  "immutable-promotion-proof"
];

const classifications = [...primaryDispositions, ...supplementalClassifications];

function timestamp(value) {
  const parsed = Date.parse(value ?? "");
  return Number.isNaN(parsed) ? null : parsed;
}

function toRelativePath(filePath) {
  const relative = path.relative(root, filePath);
  return relative && !relative.startsWith("..") ? relative.replaceAll("\\", "/") : filePath;
}

function isIsoTimestamp(value) {
  return typeof value === "string" && timestamp(value) !== null;
}

function isMissingStatus(status) {
  return status === "missing" || status === "not-found";
}

function parseArgs(argv) {
  const args = { observationsPath: null };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--observations") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing path after --observations.");
      }
      args.observationsPath = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function expectedVercelProjectNames(project) {
  if (project.vercel?.projects?.length) {
    return project.vercel.projects.map((entry) => entry.name);
  }
  if (project.vercel?.projectName) {
    return [project.vercel.projectName];
  }
  return [];
}

function latestObservationFromFacets(...facets) {
  const candidates = facets
    .map((facet) => ({
      observedAt: facet?.observedAt ?? null,
      time: timestamp(facet?.observedAt)
    }))
    .filter((entry) => entry.time !== null)
    .sort((left, right) => right.time - left.time);

  return candidates[0]?.observedAt ?? null;
}

function latestProofObservation(project) {
  return latestObservationFromFacets(
    { observedAt: project.health?.github?.checkedAt },
    { observedAt: project.health?.vercel?.checkedAt },
    { observedAt: project.health?.deployment?.checkedAt }
  );
}

function buildRegistryObservation(project) {
  const githubRepo = project.health?.github
    ? {
        observedAt: project.health.github.checkedAt,
        status: project.health.github.status === "verified" ? "verified" : project.health.github.status ?? "unknown",
        summary: project.health.github.summary,
        exists: project.repo?.exists ?? null,
        owner: project.repo?.owner,
        name: project.repo?.name,
        fullName: project.repo?.fullName,
        url: project.repo?.url,
        visibility: project.repo?.visibility,
        defaultBranch: project.repo?.defaultBranch
      }
    : undefined;

  const vercelProject = project.vercel?.exists || project.health?.vercel
    ? {
        observedAt: project.health.vercel.checkedAt,
        status: project.health.vercel.status ?? "unknown",
        summary: project.health.vercel.summary,
        teamSlug: project.vercel?.teamSlug,
        projectNames: project.health.vercel.projectNames ?? expectedVercelProjectNames(project),
        projectIds: project.vercel?.projects?.map((entry) => entry.id).filter(Boolean)
      }
    : undefined;

  const vercelDeployment = project.health?.deployment
    ? {
        observedAt: project.health.deployment.checkedAt,
        status: project.health.deployment.status ?? "unknown",
        summary: project.health.deployment.summary,
        target: project.health.deployment.target,
        projectName: expectedVercelProjectNames(project)[0],
        deploymentId: project.health.deployment.deploymentId,
        alias: project.health.deployment.alias,
        githubCommitSha: project.health.deployment.githubCommitSha,
        message: project.health.deployment.message,
        gitDirty: project.health.deployment.gitDirty
      }
    : undefined;

  return {
    slug: project.slug,
    name: project.name,
    githubRepo,
    vercelProject,
    vercelDeployment,
    notes: ["Synthesized from registry-recorded health facets."]
  };
}

function mergeObservation(project, externalEntry) {
  const registryObservation = buildRegistryObservation(project);
  if (!externalEntry) {
    return registryObservation;
  }

  return {
    ...registryObservation,
    ...externalEntry,
    githubRepo: externalEntry.githubRepo ?? registryObservation.githubRepo,
    githubChecks: externalEntry.githubChecks ?? registryObservation.githubChecks,
    vercelProject: externalEntry.vercelProject ?? registryObservation.vercelProject,
    vercelDeployment: externalEntry.vercelDeployment ?? registryObservation.vercelDeployment,
    supabaseProject: externalEntry.supabaseProject ?? registryObservation.supabaseProject,
    notes: [...(registryObservation.notes ?? []), ...(externalEntry.notes ?? [])]
  };
}

function validateFacet(projectLabel, facetName, facet) {
  if (!facet || typeof facet !== "object") {
    throw new Error(`${projectLabel}: ${facetName} must be an object when present`);
  }
  if (!isIsoTimestamp(facet.observedAt)) {
    throw new Error(`${projectLabel}: ${facetName}.observedAt must be an ISO timestamp`);
  }
  if (typeof facet.status !== "string" || facet.status.length === 0) {
    throw new Error(`${projectLabel}: ${facetName}.status is required`);
  }
}

function validateProviderObservationSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    throw new Error("Observation snapshot must be an object");
  }
  if (snapshot.schemaVersion !== 1) {
    throw new Error("Observation snapshot schemaVersion must be 1");
  }
  if (!["example", "operator-capture"].includes(snapshot.captureMode)) {
    throw new Error("Observation snapshot captureMode must be example or operator-capture");
  }
  if (!["partial", "full"].includes(snapshot.coverage)) {
    throw new Error("Observation snapshot coverage must be partial or full");
  }
  if (!isIsoTimestamp(snapshot.generatedAt)) {
    throw new Error("Observation snapshot generatedAt must be an ISO timestamp");
  }
  if (!snapshot.source || typeof snapshot.source !== "object" || typeof snapshot.source.label !== "string" || snapshot.source.label.length === 0) {
    throw new Error("Observation snapshot source.label is required");
  }
  if (!Array.isArray(snapshot.projects)) {
    throw new Error("Observation snapshot projects must be an array");
  }

  const slugs = new Set();
  for (const project of snapshot.projects) {
    if (!project || typeof project !== "object") {
      throw new Error("Observation snapshot projects entries must be objects");
    }
    if (typeof project.slug !== "string" || project.slug.length === 0) {
      throw new Error("Observation snapshot project.slug is required");
    }
    if (slugs.has(project.slug)) {
      throw new Error(`Observation snapshot duplicate project slug: ${project.slug}`);
    }
    slugs.add(project.slug);

    for (const facetName of ["githubRepo", "githubChecks", "vercelProject", "vercelDeployment", "supabaseProject"]) {
      if (project[facetName] !== undefined) {
        validateFacet(project.slug, facetName, project[facetName]);
      }
    }
  }
}

async function loadObservationSnapshot(relativeOrAbsolutePath) {
  const absolutePath = path.isAbsolute(relativeOrAbsolutePath)
    ? relativeOrAbsolutePath
    : path.resolve(root, relativeOrAbsolutePath);
  const raw = await readFile(absolutePath, "utf8");
  const snapshot = JSON.parse(raw);
  validateProviderObservationSnapshot(snapshot);
  return {
    absolutePath,
    relativePath: toRelativePath(absolutePath),
    snapshot
  };
}

function getSupplementalClassifications(project, immutable) {
  const result = [];
  const qualityStates = new Set(project.health?.proof?.qualityStates ?? []);

  if (qualityStates.has("accepted-private-source")) {
    result.push("accepted-private-source");
  }

  if (qualityStates.has("legacy-mapping") || (project.vercel?.projects ?? []).some((entry) => entry.role === "historical")) {
    result.push("historical-mapping");
  }

  if (immutable.length > 0) {
    result.push("immutable-promotion-proof");
  }

  return result;
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

function isProofStale(proof, now = Date.now()) {
  if (!proof?.lastDeploymentProofAt || typeof proof.staleAfterHours !== "number") return false;
  const observedAt = timestamp(proof.lastDeploymentProofAt);
  if (observedAt === null) return false;
  return now - observedAt > proof.staleAfterHours * 60 * 60 * 1000;
}

function getProofTimestamp(project) {
  return Math.max(
    timestamp(project.health?.proof?.checkedAt) ?? Number.NEGATIVE_INFINITY,
    timestamp(project.health?.proof?.lastDeploymentProofAt) ?? Number.NEGATIVE_INFINITY
  );
}

function getObservationTimestamp(observation) {
  return Math.max(
    timestamp(observation.githubRepo?.observedAt) ?? Number.NEGATIVE_INFINITY,
    timestamp(observation.githubChecks?.observedAt) ?? Number.NEGATIVE_INFINITY,
    timestamp(observation.vercelProject?.observedAt) ?? Number.NEGATIVE_INFINITY,
    timestamp(observation.vercelDeployment?.observedAt) ?? Number.NEGATIVE_INFINITY
  );
}

function getObservationSummaryTimestamp(observation) {
  return latestObservationFromFacets(
    observation.githubRepo,
    observation.githubChecks,
    observation.vercelProject,
    observation.vercelDeployment,
    observation.supabaseProject
  );
}

function getConflictFields(project, observation) {
  const fields = [];
  const expectedProjectNames = expectedVercelProjectNames(project);
  const observedProjectNames = observation.vercelProject?.projectNames ?? [];

  if (observation.githubRepo?.fullName && project.repo?.fullName && observation.githubRepo.fullName !== project.repo.fullName) {
    fields.push("repo.fullName");
  }
  if (observation.githubRepo?.visibility && project.repo?.visibility && observation.githubRepo.visibility !== project.repo.visibility) {
    fields.push("repo.visibility");
  }
  if (
    observation.githubRepo?.defaultBranch &&
    project.repo?.defaultBranch &&
    observation.githubRepo.defaultBranch !== project.repo.defaultBranch
  ) {
    fields.push("repo.defaultBranch");
  }
  if (observation.vercelProject?.teamSlug && project.vercel?.teamSlug && observation.vercelProject.teamSlug !== project.vercel.teamSlug) {
    fields.push("vercel.teamSlug");
  }
  if (
    observedProjectNames.length > 0 &&
    expectedProjectNames.length > 0 &&
    !observedProjectNames.some((name) => expectedProjectNames.includes(name))
  ) {
    fields.push("vercel.projects");
  }
  if (
    observation.vercelDeployment?.projectName &&
    expectedProjectNames.length > 0 &&
    !expectedProjectNames.includes(observation.vercelDeployment.projectName)
  ) {
    fields.push("health.deployment.projectName");
  }
  if (
    observation.vercelDeployment?.alias &&
    project.health?.deployment?.alias &&
    observation.vercelDeployment.alias !== project.health.deployment.alias
  ) {
    fields.push("health.deployment.alias");
  }
  if (
    observation.vercelDeployment?.githubCommitSha &&
    project.health?.deployment?.githubCommitSha &&
    observation.vercelDeployment.githubCommitSha !== project.health.deployment.githubCommitSha
  ) {
    fields.push("health.deployment.githubCommitSha");
  }

  return fields;
}

function isProviderMissing(project, observation, coverageMode, hasExternalEntry) {
  const requiresRepo = project.repo?.exists === true;
  const requiresVercelProject = project.vercel?.exists === true;
  const requiresDeployment = project.vercel?.exists === true && project.health?.deployment?.status !== "not-applicable";
  const fullCaptureMissing = coverageMode === "full" && !hasExternalEntry;

  if (requiresRepo) {
    if (fullCaptureMissing) return true;
    if (isMissingStatus(observation.githubRepo.status) || observation.githubRepo.exists === false) return true;
  }

  if (requiresVercelProject) {
    if (fullCaptureMissing) return true;
    if (isMissingStatus(observation.vercelProject.status)) return true;
  }

  if (requiresDeployment) {
    if (fullCaptureMissing) return true;
    if (isMissingStatus(observation.vercelDeployment.status)) return true;
  }

  return false;
}

function isProviderNewerThanRegistry(project, observation) {
  return getObservationTimestamp(observation) > getProofTimestamp(project);
}

function buildRationale({
  project,
  primaryDisposition,
  supplemental,
  observationMode,
  hasExternalEntry,
  fallbackToRegistry,
  observation,
  conflictFields,
  immutable,
  now
}) {
  const items = [];

  if (observationMode === "external-file" && hasExternalEntry) {
    items.push("External provider observation snapshot supplied explicit input for this project.");
  }

  if (fallbackToRegistry) {
    items.push("External observation coverage was partial for this project, so the draft fell back to registry-recorded observations.");
  }

  if (primaryDisposition === "provider-missing") {
    items.push("Expected provider evidence is missing or explicitly not found in the active observation input.");
  }

  if (primaryDisposition === "provider-newer-than-registry") {
    items.push(
      `Observation evidence is newer than the recorded registry proof (${getObservationSummaryTimestamp(observation)} > ${project.health.proof.checkedAt}).`
    );
  }

  if (primaryDisposition === "provider-conflict" && conflictFields.length > 0) {
    items.push(`Provider observation conflicts with registry truth on: ${conflictFields.join(", ")}.`);
  }

  if (primaryDisposition === "stale-proof" && project.health?.proof?.lastDeploymentProofAt) {
    items.push(
      `Deployment proof is older than the ${project.health.proof.staleAfterHours} hour freshness window (${project.health.proof.lastDeploymentProofAt}).`
    );
  }

  if (primaryDisposition === "unchanged-proof") {
    items.push("Current proof and comparison input remain aligned within the active freshness window.");
  }

  if (supplemental.includes("accepted-private-source")) {
    items.push("Private source provenance remains intentionally accepted under current proof policy.");
  }

  if (supplemental.includes("historical-mapping")) {
    const historicalNames = (project.vercel?.projects ?? [])
      .filter((entry) => entry.role === "historical")
      .map((entry) => entry.name);
    items.push(
      historicalNames.length > 0
        ? `Historical deployment mappings remain recorded: ${historicalNames.join(", ")}.`
        : "Historical deployment mapping remains part of the current registry policy."
    );
  }

  if (supplemental.includes("immutable-promotion-proof") && immutable.length > 0) {
    items.push("Pinned Foundation promotion proof remains immutable even when newer live evidence is supplied.");
  }

  if (observation.supabaseProject) {
    items.push(
      `Supabase inventory evidence is present for review (${observation.supabaseProject.projectName ?? observation.supabaseProject.projectRef ?? "unnamed project"}).`
    );
  }

  if (items.length === 0 && isProofStale(project.health?.proof, now)) {
    items.push("Proof freshness window has elapsed.");
  }

  return items;
}

function buildProposedActions({ project, primaryDisposition, supplemental, conflictFields }) {
  const actions = [];

  if (primaryDisposition === "provider-missing") {
    actions.push("Recover or recapture the missing provider evidence before editing the registry.");
  } else if (primaryDisposition === "provider-newer-than-registry") {
    actions.push("Review the newer observation and decide whether to promote it into data/projects.json.");
  } else if (primaryDisposition === "provider-conflict") {
    actions.push(`Resolve the conflict between registry truth and provider evidence for: ${conflictFields.join(", ")}.`);
  } else if (primaryDisposition === "stale-proof") {
    actions.push("Capture a fresh observation before editing the registry.");
  } else {
    actions.push("No registry mutation proposed; keep the current proof as-is.");
  }

  if (supplemental.includes("accepted-private-source")) {
    actions.push("Preserve accepted-private-source policy unless source visibility intent changes.");
  }

  if (supplemental.includes("historical-mapping")) {
    actions.push("Keep historical mappings documented unless reviewed evidence shows they should change.");
  }

  if (supplemental.includes("immutable-promotion-proof") && project.slug === "foundation") {
    actions.push("Do not rewrite the pinned Foundation promotion proof without explicit operator approval.");
  }

  if (project.health?.proof?.qualityStates?.includes("dirty")) {
    actions.push("Replace dirty deployment proof with a clean READY observation before clearing the warning.");
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
    `- Observation mode: \`${draft.observationInput.mode}\``
  ];

  if (draft.observationInput.path) {
    lines.push(`- Observation path: \`${draft.observationInput.path}\``);
  }
  if (draft.observationInput.captureMode) {
    lines.push(`- Observation capture mode: \`${draft.observationInput.captureMode}\``);
  }
  if (draft.observationInput.coverage) {
    lines.push(`- Observation coverage: \`${draft.observationInput.coverage}\``);
  }
  if (draft.observationInput.generatedAt) {
    lines.push(`- Observation generated: \`${draft.observationInput.generatedAt}\``);
  }

  lines.push("", "## Workflow", "");
  for (const step of draft.workflow) {
    lines.push(`1. ${step}`);
  }

  lines.push("", "## Summary", "");
  lines.push(`- Projects reviewed: ${draft.summary.totalProjects}`);
  lines.push(`- Projects using external observations: ${draft.summary.externalObservationProjects}`);
  for (const disposition of primaryDispositions) {
    lines.push(`- ${disposition}: ${draft.summary.primaryDispositionCounts[disposition]}`);
  }
  for (const classification of supplementalClassifications) {
    lines.push(`- ${classification}: ${draft.summary.classificationCounts[classification]}`);
  }
  lines.push(`- Immutable promotion proof projects: ${draft.summary.immutablePromotionProofProjects}`);

  lines.push("", "## Project Decisions", "");
  lines.push("| Project | Mode | Primary disposition | Classifications | Observed at | Proof checked at |");
  lines.push("| --- | --- | --- | --- | --- | --- |");

  for (const project of draft.projects) {
    lines.push(
      `| ${project.slug} | \`${project.observationMode}\` | \`${project.primaryDisposition}\` | ${project.classifications.map((value) => `\`${value}\``).join(", ")} | ${project.observedAt ? `\`${project.observedAt}\`` : "-"} | \`${project.proofCheckedAt}\` |`
    );
  }

  for (const project of draft.projects) {
    lines.push("", `### ${project.name}`, "");
    lines.push(`- Observation mode: \`${project.observationMode}\``);
    lines.push(`- Primary disposition: \`${project.primaryDisposition}\``);
    lines.push(`- Classifications: ${project.classifications.map((value) => `\`${value}\``).join(", ")}`);
    if (project.lastDeploymentProofAt) {
      lines.push(`- Last deployment proof: \`${project.lastDeploymentProofAt}\``);
    }
    if (project.immutablePromotionProof) {
      lines.push(`- Immutable fields: ${project.immutableFields.map((field) => `\`${field}\``).join(", ")}`);
    }
    if (project.conflictFields.length > 0) {
      lines.push(`- Conflict fields: ${project.conflictFields.map((field) => `\`${field}\``).join(", ")}`);
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

const { observationsPath } = parseArgs(process.argv.slice(2));
const registry = JSON.parse(await readFile(registryPath, "utf8"));
const now = Date.now();

let observationInput = {
  mode: "registry-only"
};
let observationSnapshot = null;
let observationEntries = new Map();

if (observationsPath) {
  const loaded = await loadObservationSnapshot(observationsPath);
  observationSnapshot = loaded.snapshot;
  observationEntries = new Map(loaded.snapshot.projects.map((project) => [project.slug, project]));
  observationInput = {
    mode: "external-file",
    path: loaded.relativePath,
    captureMode: loaded.snapshot.captureMode,
    coverage: loaded.snapshot.coverage,
    generatedAt: loaded.snapshot.generatedAt
  };
}

const primaryDispositionCounts = Object.fromEntries(primaryDispositions.map((value) => [value, 0]));
const classificationCounts = Object.fromEntries(classifications.map((value) => [value, 0]));

const projects = [...registry.projects]
  .sort((left, right) => {
    if (left.priority !== right.priority) return left.priority - right.priority;
    return left.slug.localeCompare(right.slug);
  })
  .map((project) => {
    const externalEntry = observationEntries.get(project.slug);
    const fallbackToRegistry = Boolean(observationSnapshot && !externalEntry && observationSnapshot.coverage === "partial");
    const observation = mergeObservation(project, externalEntry);
    const mode = externalEntry || (observationSnapshot && observationSnapshot.coverage === "full") ? observationInput.mode : "registry-only";
    const hasExternalEntry = Boolean(externalEntry);
    const immutable = immutableFields(project);
    const supplemental = getSupplementalClassifications(project, immutable);
    const conflictFields = getConflictFields(project, observation);

    let primaryDisposition = "unchanged-proof";
    if (isProviderMissing(project, observation, observationSnapshot?.coverage ?? "partial", hasExternalEntry)) {
      primaryDisposition = "provider-missing";
    } else if (isProviderNewerThanRegistry(project, observation)) {
      primaryDisposition = "provider-newer-than-registry";
    } else if (conflictFields.length > 0) {
      primaryDisposition = "provider-conflict";
    } else if (isProofStale(project.health?.proof, now)) {
      primaryDisposition = "stale-proof";
    }

    const projectClassifications = [primaryDisposition, ...supplemental];
    primaryDispositionCounts[primaryDisposition] += 1;
    for (const classification of projectClassifications) {
      classificationCounts[classification] += 1;
    }

    return {
      slug: project.slug,
      name: project.name,
      observationMode: mode,
      primaryDisposition,
      classifications: projectClassifications,
      observedAt: getObservationSummaryTimestamp(observation) ?? latestProofObservation(project),
      proofCheckedAt: project.health.proof.checkedAt,
      lastDeploymentProofAt: project.health.proof.lastDeploymentProofAt ?? null,
      immutablePromotionProof: immutable.length > 0,
      immutableFields: immutable,
      conflictFields,
      rationale: buildRationale({
        project,
        primaryDisposition,
        supplemental,
        observationMode: mode,
        hasExternalEntry,
        fallbackToRegistry,
        observation,
        conflictFields,
        immutable,
        now
      }),
      proposedActions: buildProposedActions({
        project,
        primaryDisposition,
        supplemental,
        conflictFields
      })
    };
  });

const draft = {
  schemaVersion: 1,
  status: "proposal-only",
  mutationAuthority: "none",
  generatedAt: new Date().toISOString(),
  sourceRegistry: {
    path: "data/projects.json",
    updatedAt: registry.updatedAt
  },
  observationInput,
  workflow: observationSnapshot
    ? [
        "Read operator-supplied provider observations from a file-based snapshot.",
        "Compare external evidence against registry truth and proof timestamps.",
        "Render a proposal-only draft under .foundation/ for operator review.",
        "Apply approved edits to data/projects.json manually.",
        "Run pnpm build and pnpm verify:local before commit."
      ]
    : [
        "Read provider observation already recorded in the registry health facets.",
        "Compare proof timestamps and quality policy against those observations.",
        "Render a proposal-only draft under .foundation/ for operator review.",
        "Apply approved edits to data/projects.json manually.",
        "Run pnpm build and pnpm verify:local before commit."
      ],
  summary: {
    totalProjects: projects.length,
    primaryDispositionCounts,
    classificationCounts,
    externalObservationProjects: projects.filter((project) => project.observationMode === "external-file").length,
    immutablePromotionProofProjects: projects.filter((project) => project.immutablePromotionProof).length
  },
  projects
};

await mkdir(path.dirname(outputJsonPath), { recursive: true });
await writeFile(outputJsonPath, JSON.stringify(draft, null, 2) + "\n", "utf8");
await writeFile(outputMdPath, renderMarkdown(draft), "utf8");

console.log(`Rendered ${path.relative(root, outputJsonPath)}`);
console.log(`Rendered ${path.relative(root, outputMdPath)}`);
