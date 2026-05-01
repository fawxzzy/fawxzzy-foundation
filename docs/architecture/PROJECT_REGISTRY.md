# Project Registry

Generated from `data/projects.json`. Do not hand-edit this file unless the generator is also updated.

Updated: 2026-05-01T03:18:52.146Z

## Summary

- Owner: fawxzzy
- Projects: 8
- Active projects: 7
- Deployment-mapped projects: 5

## Projects

| Slug | Name | Kind | Status | Repo | Repo exists | Vercel | First next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| foundation | Fawxzzy Foundation | control-plane | active | fawxzzy/fawxzzy-foundation | yes | fawxzzy-foundation | Automate health/proof refresh without changing the pinned active-control-plane promotion proof |
| playbook | Fawxzzy Playbook | governance-runtime | active | fawxzzy/fawxzzy-playbook | yes | - | adopt Playbook bootstrap in Foundation once package install is available |
| atlas | ATLAS | workspace-architecture | active | fawxzzy/ATLAS | yes | - | sync Foundation registry from ATLAS workspace observations |
| fitness | Fawxzzy Fitness | application | active | fawxzzy/fawxzzy-fitness | yes | fawxzzy-fitness, fawxzzy-fitness-prod-deploy | normalize AGENT.md to AGENTS.md convention |
| lifeline | Fawxzzy Lifeline | operator-runtime | active | fawxzzy/fawxzzy-lifeline | yes | - | define Foundation lifeline target once deployment runtime is chosen |
| mazer | Fawxzzy Mazer | application-game | active | fawxzzy/fawxzzy-mazer | yes | fawxzzy-mazer | surface build/runtime proof in Foundation console |
| trove | Fawxzzy Trove | content-data | active | fawxzzy/fawxzzy-trove | yes | fawxzzy-trove | add repo-local AI/governance contract when ready |
| nat-1-games | Nat 1 Games | application | observed-deployment | fawxzzy/nat-1-games | unknown | nat-1-games | confirm canonical GitHub repository |


## Health Ledger

### Fawxzzy Foundation
- Overall health: `healthy` - Promotion proof stays pinned to the original active-control-plane deployment while the latest production parity is tracked separately.
- GitHub: `verified` - GitHub repo exists, is public, and tracks main as the default branch. (checked `2026-05-01T03:18:52.146Z`)
- Vercel: `verified` - Vercel project is mapped under the fawxzzy team. (checked `2026-05-01T03:18:52.146Z`)
- Vercel projects: `fawxzzy-foundation`
- Deployment: `ready` - Latest production deployment is READY and reflects the parity policy commit. (checked `2026-05-01T03:18:52.146Z`)
- Latest deployment facts: deployment `dpl_YQ8Vcp5LbnfQzVX1qKZFSP2iDkad`, target `production`, alias `fawxzzy-foundation.vercel.app`, commit `9fff053e264d4071f7e26503d5a4d382c3cf6285`, message "Record Foundation display parity policy"
- Proof: `current` - Pinned promotion proof remains intact at abda5a5/dpl_8CbDvRtaeq7gxSbCAg94r7vWR8A2 while the latest observed production display parity is 9fff053/dpl_YQ8Vcp5LbnfQzVX1qKZFSP2iDkad. (checked `2026-05-01T03:18:52.146Z`)
- Proof freshness window: 168h
- Last deployment proof captured: `2026-05-01T03:18:52.146Z`
- Pinned promotion proof commit: `abda5a586716d356f7c2bb1e670f5783f80b0fed`
- Pinned promotion proof deployment: `dpl_8CbDvRtaeq7gxSbCAg94r7vWR8A2`
- Latest observed deployment commit: `9fff053e264d4071f7e26503d5a4d382c3cf6285`
- Latest observed deployment id: `dpl_YQ8Vcp5LbnfQzVX1qKZFSP2iDkad`

