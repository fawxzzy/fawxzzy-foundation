#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const registryPath = path.join(root, "data/projects.json");
const outputPath = path.join(root, "apps/console/public/foundation.projects.json");
const proofQualityCatalog = {
  clean: {
    kind: "clean"
  },
  "accepted-private-source": {
    kind: "accepted"
  },
  dirty: {
    kind: "warning"
  },
  "private-source": {
    kind: "warning"
  },
  "legacy-mapping": {
    kind: "warning"
  },
  "pending-confirmation": {
    kind: "warning"
  }
};

function isProofStale(proof, now = Date.now()) {
  if (!proof?.lastDeploymentProofAt || typeof proof.staleAfterHours !== "number") return false;
  const observedAt = Date.parse(proof.lastDeploymentProofAt);
  if (Number.isNaN(observedAt)) return false;
  return now - observedAt > proof.staleAfterHours * 60 * 60 * 1000;
}

function hasProofQualityWarning(proof) {
  const states = Array.isArray(proof?.qualityStates) ? proof.qualityStates : [];
  return states.some((state) => proofQualityCatalog[state]?.kind === "warning");
}

function getProofWarningStates(proof) {
  const states = Array.isArray(proof?.qualityStates) ? proof.qualityStates : [];
  return states.filter((state) => proofQualityCatalog[state]?.kind === "warning");
}

function getProofWarningStateCounts(projects) {
  return projects.reduce((counts, project) => {
    for (const state of getProofWarningStates(project.health?.proof)) {
      counts[state] = (counts[state] ?? 0) + 1;
    }
    return counts;
  }, {});
}

const registry = JSON.parse(await readFile(registryPath, "utf8"));
const now = Date.now();
const projects = registry.projects.map((project) => ({
  ...project,
  health: {
    ...project.health,
    proof: {
      ...project.health.proof,
      isStale: isProofStale(project.health.proof, now)
    }
  }
}));

const payload = {
  build: {
    generatedAt: new Date().toISOString(),
    source: "data/projects.json"
  },
  summary: {
    owner: registry.owner,
    updatedAt: registry.updatedAt,
    totalProjects: projects.length,
    activeProjects: projects.filter((project) => project.status === "active").length,
    deploymentMappedProjects: projects.filter((project) => project.vercel?.exists).length,
    currentProofProjects: projects.filter((project) => project.health?.proof?.status === "current" && !project.health.proof.isStale).length,
    staleProofProjects: projects.filter((project) => project.health?.proof?.isStale).length,
    pendingProofProjects: projects.filter((project) => project.health?.proof?.status === "pending-proof").length,
    proofWarningProjects: projects.filter((project) => hasProofQualityWarning(project.health?.proof)).length,
    proofWarningStateCounts: getProofWarningStateCounts(projects)
  },
  principles: registry.principles,
  projects
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(`Rendered ${path.relative(root, outputPath)}`);
