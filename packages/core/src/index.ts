export type FoundationRepo = {
  owner: string;
  name: string;
  fullName: string;
  url: string;
  exists: boolean | null;
  visibility?: string;
  defaultBranch?: string;
};

export type FoundationSupabaseProject = {
  projectRef: string;
  name: string;
  region: string;
  status: string;
  postgresVersion: string;
  observedAt?: string;
};

export type FoundationSupabaseSchemaScope =
  | "public-app"
  | "auth-system"
  | "storage-system"
  | "realtime-system"
  | "vault-system"
  | "other-system";

export type FoundationSupabaseRlsPosture = "protected" | "mixed" | "unprotected" | "unknown";

export type FoundationDesiredLifecycle =
  | "active"
  | "incubating"
  | "observed-deployment"
  | "planned"
  | "historical";

export type FoundationDesiredRole =
  | "control-plane"
  | "application"
  | "governance-runtime"
  | "operator-runtime"
  | "workspace-architecture";

export type FoundationObservedRepoState =
  | "verified"
  | "missing"
  | "private-source"
  | "not-applicable"
  | "unknown";

export type FoundationObservedDeploymentState =
  | "ready"
  | "missing"
  | "not-applicable"
  | "unknown";

export type FoundationObservedDatabaseState = "observed" | "not-applicable" | "unknown";

export type FoundationObservedProofState = "current" | "stale" | "pending" | "not-applicable";

export type FoundationHealthOverallState = "healthy" | "warning" | "blocked" | "unknown";

export type FoundationHealthQualityState = "clean" | "accepted-private-source" | "advisory" | "blocked";

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

export type FoundationProofRefreshPrimaryDisposition =
  | "unchanged-proof"
  | "stale-proof"
  | "provider-newer-than-registry"
  | "provider-missing"
  | "provider-conflict";

export type FoundationProofRefreshSupplementalClassification =
  | "accepted-private-source"
  | "historical-mapping"
  | "immutable-promotion-proof";

export type FoundationProofRefreshClassification =
  | FoundationProofRefreshPrimaryDisposition
  | FoundationProofRefreshSupplementalClassification;

export type FoundationObservationMode = "registry-only" | "external-file";

export type FoundationProviderObservationFacetStatus =
  | "verified"
  | "ready"
  | "missing"
  | "not-found"
  | "private-source"
  | "historical"
  | "tracked"
  | "active"
  | "not-applicable"
  | "pending"
  | "unknown";

export type FoundationProviderObservationFacet = {
  observedAt: string;
  status: FoundationProviderObservationFacetStatus;
  summary?: string;
};

export type FoundationGitHubRepoObservation = FoundationProviderObservationFacet & {
  exists?: boolean | null;
  owner?: string;
  name?: string;
  fullName?: string;
  url?: string;
  visibility?: string;
  defaultBranch?: string;
};

export type FoundationGitHubChecksObservation = FoundationProviderObservationFacet & {
  workflowName?: string;
  conclusion?: string;
  commitSha?: string;
  runId?: string;
  branch?: string;
};

export type FoundationVercelProjectObservation = FoundationProviderObservationFacet & {
  teamSlug?: string;
  projectNames?: string[];
  projectIds?: string[];
};

export type FoundationVercelDeploymentObservation = FoundationProviderObservationFacet & {
  target?: string;
  projectName?: string;
  deploymentId?: string;
  alias?: string;
  githubCommitSha?: string;
  message?: string;
  gitDirty?: boolean;
};

export type FoundationSupabaseProjectObservation = FoundationProviderObservationFacet & {
  projectRef?: string;
  projectName?: string;
  region?: string;
  postgresVersion?: string;
  organization?: string;
};

export type FoundationProviderObservationProject = {
  slug: string;
  name?: string;
  githubRepo?: FoundationGitHubRepoObservation;
  githubChecks?: FoundationGitHubChecksObservation;
  vercelProject?: FoundationVercelProjectObservation;
  vercelDeployment?: FoundationVercelDeploymentObservation;
  supabaseProject?: FoundationSupabaseProjectObservation;
  notes?: string[];
};

export type FoundationProviderObservationSnapshot = {
  schemaVersion: number;
  captureMode: "example" | "operator-capture";
  coverage: "partial" | "full";
  generatedAt: string;
  source: {
    label: string;
    summary?: string;
  };
  projects: FoundationProviderObservationProject[];
};

export type FoundationProofRefreshProject = {
  slug: string;
  name: string;
  observationMode: FoundationObservationMode;
  primaryDisposition: FoundationProofRefreshPrimaryDisposition;
  classifications: FoundationProofRefreshClassification[];
  observedAt: string | null;
  proofCheckedAt: string;
  lastDeploymentProofAt?: string | null;
  immutablePromotionProof: boolean;
  immutableFields: string[];
  conflictFields: string[];
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
  observationInput: {
    mode: FoundationObservationMode;
    path?: string;
    captureMode?: "example" | "operator-capture";
    coverage?: "partial" | "full";
    generatedAt?: string;
  };
  workflow: string[];
  summary: {
    totalProjects: number;
    primaryDispositionCounts: Record<FoundationProofRefreshPrimaryDisposition, number>;
    classificationCounts: Record<FoundationProofRefreshClassification, number>;
    externalObservationProjects: number;
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

export type FoundationDesiredState = {
  lifecycle: FoundationDesiredLifecycle;
  role: FoundationDesiredRole;
  summary: string;
  ownerIntent: string;
};

export type FoundationObservedState = {
  repo: FoundationObservedRepoState;
  deployment: FoundationObservedDeploymentState;
  database: FoundationObservedDatabaseState;
  proof: FoundationObservedProofState;
  summary: string;
};

export type FoundationHealthState = {
  overall: FoundationHealthOverallState;
  quality: FoundationHealthQualityState;
  warnings: string[];
  blockers: string[];
  summary: string;
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
  desiredState?: FoundationDesiredState;
  observedState?: FoundationObservedState;
  healthState?: FoundationHealthState;
  repo: FoundationRepo;
  supabase?: FoundationSupabaseProject;
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
  const active = registry.projects.filter((project) => (project.desiredState?.lifecycle ?? project.status) === "active").length;
  const bootstrap = registry.projects.filter((project) => (project.desiredState?.lifecycle ?? project.status) === "bootstrap").length;
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