### Fawxzzy Playbook
- Overall health: `tracked` - GitHub repo truth is recorded; deployment proof has not been introduced into Foundation yet.
- GitHub: `verified` - GitHub repo exists and is recorded in Foundation. (checked `2026-05-01T03:18:52.146Z`)
- Vercel: `not-applicable` - No Vercel project is mapped for Playbook in Foundation yet. (checked `2026-05-01T03:18:52.146Z`)
- Deployment: `not-applicable` - Foundation has no deployment proof target for Playbook yet. (checked `2026-05-01T03:18:52.146Z`)
- Proof: `repo-tracked` - Repo ownership proof is recorded; deployment proof is not applicable until a deployment surface is defined. (checked `2026-05-01T03:18:52.146Z`)
- Proof freshness window: 168h

### ATLAS
- Overall health: `tracked` - Foundation tracks the GitHub source-of-truth repo, but no deployment proof is expected from this workspace layer.
- GitHub: `verified` - GitHub repo exists and is recorded in Foundation. (checked `2026-05-01T03:18:52.146Z`)
- Vercel: `not-applicable` - No Vercel project is mapped for the workspace inventory layer. (checked `2026-05-01T03:18:52.146Z`)
- Deployment: `not-applicable` - Foundation does not expect a deployment surface for ATLAS. (checked `2026-05-01T03:18:52.146Z`)
- Proof: `repo-tracked` - Repo ownership proof is recorded; deployment proof is not applicable. (checked `2026-05-01T03:18:52.146Z`)
- Proof freshness window: 168h

### Fawxzzy Fitness
- Overall health: `needs-deployment-proof` - Repo and Vercel project mappings are recorded, but Foundation still needs a current deployment proof snapshot.
- GitHub: `verified` - GitHub repo exists and is recorded in Foundation. (checked `2026-05-01T03:18:52.146Z`)
- Vercel: `mapped` - Vercel projects are mapped under the fawxzzy team. (checked `2026-05-01T03:18:52.146Z`)
- Vercel projects: `fawxzzy-fitness`, `fawxzzy-fitness-prod-deploy`
- Deployment: `pending-proof` - Latest deployment state has not been recorded in Foundation yet. (checked `2026-05-01T03:18:52.146Z`)
- Proof: `pending-proof` - Foundation has not yet captured a latest deployment proof snapshot for Fitness. (checked `2026-05-01T03:18:52.146Z`)
- Proof freshness window: 168h

### Fawxzzy Lifeline
- Overall health: `tracked` - GitHub repo truth is recorded; deployment proof will follow once Lifeline runtime targets are formalized.
- GitHub: `verified` - GitHub repo exists and is recorded in Foundation. (checked `2026-05-01T03:18:52.146Z`)
- Vercel: `not-applicable` - No Vercel project is mapped for Lifeline. (checked `2026-05-01T03:18:52.146Z`)
- Deployment: `not-applicable` - Foundation has not defined a deployment surface for Lifeline. (checked `2026-05-01T03:18:52.146Z`)
- Proof: `repo-tracked` - Repo ownership proof is recorded; deployment proof is not applicable yet. (checked `2026-05-01T03:18:52.146Z`)
- Proof freshness window: 168h

### Fawxzzy Mazer
- Overall health: `needs-deployment-proof` - Repo and Vercel mapping are recorded, but Foundation still needs a current deployment proof snapshot.
- GitHub: `verified` - GitHub repo exists and is recorded in Foundation. (checked `2026-05-01T03:18:52.146Z`)
- Vercel: `mapped` - Vercel project is mapped under the fawxzzy team. (checked `2026-05-01T03:18:52.146Z`)
- Vercel projects: `fawxzzy-mazer`
- Deployment: `pending-proof` - Latest deployment state has not been recorded in Foundation yet. (checked `2026-05-01T03:18:52.146Z`)
- Proof: `pending-proof` - Foundation has not yet captured a latest deployment proof snapshot for Mazer. (checked `2026-05-01T03:18:52.146Z`)
- Proof freshness window: 168h

