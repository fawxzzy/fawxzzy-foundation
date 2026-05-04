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
  if (["healthy", "verified", "ready", "current", "clean", "active", "observed"].includes(value)) return "tone-good";
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
      "legacy-mapping",
      "warning",
      "advisory",
      "incubating",
      "planned"
    ].includes(value)
  ) {
    return "tone-warn";
  }
  if (["stale", "missing", "failed", "blocked", "historical"].includes(value)) return "tone-bad";
  return "tone-neutral";
}

function renderBulletList(items, formatter = (item) => text(item)) {
  if (!items?.length) return "";
  return `<ul class="ledger-list">${items.map((item) => `<li>${formatter(item)}</li>`).join("")}</ul>`;
}

function formatVercelProject(project) {
  if (!project?.name) return "-";
  return project.role ? `${project.name} (${project.role})` : project.name;
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

function renderStateRow(label, summary, badges = [], detail = "") {
  if (!summary && badges.length === 0 && !detail) return "";

  return `
    <div class="state-row">
      <div class="health-row-header">
        <p class="health-label">${label}</p>
        <div class="status-pills">
          ${badges.map((badge) => `<span class="status-pill ${toneClass(badge)}">${text(badge)}</span>`).join("")}
        </div>
      </div>
      ${summary ? `<p class="health-summary">${text(summary)}</p>` : ""}
      ${detail ? `<p class="health-meta">${detail}</p>` : ""}
    </div>
  `;
}

function renderStatePanel(project) {
  if (!project.desiredState && !project.observedState && !project.healthState) return "";

  const desired = project.desiredState;
  const observed = project.observedState;
  const healthState = project.healthState;
  const healthDetail = [
    ...(healthState?.warnings ?? []).map((warning) => `warning: ${warning}`),
    ...(healthState?.blockers ?? []).map((blocker) => `blocker: ${blocker}`)
  ].join(" | ");

  return `
    <section class="state-panel">
      <div class="state-panel-header">
        <div>
          <p class="health-kicker">State model</p>
          <h4>Desired, observed, health</h4>
        </div>
        <p class="health-overview">Legacy status remains for compatibility, but the split fields are now the machine truth for migrated projects.</p>
      </div>
      <div class="state-grid">
        ${renderStateRow(
          "Desired",
          desired?.summary,
          [desired?.lifecycle, desired?.role].filter(Boolean),
          desired?.ownerIntent ?? ""
        )}
        ${renderStateRow(
          "Observed",
          observed?.summary,
          [observed?.repo, observed?.deployment, observed?.database, observed?.proof].filter(Boolean)
        )}
        ${renderStateRow(
          "Health",
          healthState?.summary,
          [healthState?.overall, healthState?.quality].filter(Boolean),
          healthDetail
        )}
      </div>
    </section>
  `;
}

function renderScorecard(project) {
  const scorecard = project.scorecard;
  if (!scorecard) {
    return "";
  }

  if (scorecard.status !== "scored") {
    return `
      <section class="scorecard-panel">
        <div class="scorecard-header">
          <div>
            <p class="health-kicker">Scorecard</p>
            <h4>${text(scorecard.status)}</h4>
          </div>
          <p class="health-overview">Scorecard generation is deferred until split-state migration is complete for this project.</p>
        </div>
      </section>
    `;
  }

  const scoreWarnings = [
    ...(scorecard.warnings ?? []).map((warning) => `warning: ${warning}`),
    ...(scorecard.blockers ?? []).map((blocker) => `blocker: ${blocker}`)
  ].join(" | ");

  return `
    <section class="scorecard-panel">
      <div class="scorecard-header">
        <div>
          <p class="health-kicker">Scorecard</p>
          <h4>${text(scorecard.verdict)} ${text(scorecard.score)}/${text(scorecard.maxScore)}</h4>
        </div>
        <p class="health-overview">Scorecards consume split-state truth and existing evidence; they do not replace registry proof.</p>
      </div>
      <div class="scorecard-grid">
        ${(scorecard.dimensions ?? [])
          .map(
            (dimension) => `
              <article class="scorecard-dimension">
                <div class="health-row-header">
                  <p class="health-label">${text(dimension.label)}</p>
                  <div class="status-pills">
                    <span class="status-pill ${toneClass(dimension.state === "pass" ? "healthy" : dimension.state === "warn" ? "warning" : dimension.state === "fail" ? "blocked" : "not-applicable")}">${text(dimension.state)}</span>
                  </div>
                </div>
                <p class="health-summary">${text(dimension.summary)}</p>
                <p class="health-meta">${text(dimension.points)}/${text(dimension.maxPoints)} points</p>
              </article>
            `
          )
          .join("")}
      </div>
      ${scoreWarnings ? `<p class="health-meta">${scoreWarnings}</p>` : ""}
      ${scorecard.nextAction ? `<p class="health-meta">next: ${text(scorecard.nextAction)}</p>` : ""}
    </section>
  `;
}

function renderProofRemediation(proof) {
  if (!proof?.remediation?.classes?.length) return "";

  return `
    <section class="remediation-panel">
      <div class="remediation-header">
        <p class="health-kicker">Proof remediation</p>
        <p class="remediation-summary">${text(proof.remediation.summary)}</p>
      </div>
      <div class="remediation-grid">
        ${proof.remediation.classes
          .map(
            (entry) => `
              <article class="remediation-card">
                <div class="health-row-header">
                  <p class="health-label">${text(entry.state)}</p>
                  <span class="status-pill ${toneClass(entry.state)}">${text(entry.state)}</span>
                </div>
                <p class="health-summary">${text(entry.summary)}</p>
                <p class="health-meta">Owner: ${text(entry.owner)}</p>
                <p class="health-meta">Next actions</p>
                ${renderBulletList(entry.nextActions)}
                <p class="health-meta">Safe refresh criteria</p>
                ${renderBulletList(entry.safeProofRefreshCriteria)}
              </article>
            `
          )
          .join("")}
      </div>
    </section>
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
          health.vercel.projectNames?.length ? `visible ${health.vercel.projectNames.join(", ")}` : "",
          project.vercel?.projects?.length ? `mappings ${project.vercel.projects.map((item) => formatVercelProject(item)).join(", ")}` : ""
        ])}
        ${renderHealthRow("Deployment", health.deployment, [
          health.deployment.deploymentId ? `deploy ${health.deployment.deploymentId}` : "",
          health.deployment.githubCommitSha ? `commit ${health.deployment.githubCommitSha.slice(0, 7)}` : "",
          health.deployment.alias ? health.deployment.alias : ""
        ])}
        ${renderHealthRow("Proof", health.proof, proofExtras, health.proof.qualityStates ?? [])}
      </div>
      ${renderProofRemediation(health.proof)}
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
    project.vercel?.projects?.map((item) => formatVercelProject(item)).join(", ") ??
    project.vercel?.projectName ??
    "No deployment mapped";
  const next = project.nextActions?.[0] ?? "No next action recorded";
  const stack = project.stack?.slice(0, 4) ?? [];
  const lifecycleLabel = project.desiredState?.lifecycle ?? project.status;

  return `
    <article class="card">
      <p class="eyebrow ${statusClass(lifecycleLabel)}">${text(lifecycleLabel)}</p>
      <h3>${text(project.name)}</h3>
      <p>${text(project.summary)}</p>
      <div class="tags">
        <span class="tag">${text(project.kind)}</span>
        <span class="tag">${repoLabel}</span>
        <span class="tag">${deploymentLabel}</span>
        ${project.status !== lifecycleLabel ? `<span class="tag">legacy ${text(project.status)}</span>` : ""}
      </div>
      ${renderStatePanel(project)}
      ${renderScorecard(project)}
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
  const warningStateCounts = Object.entries(data.summary.proofWarningStateCounts ?? {});
  const warningStateSummary = warningStateCounts.length
    ? warningStateCounts.map(([state, count]) => `${state} ${count}`).join(" | ")
    : "no proof warning classes";

  document.querySelector("#totalProjects").textContent = data.summary.totalProjects;
  document.querySelector("#activeProjects").textContent = data.summary.activeProjects;
  document.querySelector("#deploymentMappedProjects").textContent = data.summary.deploymentMappedProjects;
  document.querySelector("#currentProofProjects").textContent = data.summary.currentProofProjects;
  document.querySelector("#healthSnapshot").textContent =
    `${data.summary.pendingProofProjects} pending proof | ${data.summary.staleProofProjects} stale | ${data.summary.proofWarningProjects} proof warnings | ${data.summary.scoredProjects} scored | ${data.summary.warningScorecards} warning scorecards | ${warningStateSummary}`;
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
