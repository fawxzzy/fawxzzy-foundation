const formatDate = (value, { withTime = false } = {}) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...(withTime
        ? {
            hour: "numeric",
            minute: "2-digit"
          }
        : {})
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const text = (value) => value ?? "-";

function statusClass(status) {
  return `status-${String(status).replaceAll("_", "-")}`;
}

function toneClass(status) {
  const value = String(status);
  if (["healthy", "verified", "ready", "current", "clean"].includes(value)) return "tone-good";
  if (
    [
      "pending-proof",
      "tracked",
      "mapped",
      "not-applicable",
      "needs-deployment-proof",
      "pending-confirmation",
      "repo-tracked",
      "dirty",
      "private-source",
      "legacy-mapping"
    ].includes(value)
  ) {
    return "tone-warn";
  }
  if (["stale", "missing", "failed"].includes(value)) return "tone-bad";
  return "tone-neutral";
}

function renderBulletList(items, formatter = (item) => text(item)) {
  if (!items?.length) return "";
  return `<ul class="ledger-list">${items.map((item) => `<li>${formatter(item)}</li>`).join("")}</ul>`;
}

function renderHealthRow(label, facet, extras = [], badges = []) {
  if (!facet) return "";
  const facts = extras.filter(Boolean);
  const meta = [facet.checkedAt ? `checked ${formatDate(facet.checkedAt, { withTime: true })}` : "", ...facts]
    .filter(Boolean)
    .join(" | ");

  return `
    <div class="health-row">
      <div class="health-row-header">
        <p class="health-label">${label}</p>
        <div class="status-pills">
          <span class="status-pill ${toneClass(facet.status)}">${text(facet.status)}</span>
          ${badges.map((badge) => `<span class="status-pill ${toneClass(badge)}">${text(badge)}</span>`).join("")}
        </div>
      </div>
      <p class="health-summary">${text(facet.summary)}</p>
      ${meta ? `<p class="health-meta">${meta}</p>` : ""}
    </div>
  `;
}

function renderHealth(project) {
  const health = project.health;
  if (!health) return "";

  const proofExtras = [
    health.proof.lastDeploymentProofAt
      ? `proof ${formatDate(health.proof.lastDeploymentProofAt, { withTime: true })}`
      : "proof not yet recorded",
    `refresh ${health.proof.staleAfterHours}h`,
    health.proof.qualitySummary ? health.proof.qualitySummary : "",
    health.proof.isStale ? "stale" : ""
  ];

  return `
    <section class="health-panel">
      <div class="health-panel-header">
        <div>
          <p class="health-kicker">Health</p>
          <h4>${text(health.status)}</h4>
        </div>
        <p class="health-overview">${text(health.summary)}</p>
      </div>
      <div class="health-grid">
        ${renderHealthRow("GitHub", health.github)}
        ${renderHealthRow("Vercel", health.vercel, [
          health.vercel.projectNames?.length ? health.vercel.projectNames.join(", ") : ""
        ])}
        ${renderHealthRow("Deployment", health.deployment, [
          health.deployment.deploymentId ? `deploy ${health.deployment.deploymentId}` : "",
          health.deployment.githubCommitSha ? `commit ${health.deployment.githubCommitSha.slice(0, 7)}` : "",
          health.deployment.alias ? health.deployment.alias : ""
        ])}
        ${renderHealthRow("Proof", health.proof, proofExtras, health.proof.qualityStates ?? [])}
      </div>
    </section>
  `;
}

