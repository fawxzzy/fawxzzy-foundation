const formatDate = (value) => {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    }).format(new Date(value));
  } catch {
    return value;
  }
};

const text = (value) => value ?? "—";

function statusClass(status) {
  return `status-${String(status).replaceAll("_", "-")}`;
}

function projectCard(project) {
  const repoLabel = project.repo?.fullName ?? "No repo mapped";
  const deploymentLabel = project.vercel?.projects?.map((item) => item.name).join(", ") ?? project.vercel?.projectName ?? "No deployment mapped";
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
  document.querySelector("#updatedAt").textContent = `Registry updated ${formatDate(data.summary.updatedAt)}`;

  const projects = [...data.projects].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.slug.localeCompare(b.slug);
  });

  document.querySelector("#projectGrid").innerHTML = projects.map(projectCard).join("");
}

boot().catch((error) => {
  document.querySelector("#projectGrid").innerHTML = `<article class="card"><h3>Registry failed to load</h3><p>${error.message}</p></article>`;
});
