#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const registryPath = path.join(root, "data/projects.json");
const outputPath = path.join(root, "apps/console/public/foundation.projects.json");

const registry = JSON.parse(await readFile(registryPath, "utf8"));
const payload = {
  build: {
    generatedAt: new Date().toISOString(),
    source: "data/projects.json"
  },
  summary: {
    owner: registry.owner,
    updatedAt: registry.updatedAt,
    totalProjects: registry.projects.length,
    activeProjects: registry.projects.filter((project) => project.status === "active").length,
    deploymentMappedProjects: registry.projects.filter((project) => project.vercel?.exists).length
  },
  principles: registry.principles,
  projects: registry.projects
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(`Rendered ${path.relative(root, outputPath)}`);
