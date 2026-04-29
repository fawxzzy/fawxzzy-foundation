#!/usr/bin/env node
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const errors = [];
const warnings = [];

const requiredFiles = [
  "README.md",
  "FOUNDATION.md",
  "AGENTS.md",
  "foundation.config.json",
  "data/projects.json",
  "packages/contracts/foundation.schema.json",
  "packages/cli/bin/foundation.mjs",
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

for (const file of requiredFiles) {
  if (!(await exists(file))) {
    errors.push(`Missing required file: ${file}`);
  }
}

const config = await readJson("foundation.config.json");
const registry = await readJson("data/projects.json");
const consoleData = await readJson("apps/console/public/foundation.projects.json");

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
  }

  if (!slugs.has("foundation")) errors.push("Registry must include foundation project");
  if (!repoNames.has("fawxzzy/fawxzzy-foundation")) errors.push("Registry must include fawxzzy/fawxzzy-foundation");

  const foundation = registry.projects.find((project) => project.slug === "foundation");
  if (foundation?.repo?.exists === true) {
    if (!foundation.repo.url) errors.push("foundation.repo.url must be set when foundation.repo.exists is true");
    if (!foundation.repo.visibility) warnings.push("foundation.repo.visibility should be recorded when foundation.repo.exists is true");
    if (!foundation.repo.defaultBranch) warnings.push("foundation.repo.defaultBranch should be recorded when foundation.repo.exists is true");
  }
}

if (registry && consoleData) {
  if (consoleData.summary?.totalProjects !== registry.projects.length) {
    errors.push("Console data project count does not match registry. Run pnpm build.");
  }
}

const receipt = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  status: errors.length ? "failed" : "passed",
  errors,
  warnings,
  checkedFiles: requiredFiles.length
};

await mkdir(path.join(root, ".foundation"), { recursive: true });
await writeFile(path.join(root, ".foundation/verify.json"), JSON.stringify(receipt, null, 2) + "\n", "utf8");

if (errors.length) {
  console.error("Foundation verification failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Foundation verification passed.");
  console.log(`Checked files: ${requiredFiles.length}`);
  if (warnings.length) {
    console.log("Warnings:");
    for (const warning of warnings) console.log(`- ${warning}`);
  }
  console.log("Receipt: .foundation/verify.json");
}
