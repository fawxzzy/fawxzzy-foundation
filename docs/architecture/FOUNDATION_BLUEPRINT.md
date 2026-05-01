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
- `status` - lifecycle state.
- `repo` - GitHub ownership and existence truth.
- `vercel` - deployment mapping when known.
- `health.github` - latest GitHub state check.
- `health.vercel` - latest Vercel project mapping check.
- `health.deployment` - latest deployment observation when tracked.
- `health.proof` - proof freshness window and timestamps.
- `stack` - major technical shape.
- `contracts` - known governance/docs/runtime contracts.
- `nextActions` - explicit next responsible moves.

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
