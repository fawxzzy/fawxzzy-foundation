# Project Registry

Generated from `data/projects.json`. Do not hand-edit this file unless the generator is also updated.

Updated: 2026-05-01T04:11:46.7196890Z

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
| fitness | Fawxzzy Fitness | application | active | fawxzzy/fawxzzy-fitness | yes | fawxzzy-fitness, fawxzzy-fitness-prod-deploy | reconcile legacy fawxzzy-fitness-prod-deploy mapping against current Vercel inventory |
| lifeline | Fawxzzy Lifeline | operator-runtime | active | fawxzzy/fawxzzy-lifeline | yes | - | define Foundation lifeline target once deployment runtime is chosen |
| mazer | Fawxzzy Mazer | application-game | active | fawxzzy/fawxzzy-mazer | yes | fawxzzy-mazer | surface build/runtime proof in Foundation console |
| trove | Fawxzzy Trove | content-data | active | fawxzzy/fawxzzy-trove | yes | fawxzzy-trove | add repo-local AI/governance contract when ready |
| nat-1-games | Nat 1 Games | application | observed-deployment | ZachariahRedfield/nat1-games | unknown | nat-1-games | record direct GitHub access only if the private source repo is intentionally shared |


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
- Proof quality: `clean` - Pinned active-control-plane proof remains clean and unchanged.
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
- Overall health: `deployment-observed` - GitHub repo is public and the primary Vercel production deployment is proved, but the legacy fawxzzy-fitness-prod-deploy mapping is not currently observable.
- GitHub: `verified` - GitHub repo exists publicly on main. (checked `2026-05-01T03:45:12.577Z`)
- Vercel: `verified` - Primary Vercel project is visible under the fawxzzy team; the legacy fawxzzy-fitness-prod-deploy mapping is not currently observable. (checked `2026-05-01T03:45:12.577Z`)
- Vercel projects: `fawxzzy-fitness`, `fawxzzy-fitness-prod-deploy`
- Deployment: `ready` - Latest observed production deployment is READY on fawxzzy-fitness-local.vercel.app, but the recorded deployment metadata is gitDirty. (checked `2026-05-01T03:45:12.577Z`)
- Latest deployment facts: deployment `dpl_5ATWWNntLPsHMaC1oGVNTKy5Sw2F`, target `production`, alias `fawxzzy-fitness-local.vercel.app`, commit `c55728235648a4a45bfe49a48ed1bd7a7086391e`, message "Release workspace snapshot"
- Proof: `current` - Foundation captured a current deployment proof snapshot for Fitness from the primary Vercel project; the proof is current but not clean because the deployment is gitDirty and the legacy prod-deploy mapping is unresolved. (checked `2026-05-01T03:45:12.577Z`)
- Proof freshness window: 168h
- Last deployment proof captured: `2026-05-01T03:45:12.577Z`
- Proof quality: `dirty`, `legacy-mapping` - READY proof from the primary project is current, but it is gitDirty and the legacy prod-deploy mapping remains unresolved.
- Latest observed deployment commit: `c55728235648a4a45bfe49a48ed1bd7a7086391e`
- Latest observed deployment id: `dpl_5ATWWNntLPsHMaC1oGVNTKy5Sw2F`

### Fawxzzy Lifeline
- Overall health: `tracked` - GitHub repo truth is recorded; deployment proof will follow once Lifeline runtime targets are formalized.
- GitHub: `verified` - GitHub repo exists and is recorded in Foundation. (checked `2026-05-01T03:18:52.146Z`)
- Vercel: `not-applicable` - No Vercel project is mapped for Lifeline. (checked `2026-05-01T03:18:52.146Z`)
- Deployment: `not-applicable` - Foundation has not defined a deployment surface for Lifeline. (checked `2026-05-01T03:18:52.146Z`)
- Proof: `repo-tracked` - Repo ownership proof is recorded; deployment proof is not applicable yet. (checked `2026-05-01T03:18:52.146Z`)
- Proof freshness window: 168h

