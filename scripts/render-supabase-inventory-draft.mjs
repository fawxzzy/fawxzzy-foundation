#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outputJsonPath = path.join(root, ".foundation/supabase-inventory-draft.json");
const outputMdPath = path.join(root, ".foundation/supabase-inventory-draft.md");
const scopeOrder = [
  "public-app",
  "auth-system",
  "storage-system",
  "realtime-system",
  "vault-system",
  "other-system"
];
const supportedObservationModes = new Set(["manual", "connector-unavailable", "live-connector"]);

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

function classifySchemaScope(schemaName) {
  switch (schemaName) {
    case "public":
      return "public-app";
    case "auth":
      return "auth-system";
    case "storage":
      return "storage-system";
    case "realtime":
      return "realtime-system";
    case "vault":
      return "vault-system";
    default:
      return "other-system";
  }
}

function emptyScopeCounts() {
  return Object.fromEntries(scopeOrder.map((scope) => [scope, 0]));
}

function countBy(items, getKey) {
  const counts = {};
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function classifyRlsPosture(tables) {
  if (tables.length === 0) {
    return "unknown";
  }

  const enabled = tables.filter((table) => table.rlsEnabled).length;
  if (enabled === tables.length) {
    return "protected";
  }
  if (enabled === 0) {
    return "unprotected";
  }
  return "mixed";
}

function normalizeAdvisors(group, label) {
  if (!group || typeof group !== "object") {
    throw new Error(`Supabase inventory draft ${label} advisor section is required`);
  }

  if (!supportedObservationModes.has(group.observationMode)) {
    throw new Error(`Supabase inventory draft ${label} observationMode must be manual, connector-unavailable, or live-connector`);
  }

  const findings = Array.isArray(group.findings)
    ? group.findings.map((finding) => ({
      name: String(finding?.name ?? ""),
      title: String(finding?.title ?? ""),
      level: String(finding?.level ?? ""),
      category: String(finding?.category ?? finding?.categories?.[0] ?? ""),
      detail: String(finding?.detail ?? ""),
      remediation: String(finding?.remediation ?? ""),
      ...(finding?.facing ? { facing: String(finding.facing) } : {})
    }))
    : [];

  for (const finding of findings) {
    for (const field of ["name", "title", "level", "category", "detail", "remediation"]) {
      if (!finding[field]) {
        throw new Error(`Supabase inventory draft ${label} finding is missing ${field}`);
      }
    }
  }

  const findingsCount = findings.length;
  const countsByLevel = countBy(findings, (finding) => finding.level);
  const countsByName = countBy(findings, (finding) => finding.name);
  const countsByCategory = countBy(findings, (finding) => finding.category);
  const summary =
    typeof group.summary === "string" && group.summary.length > 0
      ? group.summary
      : findingsCount === 0
        ? "No advisor findings recorded."
        : `${findingsCount} advisor finding${findingsCount === 1 ? "" : "s"} recorded.`;

  return {
    observationMode: group.observationMode,
    summary,
    findingsCount,
    countsByLevel,
    countsByName,
    countsByCategory,
    findings
  };
}

function normalizeDatabase(database) {
  if (!database || typeof database !== "object") {
    throw new Error("Supabase inventory draft database is required");
  }
  if (!Array.isArray(database.schemas)) {
    throw new Error("Supabase inventory draft database.schemas must be an array");
  }
  if (!Array.isArray(database.tables)) {
    throw new Error("Supabase inventory draft database.tables must be an array");
  }

  const tables = database.tables.map((table) => {
    const schema = String(table?.schema ?? "");
    const name = String(table?.name ?? "");
    const scopeClassification = table?.scopeClassification ?? classifySchemaScope(schema);

    if (!schema || !name) {
      throw new Error("Supabase inventory draft database.tables entries must include schema and name");
    }
    if (typeof table?.rlsEnabled !== "boolean") {
      throw new Error(`Supabase inventory draft table ${schema}.${name} must include boolean rlsEnabled`);
    }
    if (typeof table?.rows !== "number" || table.rows < 0) {
      throw new Error(`Supabase inventory draft table ${schema}.${name} must include non-negative rows`);
    }

    return {
      name,
      schema,
      scopeClassification,
      rlsEnabled: table.rlsEnabled,
      rows: table.rows,
      ...(typeof table?.comment === "string" && table.comment.length > 0 ? { comment: table.comment } : {})
    };
  });

  const schemaTableCounts = countBy(tables, (table) => table.schema);
  const schemas = database.schemas.map((schema) => {
    const schemaName = String(schema?.schema ?? "");
    const scopeClassification = schema?.scopeClassification ?? classifySchemaScope(schemaName);
    const tableCount = typeof schema?.tableCount === "number" ? schema.tableCount : (schemaTableCounts[schemaName] ?? 0);

    if (!schemaName) {
      throw new Error("Supabase inventory draft database.schemas entries must include schema");
    }

    return {
      schema: schemaName,
      tableCount,
      scopeClassification
    };
  });

  const disabledTableNames = tables
    .filter((table) => !table.rlsEnabled)
    .map((table) => `${table.schema}.${table.name}`);
  const publicAppTables = tables.filter((table) => table.scopeClassification === "public-app");
  const systemTables = tables.filter((table) => table.scopeClassification !== "public-app");
  const publicAppDisabledTableNames = publicAppTables
    .filter((table) => !table.rlsEnabled)
    .map((table) => `${table.schema}.${table.name}`);
  const systemDisabledTableNames = systemTables
    .filter((table) => !table.rlsEnabled)
    .map((table) => `${table.schema}.${table.name}`);
  const scopeCounts = emptyScopeCounts();

  for (const table of tables) {
    scopeCounts[table.scopeClassification] += 1;
  }

  return {
    schemas,
    tables,
    rlsSummary: {
      enabledTables: tables.filter((table) => table.rlsEnabled).length,
      disabledTables: disabledTableNames.length,
      disabledTableNames,
      scopeCounts,
      publicAppEnabledTables: publicAppTables.filter((table) => table.rlsEnabled).length,
      publicAppDisabledTables: publicAppDisabledTableNames.length,
      publicAppDisabledTableNames,
      systemEnabledTables: systemTables.filter((table) => table.rlsEnabled).length,
      systemDisabledTables: systemDisabledTableNames.length,
      systemDisabledTableNames
    }
  };
}

function buildBlockedReasons(database, advisors) {
  const reasons = [];

  if (database.rlsSummary.publicAppDisabledTables > 0) {
    reasons.push(`Public app tables without RLS remain present: ${database.rlsSummary.publicAppDisabledTableNames.join(", ")}.`);
  }

  if (advisors.security.observationMode === "connector-unavailable") {
    reasons.push("Security advisor evidence is unavailable, so Foundation cannot make a stronger privacy claim.");
  }

  if ((advisors.security.countsByName.function_search_path_mutable ?? 0) > 0) {
    reasons.push(`Security advisor reported ${advisors.security.countsByName.function_search_path_mutable} function_search_path_mutable warning(s) on exposed SQL functions.`);
  }

  if ((advisors.security.countsByName.auth_leaked_password_protection ?? 0) > 0) {
    reasons.push("Security advisor reported leaked password protection is disabled for Supabase Auth.");
  }

  if ((advisors.performance.countsByName.auth_rls_initplan ?? 0) > 0) {
    reasons.push(`Performance advisor reported ${advisors.performance.countsByName.auth_rls_initplan} auth_rls_initplan warning(s) on public RLS policies.`);
  }

  if ((advisors.performance.countsByName.unindexed_foreign_keys ?? 0) > 0) {
    reasons.push(`Performance advisor reported ${advisors.performance.countsByName.unindexed_foreign_keys} unindexed foreign key finding(s).`);
  }

  if ((advisors.performance.countsByName.unused_index ?? 0) > 0) {
    reasons.push(`Performance advisor reported ${advisors.performance.countsByName.unused_index} unused index finding(s).`);
  }

  return reasons;
}

function normalizePosture(database, advisors, inputPosture = {}) {
  const publicAppTables = database.tables.filter((table) => table.scopeClassification === "public-app");
  const systemTables = database.tables.filter((table) => table.scopeClassification !== "public-app");
  const publicAppRlsPosture = classifyRlsPosture(publicAppTables);
  const systemSchemaRlsPosture = classifyRlsPosture(systemTables);
  const overallRlsPosture = classifyRlsPosture(database.tables);
  const blockedReasons = buildBlockedReasons(database, advisors);

  let privacyClaimPosture = "draft";
  if (
    publicAppRlsPosture !== "protected" ||
    advisors.security.findingsCount > 0 ||
    advisors.security.observationMode === "connector-unavailable"
  ) {
    privacyClaimPosture = "blocked";
  } else if (inputPosture?.privacyClaimPosture === "unclaimed") {
    privacyClaimPosture = "unclaimed";
  }

  const summary = `Public app schemas are ${publicAppRlsPosture}, system schemas are ${systemSchemaRlsPosture}, overall RLS is ${overallRlsPosture}, and privacy claims remain ${privacyClaimPosture}.`;

  return {
    publicAppRlsPosture,
    systemSchemaRlsPosture,
    overallRlsPosture,
    privacyClaimPosture,
    summary,
    blockedReasons
  };
}

function normalizeDraft(draft, inputPath) {
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
  if (!draft.input || (draft.input.captureMode !== "example" && draft.input.captureMode !== "operator-capture")) {
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
  if (!Array.isArray(draft.migrations?.items)) {
    throw new Error("Supabase inventory draft migrations.items must be an array");
  }
  if (!Array.isArray(draft.extensions?.installed)) {
    throw new Error("Supabase inventory draft extensions.installed must be an array");
  }
  if (!Array.isArray(draft.edgeFunctions?.items)) {
    throw new Error("Supabase inventory draft edgeFunctions.items must be an array");
  }

  const database = normalizeDatabase(draft.database);
  const advisors = {
    security: normalizeAdvisors(draft.advisors?.security, "security"),
    performance: normalizeAdvisors(draft.advisors?.performance, "performance")
  };
  const posture = normalizePosture(database, advisors, draft.posture);

  return {
    schemaVersion: 1,
    status: "proposal-only",
    mutationAuthority: "none",
    generatedAt: draft.generatedAt,
    input: {
      path: draft.input.path || inputPath,
      captureMode: draft.input.captureMode,
      generatedAt: draft.input.generatedAt
    },
    project: draft.project,
    database,
    migrations: {
      count: draft.migrations.count,
      latestVersion: draft.migrations.latestVersion ?? null,
      items: draft.migrations.items
    },
    extensions: {
      installedCount: draft.extensions.installedCount,
      installed: draft.extensions.installed
    },
    edgeFunctions: {
      count: draft.edgeFunctions.count,
      items: draft.edgeFunctions.items
    },
    advisors,
    posture
  };
}

function renderCounts(counts) {
  const entries = Object.entries(counts).sort(([left], [right]) => left.localeCompare(right));
  if (entries.length === 0) {
    return "none";
  }
  return entries.map(([key, value]) => `\`${key}\`: ${value}`).join(", ");
}

function renderFindings(label, group, lines) {
  lines.push(`- ${label} advisor mode: \`${group.observationMode}\``);
  lines.push(`- ${label} findings: ${group.findingsCount}`);
  lines.push(`- ${label} summary: ${group.summary}`);
  lines.push(`- ${label} counts by level: ${renderCounts(group.countsByLevel)}`);
  lines.push(`- ${label} counts by class: ${renderCounts(group.countsByName)}`);
  lines.push(`- ${label} counts by category: ${renderCounts(group.countsByCategory)}`);

  if (group.findings.length > 0) {
    lines.push("", `### ${label} Findings`, "", "| Name | Level | Category | Detail | Remediation |", "| --- | --- | --- | --- | --- |");
    for (const finding of group.findings) {
      lines.push(`| ${finding.name} | ${finding.level} | ${finding.category} | ${finding.detail.replaceAll("|", "\\|")} | ${finding.remediation} |`);
    }
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
    `- RLS disabled tables: ${draft.database.rlsSummary.disabledTables}`,
    `- Public app RLS enabled tables: ${draft.database.rlsSummary.publicAppEnabledTables}`,
    `- Public app RLS disabled tables: ${draft.database.rlsSummary.publicAppDisabledTables}`,
    `- System RLS enabled tables: ${draft.database.rlsSummary.systemEnabledTables}`,
    `- System RLS disabled tables: ${draft.database.rlsSummary.systemDisabledTables}`,
    `- Scope counts: ${renderCounts(draft.database.rlsSummary.scopeCounts)}`
  ];

  if (draft.database.rlsSummary.disabledTableNames.length > 0) {
    lines.push(`- RLS disabled table names: ${draft.database.rlsSummary.disabledTableNames.map((name) => `\`${name}\``).join(", ")}`);
  }

  lines.push("", "| Schema | Scope | Table count |", "| --- | --- | --- |");
  for (const schema of draft.database.schemas) {
    lines.push(`| ${schema.schema} | ${schema.scopeClassification} | ${schema.tableCount} |`);
  }

  lines.push("", "## Tables", "", "| Name | Schema | Scope | RLS | Rows |", "| --- | --- | --- | --- | --- |");
  for (const table of draft.database.tables) {
    lines.push(`| ${table.name} | ${table.schema} | ${table.scopeClassification} | ${table.rlsEnabled ? "yes" : "no"} | ${table.rows} |`);
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
  renderFindings("Security", draft.advisors.security, lines);
  lines.push("");
  renderFindings("Performance", draft.advisors.performance, lines);

  lines.push("", "## Posture", "");
  lines.push(`- Public app RLS posture: \`${draft.posture.publicAppRlsPosture}\``);
  lines.push(`- System schema RLS posture: \`${draft.posture.systemSchemaRlsPosture}\``);
  lines.push(`- Overall RLS posture: \`${draft.posture.overallRlsPosture}\``);
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
const normalizedDraft = normalizeDraft(draft, toRelativePath(inputPath));

await mkdir(path.dirname(outputJsonPath), { recursive: true });
await writeFile(outputJsonPath, JSON.stringify(normalizedDraft, null, 2) + "\n", "utf8");
await writeFile(outputMdPath, renderMarkdown(normalizedDraft), "utf8");

console.log(`Rendered ${toRelativePath(outputJsonPath)}`);
console.log(`Rendered ${toRelativePath(outputMdPath)}`);
