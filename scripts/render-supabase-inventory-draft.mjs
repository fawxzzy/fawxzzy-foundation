#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputJsonPath = path.join(root, ".foundation/supabase-inventory-draft.json");
const outputMdPath = path.join(root, ".foundation/supabase-inventory-draft.md");

function timestamp(value) {
  const parsed = Date.parse(value ?? "");
  return Number.isNaN(parsed) ? null : parsed;
}

function isIsoTimestamp(value) {
  return typeof value === "string" && timestamp(value) !== null;
}

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
    throw new Error("Usage: node scripts/render-supabase-inventory-draft.mjs --input <path>");
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

function validateDraft(draft) {
  if (!draft || typeof draft !== "object") {
    throw new Error("Supabase inventory draft input must be an object");
  }
  if (draft.schemaVersion !== 1) {
    throw new Error("Supabase inventory draft schemaVersion must be 1");
  }
  if (draft.status !== "proposal-only") {
    throw new Error("Supabase inventory draft status must be proposal-only");
  }
  if (draft.mutationAuthority !== "none") {
    throw new Error("Supabase inventory draft mutationAuthority must be none");
  }
  if (!isIsoTimestamp(draft.generatedAt)) {
    throw new Error("Supabase inventory draft generatedAt must be an ISO timestamp");
  }
  if (!draft.input || draft.input.captureMode !== "example" && draft.input.captureMode !== "operator-capture") {
    throw new Error("Supabase inventory draft input.captureMode must be example or operator-capture");
  }
  if (!isIsoTimestamp(draft.input.generatedAt)) {
    throw new Error("Supabase inventory draft input.generatedAt must be an ISO timestamp");
  }
  if (!draft.project || typeof draft.project.slug !== "string" || draft.project.slug.length === 0) {
    throw new Error("Supabase inventory draft project.slug is required");
  }
  if (!isIsoTimestamp(draft.project.observedAt)) {
    throw new Error("Supabase inventory draft project.observedAt must be an ISO timestamp");
  }
  if (!Array.isArray(draft.database?.schemas)) {
    throw new Error("Supabase inventory draft database.schemas must be an array");
  }
  if (!Array.isArray(draft.database?.tables)) {
    throw new Error("Supabase inventory draft database.tables must be an array");
  }
  if (!draft.database?.rlsSummary || typeof draft.database.rlsSummary !== "object") {
    throw new Error("Supabase inventory draft database.rlsSummary is required");
  }
  if (!Array.isArray(draft.migrations?.items)) {
    throw new Error("Supabase inventory draft migrations.items must be an array");
  }
  if (!Array.isArray(draft.extensions?.installed)) {
    throw new Error("Supabase inventory draft extensions.installed must be an array");
  }
  if (!Array.isArray(draft.edgeFunctions?.items)) {
    throw new Error("Supabase inventory draft edgeFunctions.items must be an array");
  }
  if (!draft.advisors?.security || !draft.advisors?.performance) {
    throw new Error("Supabase inventory draft advisors.security and advisors.performance are required");
  }
  if (!draft.posture || typeof draft.posture.summary !== "string" || draft.posture.summary.length === 0) {
    throw new Error("Supabase inventory draft posture.summary is required");
  }
}