### Fawxzzy Mazer
- Overall health: `deployment-observed` - GitHub repo is public and a current production deployment proof is captured from Vercel.
- GitHub: `verified` - GitHub repo exists publicly on main. (checked `2026-05-01T03:45:12.577Z`)
- Vercel: `verified` - Vercel project is visible under the fawxzzy team and exposes a current production target. (checked `2026-05-01T03:45:12.577Z`)
- Vercel projects: `fawxzzy-mazer`
- Deployment: `ready` - Latest observed production deployment is READY on fawxzzy-mazer.vercel.app. (checked `2026-05-01T03:45:12.577Z`)
- Latest deployment facts: deployment `dpl_9yFBd8hRjq1uKoibCZC7bFMBtrMR`, target `production`, alias `fawxzzy-mazer.vercel.app`, commit `f42f472bb057b2e4d57d8ac5c06253e2c3ef5166`, message "updated"
- Proof: `current` - Foundation captured a current deployment proof snapshot for Mazer from the live production alias. (checked `2026-05-01T03:45:12.577Z`)
- Proof freshness window: 168h
- Last deployment proof captured: `2026-05-01T03:45:12.577Z`
- Proof quality: `clean` - READY proof is current and the checked deployment metadata appears clean.
- Latest observed deployment commit: `f42f472bb057b2e4d57d8ac5c06253e2c3ef5166`
- Latest observed deployment id: `dpl_9yFBd8hRjq1uKoibCZC7bFMBtrMR`

### Fawxzzy Trove
- Overall health: `deployment-observed` - GitHub repo is public and a current production deployment proof is captured from Vercel.
- GitHub: `verified` - GitHub repo exists publicly on main. (checked `2026-05-01T03:45:12.577Z`)
- Vercel: `verified` - Vercel project is visible under the fawxzzy team and exposes a current production target. (checked `2026-05-01T03:45:12.577Z`)
- Vercel projects: `fawxzzy-trove`
- Deployment: `ready` - Latest observed production deployment is READY on fawxzzy-trove.vercel.app, but the recorded deployment metadata is gitDirty. (checked `2026-05-01T03:45:12.577Z`)
- Latest deployment facts: deployment `dpl_FZpvM5eaeHjp8oBjmpUFhKc6NfKo`, target `production`, alias `fawxzzy-trove.vercel.app`, commit `e0566a6b8d65d5892f0cc9defda36481eccbaa29`, message "chore: refresh app catalog media assets"
- Proof: `current` - Foundation captured a current deployment proof snapshot for Trove from the live production alias; the proof is current but not clean because the deployment is gitDirty. (checked `2026-05-01T03:45:12.577Z`)
- Proof freshness window: 168h
- Last deployment proof captured: `2026-05-01T03:45:12.577Z`
- Proof quality: `dirty` - READY proof is current, but the observed deployment metadata includes gitDirty=1.
- Latest observed deployment commit: `e0566a6b8d65d5892f0cc9defda36481eccbaa29`
- Latest observed deployment id: `dpl_FZpvM5eaeHjp8oBjmpUFhKc6NfKo`

### Nat 1 Games
- Overall health: `deployment-observed` - A current Vercel production deployment is proved, and Vercel metadata confirms the GitHub source repo is private.
- GitHub: `private-source` - GitHub public API does not expose ZachariahRedfield/nat1-games, and Vercel production metadata confirms that private source repo on main. (checked `2026-05-01T03:45:12.577Z`)
- Vercel: `verified` - Vercel project is visible under the fawxzzy team and exposes a current production target. (checked `2026-05-01T03:45:12.577Z`)
- Vercel projects: `nat-1-games`
- Deployment: `ready` - Latest observed production deployment is READY on nat-1-games.vercel.app. (checked `2026-05-01T03:45:12.577Z`)
- Latest deployment facts: deployment `dpl_4rZ9yz4QZch3G9Q22B8eVqPx7gsq`, target `production`, alias `nat-1-games.vercel.app`, commit `ce9643465d69f76a46d92d0db6ed855d117e1bbd`, message "Merge pull request #227 from ZachariahRedfield/codex/simplify-time-zone-selection-and-auto-select Improve Start Session UI and prevent mobile input zoom"
- Proof: `current` - Foundation captured a current deployment proof snapshot for Nat 1 Games from Vercel, and the associated GitHub source is confirmed private from Vercel metadata. (checked `2026-05-01T03:45:12.577Z`)
- Proof freshness window: 168h
- Last deployment proof captured: `2026-05-01T03:45:12.577Z`
- Proof quality: `private-source` - READY proof is current, and the GitHub source is confirmed private from Vercel metadata.
- Latest observed deployment commit: `ce9643465d69f76a46d92d0db6ed855d117e1bbd`
- Latest observed deployment id: `dpl_4rZ9yz4QZch3G9Q22B8eVqPx7gsq`



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
