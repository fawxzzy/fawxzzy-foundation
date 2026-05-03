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
  role?: string;
};

export type FoundationPromotionChecklistItem = {
  label: string;
  done: boolean;
};

export type FoundationHealthFacet = {
  status: string;
  summary: string;
  checkedAt: string;
};

export type FoundationDeploymentHealth = FoundationHealthFacet & {
  target?: string;
  deploymentId?: string;
  alias?: string;
  githubCommitSha?: string;
  message?: string;
  gitDirty?: boolean;
};

export type FoundationProofHealth = FoundationHealthFacet & {
  staleAfterHours: number;
  lastDeploymentProofAt?: string | null;
  promotionProofCommitSha?: string;
  promotionProofDeploymentId?: string;
  promotionProofPinnedAt?: string;
  latestObservedDeploymentId?: string;
  latestObservedCommitSha?: string;
  qualityStates?: string[];
  qualitySummary?: string;
  remediation?: FoundationProofRemediation;
};

export type FoundationProofRemediationClass = {
  state: string;
  summary: string;
  owner: string;
  nextActions: string[];
  safeProofRefreshCriteria: string[];
};

export type FoundationProofRemediation = {
  summary: string;
  classes: FoundationProofRemediationClass[];
};

export type FoundationProofRefreshDisposition =
  | "unchanged-proof"
  | "stale-proof"
  | "provider-newer-than-registry"
  | "provider-missing";

export type FoundationProofRefreshPolicyFlag =
  | "accepted-private-source"
  | "historical-mapping";

export type FoundationProofRefreshProject = {
  slug: string;
  name: string;
  disposition: FoundationProofRefreshDisposition;
  policyFlags: FoundationProofRefreshPolicyFlag[];
  observedAt: string | null;
  proofCheckedAt: string;
  lastDeploymentProofAt?: string | null;
  immutablePromotionProof: boolean;
  immutableFields: string[];
  rationale: string[];
  proposedActions: string[];
};

export type FoundationProofRefreshDraft = {
  schemaVersion: number;
  status: "proposal-only";
  mutationAuthority: "none";
  generatedAt: string;
  sourceRegistry: {
    path: string;
    updatedAt: string;
  };
  workflow: string[];
  summary: {
    totalProjects: number;
    dispositionCounts: Record<FoundationProofRefreshDisposition, number>;
    policyFlagCounts: Record<FoundationProofRefreshPolicyFlag, number>;
    immutablePromotionProofProjects: number;
  };
  projects: FoundationProofRefreshProject[];
};

export type FoundationProjectHealth = {
  status: string;
  summary: string;
  github: FoundationHealthFacet;
  vercel: FoundationHealthFacet & {
    projectNames?: string[];
  };
  deployment: FoundationDeploymentHealth;
  proof: FoundationProofHealth;
};

export type FoundationPromotion = {
  label: string;
  targetLabel?: string;
  blockedOn?: string;
  notes?: string[];
  sourceNote?: string;
  registryCommit?: {
    label?: string;
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
  health: FoundationProjectHealth;
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
