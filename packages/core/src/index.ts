export type FoundationRepo = {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  exists: boolean | null;
  visibility?: string;
  defaultBranch?: string;
};

export type FoundationVercelProject = {
  name: string;
  id?: string;
};

export type FoundationPromotionChecklistItem = {
  label: string;
  done: boolean;
};

export type FoundationPromotion = {
  label: string;
  targetLabel?: string;
  blockedOn?: string;
  notes?: string[];
  sourceNote?: string;
  registryCommit?: {
    sha: string;
    message: string;
  };
  vercelObservation?: {
    projectName: string;
    status: string;
    visibleProjects?: string[];
  };
  checklist?: FoundationPromotionChecklistItem[];
  nextValidMove?: string[];
};

export type FoundationProject = {
  slug: string;
  name: string;
  kind: string;
  status: string;
  priority: number;
  summary: string;
  repo: FoundationRepo;
  vercel?: {
    exists: boolean;
    teamSlug: string;
    projectName?: string;
    projects?: FoundationVercelProject[];
  };
  stack: string[];
  contracts: string[];
  promotion?: FoundationPromotion;
  nextActions: string[];
};

export type FoundationRegistry = {
  schemaVersion: number;
  updatedAt: string;
  source: string;
  owner: string;
  principles: string[];
  projects: FoundationProject[];
};

export function summarizeRegistry(registry: FoundationRegistry) {
  const total = registry.projects.length;
  const active = registry.projects.filter((project) => project.status === "active").length;
  const bootstrap = registry.projects.filter((project) => project.status === "bootstrap").length;
  const deploymentMapped = registry.projects.filter((project) => project.vercel?.exists).length;

  return {
    total,
    active,
    bootstrap,
    deploymentMapped,
    owner: registry.owner,
    updatedAt: registry.updatedAt
  };
}

export function sortProjects(projects: FoundationProject[]) {
  return [...projects].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.slug.localeCompare(b.slug);
  });
}