function renderMarkdown(draft) {
  const lines = [
    "# Supabase Inventory Draft",
    "",
    "- Status: `proposal-only`",
    "- Mutation authority: `none`",
    `- Generated: \`${draft.generatedAt}\``,
    `- Input: \`${draft.input.path}\``,
    `- Input capture mode: \`${draft.input.captureMode}\``,
    "",
    "## Project",
    "",
    `- Slug: \`${draft.project.slug}\``,
    `- Project ref: \`${draft.project.projectRef}\``,
    `- Project name: ${draft.project.projectName}`,
    `- Region: \`${draft.project.region}\``,
    `- Status: \`${draft.project.status}\``,
    `- Postgres version: \`${draft.project.postgresVersion}\``,
    `- Observed at: \`${draft.project.observedAt}\``,
    "",
    "## Database Summary",
    "",
    `- Schemas: ${draft.database.schemas.length}`,
    `- Tables: ${draft.database.tables.length}`,
    `- RLS enabled tables: ${draft.database.rlsSummary.enabledTables}`,
    `- RLS disabled tables: ${draft.database.rlsSummary.disabledTables}`
  ];

  if (draft.database.rlsSummary.disabledTableNames.length > 0) {
    lines.push(`- RLS disabled table names: ${draft.database.rlsSummary.disabledTableNames.map((name) => `\`${name}\``).join(", ")}`);
  }

  lines.push("", "| Schema | Table count |", "| --- | --- |");
  for (const schema of draft.database.schemas) {
    lines.push(`| ${schema.schema} | ${schema.tableCount} |`);
  }

  lines.push("", "## Tables", "", "| Name | Schema | RLS | Rows |", "| --- | --- | --- | --- |");
  for (const table of draft.database.tables) {
    lines.push(`| ${table.name} | ${table.schema} | ${table.rlsEnabled ? "yes" : "no"} | ${table.rows} |`);
  }

  lines.push("", "## Migrations", "", `- Count: ${draft.migrations.count}`, `- Latest version: ${draft.migrations.latestVersion ?? "none"}`);
  if (draft.migrations.items.length > 0) {
    lines.push("", "| Version | Name |", "| --- | --- |");
    for (const migration of draft.migrations.items) {
      lines.push(`| ${migration.version} | ${migration.name} |`);
    }
  }

  lines.push("", "## Extensions", "", `- Installed count: ${draft.extensions.installedCount}`);
  if (draft.extensions.installed.length > 0) {
    lines.push("", "| Name | Schema | Installed version |", "| --- | --- | --- |");
    for (const extension of draft.extensions.installed) {
      lines.push(`| ${extension.name} | ${extension.schema ?? "-"} | ${extension.installedVersion ?? "-"} |`);
    }
  }

  lines.push("", "## Edge Functions", "", `- Count: ${draft.edgeFunctions.count}`);
  if (draft.edgeFunctions.items.length > 0) {
    for (const fn of draft.edgeFunctions.items) {
      lines.push(`- \`${fn.slug}\``);
    }
  } else {
    lines.push("- none observed");
  }

  lines.push("", "## Advisors", "");
  lines.push(`- Security advisor: \`${draft.advisors.security.observationMode}\` - ${draft.advisors.security.summary}`);
  lines.push(`- Performance advisor: \`${draft.advisors.performance.observationMode}\` - ${draft.advisors.performance.summary}`);

  lines.push("", "## Posture", "");
  lines.push(`- RLS/security posture: \`${draft.posture.rlsSecurityPosture}\``);
  lines.push(`- Privacy claim posture: \`${draft.posture.privacyClaimPosture}\``);
  lines.push(`- Summary: ${draft.posture.summary}`);
  if (draft.posture.blockedReasons.length > 0) {
    for (const reason of draft.posture.blockedReasons) {
      lines.push(`- Blocked reason: ${reason}`);
    }
  }

  lines.push("", "## Operator Rule", "", "Review only. This draft does not mutate Supabase or the Foundation registry.");
  return lines.join("\n") + "\n";
}

const { input } = parseArgs(process.argv.slice(2));
const inputPath = resolvePath(input);
const raw = await readFile(inputPath, "utf8");
const draft = JSON.parse(raw);
validateDraft(draft);

await mkdir(path.dirname(outputJsonPath), { recursive: true });
await writeFile(outputJsonPath, JSON.stringify(draft, null, 2) + "\n", "utf8");
await writeFile(outputMdPath, renderMarkdown(draft), "utf8");

console.log(`Rendered ${toRelativePath(outputJsonPath)}`);
console.log(`Rendered ${toRelativePath(outputMdPath)}`);
