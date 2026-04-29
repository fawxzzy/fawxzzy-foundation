#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../../..");
const registryPath = path.join(root, "data/projects.json");

async function readJson(filePath) {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw);
}

function summarize(registry) {
  const total = registry.projects.length;
  const active = registry.projects.filter((project) => project.status === "active").length;
  const bootstrap = registry.projects.filter((project) => project.status === "bootstrap").length;
  const deployments = registry.projects.filter((project) => project.vercel?.exists).length;
  const repos = registry.projects.filter((project) => project.repo?.exists === true).length;
  return { total, active, bootstrap, deployments, repos };
}

function table(projects) {
  const rows = projects.map((project) => ({
    slug: project.slug,
    status: project.status,
    kind: project.kind,
    repo: project.repo?.fullName ?? "-",
    vercel: project.vercel?.projects?.map((item) => item.name).join(", ") ?? project.vercel?.projectName ?? "-",
    next: project.nextActions?.[0] ?? "-"
  }));

  const headers = ["slug", "status", "kind", "repo", "vercel", "next"];
  const widths = Object.fromEntries(headers.map((header) => [
    header,
    Math.max(header.length, ...rows.map((row) => String(row[header] ?? "").length))
  ]));

  const line = headers.map((header) => header.padEnd(widths[header])).join("  ");
  const rule = headers.map((header) => "-".repeat(widths[header])).join("  ");
  const body = rows.map((row) => headers.map((header) => String(row[header] ?? "").padEnd(widths[header])).join("  ")).join("\n");
  return `${line}\n${rule}\n${body}`;
}

async function status({ json = false } = {}) {
  const registry = await readJson(registryPath);
  const summary = summarize(registry);

  if (json) {
    console.log(JSON.stringify({ status: "ok", summary, updatedAt: registry.updatedAt }, null, 2));
    return;
  }

  console.log("Foundation status: ok");
  console.log(`Owner: ${registry.owner}`);
  console.log(`Projects: ${summary.total} total, ${summary.active} active, ${summary.bootstrap} bootstrap`);
  console.log(`Mapped repos: ${summary.repos}`);
  console.log(`Mapped deployments: ${summary.deployments}`);
  console.log(`Registry updated: ${registry.updatedAt}`);
}

async function projects({ json = false } = {}) {
  const registry = await readJson(registryPath);
  const sorted = [...registry.projects].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.slug.localeCompare(b.slug);
  });

  if (json) {
    console.log(JSON.stringify(sorted, null, 2));
    return;
  }

  console.log(table(sorted));
}

async function doctor() {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, "scripts/verify.mjs")], {
      cwd: root,
      stdio: "inherit"
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`verify failed with exit code ${code}`));
    });
    child.on("error", reject);
  });
}

function help() {
  console.log(`Foundation CLI

Commands:
  status [--json]      Print registry summary
  projects [--json]    List registered projects
  doctor               Run local verification
  help                 Show this help
`);
}

const [command = "status", ...args] = process.argv.slice(2);
const wantsJson = args.includes("--json");

try {
  if (command === "status") await status({ json: wantsJson });
  else if (command === "projects") await projects({ json: wantsJson });
  else if (command === "doctor") await doctor();
  else if (command === "help" || command === "--help" || command === "-h") help();
  else {
    console.error(`Unknown command: ${command}`);
    help();
    process.exitCode = 1;
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
