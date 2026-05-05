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
  await runScript("scripts/verify.mjs");
}

async function runScript(relativePath, args = []) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(root, relativePath), ...args], {
      cwd: root,
      stdio: "inherit"
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${path.basename(relativePath)} failed with exit code ${code}`));
    });
    child.on("error", reject);
  });
}

async function proofRefresh(args) {
  const [subcommand, ...rest] = args;
  if (subcommand !== "refresh") {
    throw new Error("Usage: foundation proof refresh --draft [--observations <path>]");
  }

  if (!rest.includes("--draft")) {
    throw new Error("Proof refresh is proposal-only. Re-run with --draft.");
  }

  const observationsIndex = rest.indexOf("--observations");
  const scriptArgs = [];
  if (observationsIndex !== -1) {
    const observationPath = rest[observationsIndex + 1];
    if (!observationPath || observationPath.startsWith("--")) {
      throw new Error("Missing path after --observations.");
    }
    scriptArgs.push("--observations", observationPath);
  }

  await runScript("scripts/render-proof-refresh-draft.mjs", scriptArgs);
}

async function supabaseCommand(args) {
  const [subcommand, nested, ...rest] = args;
  if (subcommand !== "inventory" || nested !== "--draft") {
    throw new Error("Usage: foundation supabase inventory --draft --input <path>");
  }

  const inputIndex = rest.indexOf("--input");
  if (inputIndex === -1) {
    throw new Error("Supabase inventory draft requires --input <path>.");
  }

  const inputPath = rest[inputIndex + 1];
  if (!inputPath || inputPath.startsWith("--")) {
    throw new Error("Missing path after --input.");
  }

  await runScript("scripts/render-supabase-inventory-draft.mjs", ["--input", inputPath]);
}

async function playbookCommand(args) {
  const [subcommand, nested, ...rest] = args;
  if (subcommand !== "ingestion" || nested !== "--draft") {
    throw new Error("Usage: foundation playbook ingestion --draft --input <path>");
  }

  const inputIndex = rest.indexOf("--input");
  if (inputIndex === -1) {
    throw new Error("Playbook ingestion draft requires --input <path>.");
  }

  const inputPath = rest[inputIndex + 1];
  if (!inputPath || inputPath.startsWith("--")) {
    throw new Error("Missing path after --input.");
  }

  await runScript("scripts/render-playbook-ingestion-draft.mjs", ["--input", inputPath]);
}

async function registryCommand(args) {
  const [subcommand, ...rest] = args;
  if (subcommand !== "change-bundle") {
    throw new Error("Usage: foundation registry change-bundle --input <path>");
  }

  const inputIndex = rest.indexOf("--input");
  if (inputIndex === -1) {
    throw new Error("Registry change bundle requires --input <path>.");
  }

  const inputPath = rest[inputIndex + 1];
  if (!inputPath || inputPath.startsWith("--")) {
    throw new Error("Missing path after --input.");
  }

  await runScript("scripts/render-registry-change-bundle.mjs", ["--input", inputPath]);
}

function help() {
  console.log(`Foundation CLI

Commands:
  status [--json]      Print registry summary
  projects [--json]    List registered projects
  proof refresh --draft [--observations <path>]
                       Generate a proposal-only proof refresh draft
  playbook ingestion --draft --input <path>
                       Render a proposal-only Playbook ingestion draft
  registry change-bundle --input <path>
                       Render a proposal-only registry change bundle
  supabase inventory --draft --input <path>
                       Render a read-only Supabase inventory draft
  doctor               Run local verification
  help                 Show this help
`);
}

const [command = "status", ...args] = process.argv.slice(2);
const wantsJson = args.includes("--json");

try {
  if (command === "status") await status({ json: wantsJson });
  else if (command === "projects") await projects({ json: wantsJson });
  else if (command === "proof") await proofRefresh(args);
  else if (command === "playbook") await playbookCommand(args);
  else if (command === "registry") await registryCommand(args);
  else if (command === "supabase") await supabaseCommand(args);
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
