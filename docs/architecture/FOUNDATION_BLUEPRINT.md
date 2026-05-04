# Foundation Blueprint

## Intent

Fawxzzy Foundation is the root control plane for the project family. It starts small: map the projects, preserve ownership truth, expose a local console, and create a verification gate.

## Architecture

```text
fawxzzy-foundation
|-- data/projects.json                # canonical registry
|-- foundation.config.json            # root config contract
|-- packages/contracts/               # schemas and contracts
|-- packages/core/                    # typed domain helpers
|-- packages/cli/                     # operator CLI
|-- apps/console/public/              # static dashboard
|-- docs/architecture/                # generated and human architecture docs
|-- docs/operations/                  # GitHub/Vercel/bootstrap handoff
|-- ops/checklists/                   # repeatable operator steps
|-- .playbook/ai-contract.json        # AI/bootstrap handshake
`-- .foundation/                      # runtime receipts, gitignored
```

## Control loop

1. Update project truth in `data/projects.json`.
2. Run `pnpm build` to refresh generated docs and console data.
3. Run `pnpm verify:local` to validate required files, registry invariants, and proof freshness rules.
4. Commit source truth plus generated contract surfaces.
5. Later, route verification through Playbook once the repo exists remotely.

## Registry model

Each project has:

- `slug` - stable project key.
- `name` - human-readable name.
- `kind` - project category.
- `desiredState` - operator intent and desired lifecycle/role.
- `observedState` - what Foundation can actually prove from observed evidence.
- `healthState` - judgment, quality, warnings, and blockers derived from desired and observed state.
- `status` - legacy compatibility lifecycle field derived from the split state model where migrated.
- `repo` - GitHub ownership and existence truth.
- `vercel` - deployment mapping when known.
- `health.github` - latest GitHub state check.
- `health.vercel` - latest Vercel project mapping check.
- `health.deployment` - latest deployment observation when tracked.
- `health.proof` - proof freshness window and timestamps.
- `health.proof.remediation` - explicit owner, next action, and safe refresh criteria for any proof warning states.
- `stack` - major technical shape.
- `contracts` - known governance/docs/runtime contracts.
- `nextActions` - explicit next responsible moves.

## State model rules

- Rule: desired state, observed state, and health judgment must remain separate machine fields.
- Pattern: `desiredState -> observedState -> healthState -> derived prose`.
- Failure mode: scorecards built on blended status fields create false precision and rewrite pressure.

## Proof quality policy

- `clean` is the clean-public-source class: the current proof can be treated as clean provenance because the deployment and source visibility checks align.
- `accepted-private-source` is a separate accepted policy class: the source repository remains intentionally private, Vercel metadata is the authoritative provenance surface, and the proof stays current without counting as a warning.
- `dirty` means a READY deployment was observed, but the deployment metadata included `gitDirty`; this is a warning, not a blocker, until a fresh clean READY proof is captured.
- `legacy-mapping` means a historical deployment mapping still needs reconciliation before the proof can be treated as clean.
- `private-source` means the source repository is intentionally or effectively private and Vercel metadata is the active provenance surface; this is acceptable when intentional, but the warning should remain explicit.
- `pending-confirmation` is reserved for cases where a proof observation exists but operator confirmation is still incomplete.
- Warning classes are advisory remediation lanes. Blockers are reserved for missing required contracts, invalid registry structure, or inconsistent generated outputs.

## Foundation phases

### Phase 0 - Bootstrap root

Create the repo, commit this scaffold, and verify locally.

### Phase 1 - Registry and dashboard

Keep `data/projects.json` accurate, render the static dashboard, and expose clear project status.

### Phase 2 - GitHub and Vercel integration

Attach GitHub repository metadata, Vercel project metadata, deployment status receipts, and proof freshness timestamps.

### Phase 3 - Playbook/Lifeline adoption

Install or connect Playbook and Lifeline so Foundation can consume deterministic repo intelligence and runtime state.

### Phase 4 - Agent-ready operating system

Expose compact AI context, project routing, remediation receipts, and next-action planning without hidden session state.

## Non-goals for the first commit

- No database.
- No authentication.
- No heavy framework requirement.
- No automatic mutation of other repos.
- No pretending that missing remote setup is complete.
