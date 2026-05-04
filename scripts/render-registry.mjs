#!/usr/bin/env node
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const registryPath = path.join(root, "data/projects.json");
const outputPath = path.join(root, "docs/architecture/PROJECT_REGISTRY.md");

function value(input) {
  if (input === null || input === undefined) return "unknown";
  if (typeof input === "boolean") return input ? "yes" : "no";
  return String(input);
}

function escapeMd(input) {
  return value(input).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function formatVercelProject(project) {
  if (!project?.name) return "unknown";
  return project.role ? `${project.name} (${project.role})` : project.name;
}

function vercelLabel(project) {
  if (!project.vercel) return "-";
  if (project.vercel.projects?.length) return project.vercel.projects.map((item) => formatVercelProject(item)).join(", ");
  return project.vercel.projectName ?? (project.vercel.exists ? "mapped" : "planned");
}

function formatTimestamp(input) {
  return input ? `\`${input}\`` : "unknown";
}

function formatProofQuality(proof) {
  if (!Array.isArray(proof?.qualityStates) || proof.qualityStates.length === 0) return "";
  const states = proof.qualityStates.map((state) => `\`${state}\``).join(", ");
  return proof.qualitySummary ? `${states} - ${proof.qualitySummary}` : states;
}

function isProofStale(proof, now = Date.now()) {
  if (!proof?.lastDeploymentProofAt || typeof proof.staleAfterHours !== "number") return false;
  const observedAt = Date.parse(proof.lastDeploymentProofAt);
  if (Number.isNaN(observedAt)) return false;
  return now - observedAt > proof.staleAfterHours * 60 * 60 * 1000;
}

function renderProofRemediation(proof) {
  if (!proof?.remediation?.classes?.length) return [];

  const lines = [];
  if (proof.remediation.summary) {
    lines.push(`- Remediation summary: ${proof.remediation.summary}`);
  }

  for (const entry of proof.remediation.classes) {
    lines.push(`- Warning class \`${entry.state}\`: ${entry.summary}`);
    lines.push(`- Owner for \`${entry.state}\`: ${entry.owner}`);
    lines.push(`- Next action for \`${entry.state}\`: ${entry.nextActions.join("; ")}`);
    lines.push(`- Safe proof refresh for \`${entry.state}\`: ${entry.safeProofRefreshCriteria.join("; ")}`);
  }

  return lines;
}

function renderStateMachine(project) {
  const lines = [];

  if (project.desiredState) {
    lines.push(`- Desired: lifecycle \`${project.desiredState.lifecycle}\`, role \`${project.desiredState.role}\``);
    lines.push(`- Desired summary: ${project.desiredState.summary}`);
    lines.push(`- Owner intent: ${project.desiredState.ownerIntent}`);
  }

  if (project.observedState) {
    lines.push(
      `- Observed: repo \`${project.observedState.repo}\`, deployment \`${project.observedState.deployment}\`, database \`${project.observedState.database}\`, proof \`${project.observedState.proof}\``
    );
    lines.push(`- Observed summary: ${project.observedState.summary}`);
  }

  if (project.healthState) {
    lines.push(`- Health judgment: overall \`${project.healthState.overall}\`, quality \`${project.healthState.quality}\``);
    lines.push(`- Health summary: ${project.healthState.summary}`);
    for (const warning of project.healthState.warnings ?? []) {
      lines.push(`- Health warning: ${warning}`);
    }
    for (const blocker of project.healthState.blockers ?? []) {
      lines.push(`- Health blocker: ${blocker}`);
    }
  }

  if (project.desiredState || project.observedState || project.healthState) {
    lines.push(`- Legacy compatibility status: \`${project.status}\``);
  }

  return lines;
}

function renderHealth(project, now = Date.now()) {
  const health = project.health;
  if (!health) return "";

  const lines = [`### ${project.name}`];
  lines.push(...renderStateMachine(project));
  lines.push(`- Overall health facet: \`${health.status}\` - ${health.summary}`);
  lines.push(`- GitHub: \`${health.github.status}\` - ${health.github.summary} (checked ${formatTimestamp(health.github.checkedAt)})`);
  lines.push(`- Vercel: \`${health.vercel.status}\` - ${health.vercel.summary} (checked ${formatTimestamp(health.vercel.checkedAt)})`);

  if (health.vercel.projectNames?.length) {
    lines.push(`- Vercel projects: ${health.vercel.projectNames.map((item) => `\`${item}\``).join(", ")}`);
  }
  if (project.vercel?.projects?.length) {
    lines.push(`- Recorded Vercel mappings: ${project.vercel.projects.map((item) => `\`${formatVercelProject(item)}\``).join(", ")}`);
  }

  lines.push(
    `- Deployment: \`${health.deployment.status}\` - ${health.deployment.summary} (checked ${formatTimestamp(health.deployment.checkedAt)})`
  );

  const deploymentFacts = [];
  if (health.deployment.deploymentId) deploymentFacts.push(`deployment \`${health.deployment.deploymentId}\``);
  if (health.deployment.target) deploymentFacts.push(`target \`${health.deployment.target}\``);
  if (health.deployment.alias) deploymentFacts.push(`alias \`${health.deployment.alias}\``);
  if (health.deployment.githubCommitSha) deploymentFacts.push(`commit \`${health.deployment.githubCommitSha}\``);
  if (health.deployment.message) deploymentFacts.push(`message "${escapeMd(health.deployment.message)}"`);
  if (deploymentFacts.length) lines.push(`- Latest deployment facts: ${deploymentFacts.join(", ")}`);

  const stale = isProofStale(health.proof, now);
  lines.push(
    `- Proof: \`${health.proof.status}${stale ? " / stale" : ""}\` - ${health.proof.summary} (checked ${formatTimestamp(health.proof.checkedAt)})`
  );
  lines.push(`- Proof freshness window: ${health.proof.staleAfterHours}h`);

  if (health.proof.lastDeploymentProofAt) {
    lines.push(`- Last deployment proof captured: ${formatTimestamp(health.proof.lastDeploymentProofAt)}`);
  }
  const proofQuality = formatProofQuality(health.proof);
  if (proofQuality) {
    lines.push(`- Proof quality: ${proofQuality}`);
  }
  lines.push(...renderProofRemediation(health.proof));
  if (health.proof.promotionProofCommitSha) {
    lines.push(`- Pinned promotion proof commit: \`${health.proof.promotionProofCommitSha}\``);
  }
  if (health.proof.promotionProofDeploymentId) {
    lines.push(`- Pinned promotion proof deployment: \`${health.proof.promotionProofDeploymentId}\``);
  }
  if (health.proof.latestObservedCommitSha) {
    lines.push(`- Latest observed deployment commit: \`${health.proof.latestObservedCommitSha}\``);
  }
  if (health.proof.latestObservedDeploymentId) {
    lines.push(`- Latest observed deployment id: \`${health.proof.latestObservedDeploymentId}\``);
  }

  return lines.join("\n");
}