function renderPromotion(project) {
  const promotion = project.promotion;
  if (!promotion) return "";

  const facts = [];
  facts.push(`<p><strong>Promotion:</strong> ${text(promotion.label)}</p>`);
  if (promotion.targetLabel) facts.push(`<p><strong>Target:</strong> ${text(promotion.targetLabel)}</p>`);
  if (promotion.blockedOn) facts.push(`<p><strong>Blocked on:</strong> ${text(promotion.blockedOn)}</p>`);
  if (promotion.registryCommit?.sha && promotion.registryCommit?.message) {
    facts.push(
      `<p><strong>${text(promotion.registryCommit.label ?? "Registry commit")}:</strong> ${text(promotion.registryCommit.sha)} (${text(promotion.registryCommit.message)})</p>`
    );
  }
  if (promotion.vercelObservation?.projectName && promotion.vercelObservation?.status) {
    facts.push(
      `<p><strong>Vercel:</strong> ${text(promotion.vercelObservation.projectName)} ${text(promotion.vercelObservation.status)}</p>`
    );
  }
  if (promotion.vercelObservation?.visibleProjects?.length) {
    facts.push(
      `<p><strong>Visible projects:</strong> ${promotion.vercelObservation.visibleProjects.map((item) => text(item)).join(", ")}</p>`
    );
  }

  const notes = renderBulletList(promotion.notes);
  const sourceNote = promotion.sourceNote ? `<p>${text(promotion.sourceNote)}</p>` : "";
  const checklist = renderBulletList(
    promotion.checklist,
    (item) => `${item.done ? "[x]" : "[ ]"} ${text(item.label)}`
  );
  const nextValidMove = renderBulletList(promotion.nextValidMove);

  return `
    <div class="ledger">
      ${facts.join("")}
      ${notes}
      ${sourceNote}
      ${checklist ? `<p><strong>Promotion ledger</strong></p>${checklist}` : ""}
      ${nextValidMove ? `<p><strong>Next valid move</strong></p>${nextValidMove}` : ""}
    </div>
  `;
}

function projectCard(project) {
  const repoLabel = project.repo?.fullName ?? "No repo mapped";
  const deploymentLabel =
    project.vercel?.projects?.map((item) => item.name).join(", ") ??
    project.vercel?.projectName ??
    "No deployment mapped";
  const next = project.nextActions?.[0] ?? "No next action recorded";
  const stack = project.stack?.slice(0, 4) ?? [];

  return `
    <article class="card">
      <p class="eyebrow ${statusClass(project.status)}">${text(project.status)}</p>
      <h3>${text(project.name)}</h3>
      <p>${text(project.summary)}</p>
      <div class="tags">
        <span class="tag">${text(project.kind)}</span>
        <span class="tag">${repoLabel}</span>
        <span class="tag">${deploymentLabel}</span>
      </div>
      ${renderHealth(project)}
      ${renderPromotion(project)}
      <p><strong>Next:</strong> ${text(next)}</p>
      ${stack.length ? `<p><strong>Stack:</strong> ${stack.join(", ")}</p>` : ""}
    </article>
  `;
}

async function boot() {
  const response = await fetch("/foundation.projects.json");
  if (!response.ok) throw new Error(`Unable to load registry: ${response.status}`);
  const data = await response.json();

  document.querySelector("#totalProjects").textContent = data.summary.totalProjects;
  document.querySelector("#activeProjects").textContent = data.summary.activeProjects;
  document.querySelector("#deploymentMappedProjects").textContent = data.summary.deploymentMappedProjects;
  document.querySelector("#currentProofProjects").textContent = data.summary.currentProofProjects;
  document.querySelector("#healthSnapshot").textContent =
    `${data.summary.pendingProofProjects} pending proof | ${data.summary.staleProofProjects} stale | ${data.summary.proofWarningProjects} quality warnings`;
  document.querySelector("#updatedAt").textContent = `Registry updated ${formatDate(data.summary.updatedAt, { withTime: true })}`;

  const projects = [...data.projects].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.slug.localeCompare(b.slug);
  });

  document.querySelector("#projectGrid").innerHTML = projects.map(projectCard).join("");
}

boot().catch((error) => {
  document.querySelector("#projectGrid").innerHTML =
    `<article class="card"><h3>Registry failed to load</h3><p>${error.message}</p></article>`;
});