### Fawxzzy Trove
- Overall health: `needs-deployment-proof` - Repo and Vercel mapping are recorded, but Foundation still needs a current deployment proof snapshot.
- GitHub: `verified` - GitHub repo exists and is recorded in Foundation. (checked `2026-05-01T03:18:52.146Z`)
- Vercel: `mapped` - Vercel project is mapped under the fawxzzy team. (checked `2026-05-01T03:18:52.146Z`)
- Vercel projects: `fawxzzy-trove`
- Deployment: `pending-proof` - Latest deployment state has not been recorded in Foundation yet. (checked `2026-05-01T03:18:52.146Z`)
- Proof: `pending-proof` - Foundation has not yet captured a latest deployment proof snapshot for Trove. (checked `2026-05-01T03:18:52.146Z`)
- Proof freshness window: 168h

### Nat 1 Games
- Overall health: `needs-deployment-proof` - A Vercel project has been observed, but GitHub confirmation and deployment proof are still pending.
- GitHub: `pending-confirmation` - Foundation has a candidate GitHub repo path but has not confirmed whether the repo exists. (checked `2026-05-01T03:18:52.146Z`)
- Vercel: `mapped` - Vercel project is visible under the fawxzzy team. (checked `2026-05-01T03:18:52.146Z`)
- Vercel projects: `nat-1-games`
- Deployment: `pending-proof` - Latest deployment state has not been recorded in Foundation yet. (checked `2026-05-01T03:18:52.146Z`)
- Proof: `pending-proof` - Foundation has not yet captured a latest deployment proof snapshot for Nat 1 Games. (checked `2026-05-01T03:18:52.146Z`)
- Proof freshness window: 168h



## Promotion Ledger

### Fawxzzy Foundation
- Current label: `active control-plane`
- GitHub Actions Foundation CI push run 25131302841 completed successfully for commit abda5a586716d356f7c2bb1e670f5783f80b0fed at 2026-04-29T20:10:19Z.
- Latest Vercel production deployment dpl_8CbDvRtaeq7gxSbCAg94r7vWR8A2 reached READY at 2026-04-30T00:51:18Z and serves https://fawxzzy-foundation.vercel.app.
- Clean deployment provenance is pinned to commit abda5a586716d356f7c2bb1e670f5783f80b0fed with source cli, actor codex, and no gitDirty flag.
- Promotion proof is pinned to commit abda5a586716d356f7c2bb1e670f5783f80b0fed and deployment dpl_8CbDvRtaeq7gxSbCAg94r7vWR8A2. Later production deployments may refresh the live console display from newer source commits, including 9fff053e264d4071f7e26503d5a4d382c3cf6285, without changing that original promotion proof.
- GitHub's legacy combined-status endpoint still reports pending with zero status contexts for this commit, but the public check-runs and workflow-run APIs show a completed successful Foundation CI push run. Those check surfaces are the authoritative proof here.
- Promotion proof commit: `abda5a586716d356f7c2bb1e670f5783f80b0fed` (Record Foundation Vercel deployment proof)
- Vercel project `fawxzzy-foundation`: latest production deployment dpl_8CbDvRtaeq7gxSbCAg94r7vWR8A2 is READY for abda5a586716d356f7c2bb1e670f5783f80b0fed on alias fawxzzy-foundation.vercel.app
- Visible Vercel projects: `foundation`, `fitness`, `fitness-prod-deploy`, `trove`, `nat-1-games`, `mazer`

| Gate | State |
| --- | --- |
| GitHub repo exists | [x] |
| main pushed and tracking origin/main | [x] |
| Foundation self-registry fixed | [x] |
| Generated registry surfaces aligned | [x] |
| Local pnpm build passed | [x] |
| Local pnpm verify:local passed | [x] |
| GitHub Actions Foundation CI succeeded | [x] |
| Overall commit/check state fully green | [x] |
| Vercel project exists | [x] |
| Vercel deployment exists | [x] |
| Vercel deployment verified | [x] |
| Registry records Vercel deployment proof | [x] |
| Foundation promoted to active control-plane | [x] |

Next valid move:
1. Maintain green GitHub Actions and clean Vercel provenance on future control-plane commits
2. Keep generated registry surfaces aligned with data/projects.json
3. Expand deployment health coverage for downstream project surfaces


## Principles

- private-first runtime artifacts
- deterministic project registry
- brief-thin human surfaces with machine-readable JSON truth
- modular repos under a shared governance layer