function renderPromotion(project) {
  const promotion = project.promotion;
  if (!promotion) return "";

  const lines = [`### ${project.name}`];

  lines.push(`- Current label: \`${promotion.label}\``);
  if (promotion.targetLabel) lines.push(`- Promotion target: \`${promotion.targetLabel}\``);
  if (promotion.blockedOn) lines.push(`- Blocked on: \`${promotion.blockedOn}\``);
  for (const note of promotion.notes ?? []) lines.push(`- ${note}`);
  if (promotion.sourceNote) lines.push(`- ${promotion.sourceNote}`);

  if (promotion.registryCommit?.sha && promotion.registryCommit?.message) {
    lines.push(
      `- ${promotion.registryCommit.label ?? "Registry commit"}: \`${promotion.registryCommit.sha}\` (${promotion.registryCommit.message})`
    );
  }

  if (promotion.vercelObservation?.projectName && promotion.vercelObservation?.status) {
    lines.push(`- Vercel project \`${promotion.vercelObservation.projectName}\`: ${promotion.vercelObservation.status}`);
  }

  if (promotion.vercelObservation?.visibleProjects?.length) {
    lines.push(`- Visible Vercel projects: ${promotion.vercelObservation.visibleProjects.map((item) => `\`${item}\``).join(", ")}`);
  }

  if (promotion.checklist?.length) {
    lines.push("", "| Gate | State |", "| --- | --- |");
    for (const item of promotion.checklist) {
      lines.push(`| ${escapeMd(item.label)} | ${item.done ? "[x]" : "[ ]"} |`);
    }
  }

  if (promotion.nextValidMove?.length) {
    lines.push("", "Next valid move:");
    for (const [index, step] of promotion.nextValidMove.entries()) {
      lines.push(`${index + 1}. ${step}`);
    }
  }

  return lines.join("\n");
}

const registry = JSON.parse(await readFile(registryPath, "utf8"));
const now = Date.now();
const projects = [...registry.projects].sort((a, b) => {
  if (a.priority !== b.priority) return a.priority - b.priority;
  return a.slug.localeCompare(b.slug);
});

const rows = projects.map((project) => [
  project.slug,
  project.name,
  project.kind,
  project.desiredState?.lifecycle ?? "-",
  project.observedState?.proof ?? "-",
  project.healthState?.overall ?? "-",
  project.status,
  project.repo?.fullName ?? "-",
  value(project.repo?.exists),
  vercelLabel(project),
  project.nextActions?.[0] ?? "-"
]);

const promotionSections = projects
  .map((project) => renderPromotion(project))
  .filter(Boolean)
  .join("\n\n");

const healthSections = projects
  .map((project) => renderHealth(project, now))
  .filter(Boolean)
  .join("\n\n");

const activeCount = projects.filter((project) => (project.desiredState?.lifecycle ?? project.status) === "active").length;
const md = `# Project Registry

Generated from \`data/projects.json\`. Do not hand-edit this file unless the generator is also updated.

Updated: ${registry.updatedAt}

## Summary

- Owner: ${registry.owner}
- Projects: ${projects.length}
- Active projects: ${activeCount}
- Deployment-mapped projects: ${projects.filter((project) => project.vercel?.exists).length}

## State Model

- Rule: Desired state, observed state, and health judgment must remain separate machine fields.
- Pattern: \`desiredState -> observedState -> healthState -> derived prose\`.
- Failure mode: Scorecards built on blended status fields create false precision and rewrite pressure.
- Legacy compatibility: \`status\` remains present for existing consumers, but migrated projects derive it from the split model.

## Projects

| Slug | Name | Kind | Desired lifecycle | Observed proof | Health | Legacy status | Repo | Repo exists | Vercel | First next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.map((row) => `| ${row.map(escapeMd).join(" | ")} |`).join("\n")}

${healthSections ? `\n## Health Ledger\n\n${healthSections}\n` : ""}

${promotionSections ? `\n## Promotion Ledger\n\n${promotionSections}\n` : ""}

## Principles

${registry.principles.map((principle) => `- ${principle}`).join("\n")}
`;

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, md, "utf8");
console.log(`Rendered ${path.relative(root, outputPath)}`);
