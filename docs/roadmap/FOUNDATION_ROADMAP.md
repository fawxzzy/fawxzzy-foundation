# Foundation Roadmap

## Mission

Foundation is the active control-plane repo for the Fawxzzy project family. It owns project registry truth, proof health, privacy/data contracts, deployment evidence, and operator-facing status surfaces.

Foundation does not replace ATLAS, Playbook, Lifeline, or product repos. It projects owner-repo truth, preserves evidence, and turns cross-stack state into safe next actions.

## Phase 0 - Bootstrap and promotion

Status: complete.

- Repository created and pushed.
- GitHub remote established.
- Vercel project established.
- Active-control-plane promotion proof pinned.
- Source/live parity achieved.
- Zero proof warnings after accepted-private-source policy.

## Phase 1 - Registry and console

Status: complete but ongoing.

- `data/projects.json` is canonical project truth.
- Generated registry docs and console payload stay aligned.
- Static console displays compact project status.
- Proof freshness and proof quality are visible.

Ongoing rule: generated surfaces must be produced from registry truth, not hand-edited.

## Phase 2 - Proof health and deployment intelligence

Status: active.

Current capabilities:

- GitHub repo truth.
- Vercel project mapping.
- Deployment proof snapshots.
- Proof freshness.
- Proof quality states: `clean`, `accepted-private-source`, `dirty`, `legacy-mapping`, `private-source`, `pending-confirmation`.
- Source/live parity deployment proof.

Next:

- Add provider observation snapshots.
- Generate proof-refresh drafts.
- Separate observation from mutation.
- Add stale-proof refresh queue.
- Accept file-based live provider observation inputs before adding direct provider reads.

## Phase 3 - Proof refresh automation

Goal:
Make Foundation able to inspect current GitHub/Vercel/Supabase state and emit a reviewable draft before changing registry truth.

Flow:

1. Read provider state.
2. Compare against `data/projects.json`.
3. Emit `.foundation/proof-refresh-draft.json`.
4. Render `.foundation/proof-refresh-draft.md`.
5. Verify draft invariants.
6. Human/operator applies registry changes.
7. Build and verify.

Current build lane:

- Phase 3A introduced proposal-only draft generation from registry-recorded observations.
- Phase 3B adds file-based provider observation inputs so external evidence can be compared against registry truth without direct provider API calls from the draft command.
- Phase 3C adds operator capture templates and a normalizer that turns manually collected provider evidence into the provider-observations contract.

Non-goals:

- No automatic registry mutation.
- No hidden deploys.
- No provider-setting changes.
- No cross-repo source edits.

## Phase 4 - Data/security backbone

Goal:
Inventory and govern the private data layer, starting with the existing `FawxzzyFitness` Supabase project.

Current build lane:

- Phase 4A introduces the first read-only Supabase inventory draft so Foundation can represent database and security posture without mutating Supabase.
- Phase 4B adds live advisor evidence, schema scope classification, and split RLS posture so privacy claim posture can stay conservative for the right reasons instead of collapsing everything into a single mixed-RLS label.

Initial contracts:

- Supabase project inventory.
- Schema/table inventory.
- RLS status.
- Auth/provider status.
- Storage bucket policy status.
- Edge function inventory.
- Migration inventory.
- Security/performance advisor snapshot.
- Public/private data classification.
- Consent/access policy draft.

Non-goals:

- No database mutation in the first pass.
- No new Supabase project until cost and intent are reviewed.
- No privacy claims without RLS/security proof.

## Phase 5 - Playbook read-interface bridge

Goal:
Consume Playbook-style read-first control-plane interfaces for readiness/proof, run-state inspection, longitudinal state, and cross-repo pattern comparison.

Foundation should aggregate:

- repo-local verification receipts,
- CI run evidence,
- deployment proof,
- Playbook readiness/proof artifacts,
- Lifeline execution receipts when available.

Boundary:

- read-first,
- per-repo provenance preserved,
- no batch mutation without explicit approval.

## Phase 6 - Lifeline execution receipt bridge

Goal:
Record execution/deployment receipts from Lifeline without making Foundation the executor.

Foundation should display:

- target runtime,
- last action,
- receipt ID,
- approval state,
- rollback availability,
- current deploy/runtime health.

## Phase 7 - Operator command and voice readiness

Goal:
Expose safe commands that future voice/operator workflows can route to.

Commands:

- `foundation status`
- `foundation projects`
- `foundation proof inspect`
- `foundation proof refresh --draft`
- `foundation supabase inventory --draft`
- `foundation roadmap next`

Rule:
Voice maps to proposal and inspection commands first, not unrestricted action.

## Phase 8 - Cross-app data contracts

Goal:
Make reusable privacy-first data contracts for Fitness, health/wellness, Mazer, Trove, and future apps.

Contracts:

- profile boundary,
- consent boundary,
- sensitive data boundary,
- retention/deletion policy,
- app-specific table ownership,
- cross-app data sharing rules,
- audit receipts.

## Phase 9 - Foundation as product operating layer

Goal:
Foundation becomes the trusted operator dashboard for project family health, data posture, deployment proof, and next actions.

Done when:

- registry truth is current,
- proof refresh is draftable,
- data/security inventory is visible,
- CI/deployment proof is tracked,
- Playbook/Lifeline receipts are projected,
- app privacy posture is auditable,
- future work can be routed from Foundation without losing owner boundaries.
