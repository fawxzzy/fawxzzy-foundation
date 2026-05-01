# Project Registry

Generated from `data/projects.json`. Do not hand-edit this file unless the generator is also updated.

Updated: 2026-05-01T05:45:05.8532243Z

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
| fitness | Fawxzzy Fitness | application | active | fawxzzy/fawxzzy-fitness | yes | fawxzzy-fitness, fawxzzy-fitness-prod-deploy | capture a fresh clean READY production proof on the primary fawxzzy-fitness project |
| lifeline | Fawxzzy Lifeline | operator-runtime | active | fawxzzy/fawxzzy-lifeline | yes | - | define Foundation lifeline target once deployment runtime is chosen |
| mazer | Fawxzzy Mazer | application-game | active | fawxzzy/fawxzzy-mazer | yes | fawxzzy-mazer | surface build/runtime proof in Foundation console |
| trove | Fawxzzy Trove | content-data | active | fawxzzy/fawxzzy-trove | yes | fawxzzy-trove | capture a fresh clean READY production proof on fawxzzy-trove |
| nat-1-games | Nat 1 Games | application | observed-deployment | ZachariahRedfield/nat1-games | unknown | nat-1-games | keep private-source provenance explicit while the repo is intentionally private |


## Health Ledger

### Fawxzzy Foundation
- Overall health: `healthy` - Promotion proof stays pinned to the original active-control-plane deployment while the latest production parity is tracked separately.
- GitHub: `verified` - GitHub repo exists, is public, and tracks main as the default branch. (checked `2026-05-01T03:18:52.146Z`)
- Vercel: `verified` - Vercel project is mapped under the fawxzzy team. (checked `2026-05-01T03:18:52.146Z`)
- Vercel projects: `fawxzzy-foundation`
- Deployment: `ready` - Latest production deployment is READY and reflects the proof-quality classifications commit. (checked `2026-05-01T05:45:05.8532243Z`)
- Latest deployment facts: deployment `dpl_DSsSc2vNP3bGJZWZvAoCeFjrLuwJ`, target `production`, alias `fawxzzy-foundation.vercel.app`, commit `f5f2bdce36ea20fc1f3c081f6425d394bbcb38f4`, message "Add proof quality classifications"
- Proof: `current` - Pinned promotion proof remains intact at abda5a5/dpl_8CbDvRtaeq7gxSbCAg94r7vWR8A2 while the latest observed production display parity is f5f2bdc/dpl_DSsSc2vNP3bGJZWZvAoCeFjrLuwJ. (checked `2026-05-01T05:45:05.8532243Z`)
- Proof freshness window: 168h
- Last deployment proof captured: `2026-05-01T05:45:05.8532243Z`
- Proof quality: `clean` - Pinned active-control-plane proof remains clean and unchanged.
- Pinned promotion proof commit: `abda5a586716d356f7c2bb1e670f5783f80b0fed`
- Pinned promotion proof deployment: `dpl_8CbDvRtaeq7gxSbCAg94r7vWR8A2`
- Latest observed deployment commit: `f5f2bdce36ea20fc1f3c081f6425d394bbcb38f4`
- Latest observed deployment id: `dpl_DSsSc2vNP3bGJZWZvAoCeFjrLuwJ`

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
- Remediation summary: Fitness has usable current proof for parity tracking, but Foundation should keep both warning classes visible until a clean primary-project deploy is captured and the legacy prod-deploy mapping is explicitly reconciled.
- Warning class `dirty`: The current READY proof came from the primary project, but the deployment metadata includes gitDirty and cannot be promoted to clean provenance.
- Owner for `dirty`: Fitness repo owner creates the clean deployment; Foundation records the refreshed proof after the clean production deploy exists.
- Next action for `dirty`: Push the intended Fitness source from a clean git state on main and trigger a production deployment on the primary fawxzzy-fitness project.; Refresh Foundation only after the primary project reports a newer production READY deployment whose commit is present on origin/main.
- Safe proof refresh for `dirty`: Replacement proof must come from a production deployment on the primary fawxzzy-fitness project, not the legacy prod-deploy project.; The deployment must be READY, reference a pushed commit, and report gitDirty as absent or false.; Do not mark the dirty warning cleared from preview, older, or manually patched deployments.
- Warning class `legacy-mapping`: The legacy fawxzzy-fitness-prod-deploy mapping is still recorded in Foundation but is not currently observable as the authoritative production surface.
- Owner for `legacy-mapping`: Foundation reconciles the registry mapping with the current Vercel inventory; Fitness owner confirms whether the legacy project is retired, aliased, or still required.
- Next action for `legacy-mapping`: Confirm whether fawxzzy-fitness-prod-deploy is still an active production boundary or only a historical deployment lane.; If the legacy lane is retired, update Foundation after Vercel inventory confirmation so the primary project is the only clean provenance target.
- Safe proof refresh for `legacy-mapping`: Keep the warning until the legacy mapping is either intentionally preserved with a documented purpose or removed from the authoritative production path.; Do not collapse the legacy mapping into clean proof merely because the primary project has a newer READY deployment.
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
- Remediation summary: Trove only needs one clean replacement proof path: capture a newer production READY deployment without gitDirty and then refresh Foundation from that observation.
- Warning class `dirty`: The current Trove proof is recent and READY, but it still carries gitDirty provenance and cannot be reclassified as clean yet.
- Owner for `dirty`: Trove repo owner produces the clean deployment; Foundation refreshes the registry proof after that deployment is visible.
- Next action for `dirty`: Deploy the intended Trove source from a clean git state to the existing production target.; Refresh Foundation after Vercel shows a newer production READY deployment tied to a pushed commit without gitDirty.
- Safe proof refresh for `dirty`: Replacement proof must be a newer production READY deployment on fawxzzy-trove.vercel.app.; The deployment must reference a pushed source commit and report gitDirty as absent or false.; Do not clear the warning from preview deployments, cached alias checks, or older READY deploys.
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
- Remediation summary: Nat 1 Games does not need a public-source proof to stay current. The remediation lane is policy clarity: keep private-source explicit unless the repo is intentionally made public later.
- Warning class `private-source`: The source repository is private in public GitHub surfaces, but Vercel metadata currently provides enough provenance for the deployment proof.
- Owner for `private-source`: Nat 1 Games owner confirms the privacy intent; Foundation preserves the private-source policy note and refreshes proof from Vercel metadata.
- Next action for `private-source`: Record that private source is acceptable when the repo is intentionally private and Vercel remains the provenance source.; Only add direct GitHub verification later if the repo is intentionally shared or made public.
- Safe proof refresh for `private-source`: Refresh proof only from a production READY deployment whose Vercel metadata still identifies ZachariahRedfield/nat1-games on main.; Keep the private-source warning explicit while the repo remains intentionally private.; Do not mark the proof clean solely because the deployment is READY; clean provenance would require a public-source verification policy change.
- Latest observed deployment commit: `ce9643465d69f76a46d92d0db6ed855d117e1bbd`
- Latest observed deployment id: `dpl_4rZ9yz4QZch3G9Q22B8eVqPx7gsq`



## Promotion Ledger

### Fawxzzy Foundation
- Current label: `active control-plane`
- GitHub Actions Foundation CI push run 25131302841 completed successfully for commit abda5a586716d356f7c2bb1e670f5783f80b0fed at 2026-04-29T20:10:19Z.
- Latest Vercel production deployment dpl_8CbDvRtaeq7gxSbCAg94r7vWR8A2 reached READY at 2026-04-30T00:51:18Z and serves https://fawxzzy-foundation.vercel.app.
- Clean deployment provenance is pinned to commit abda5a586716d356f7c2bb1e670f5783f80b0fed with source cli, actor codex, and no gitDirty flag.
- Promotion proof is pinned to commit abda5a586716d356f7c2bb1e670f5783f80b0fed and deployment dpl_8CbDvRtaeq7gxSbCAg94r7vWR8A2. Later production deployments may refresh the live console display from newer source commits, including f5f2bdce36ea20fc1f3c081f6425d394bbcb38f4, without changing that original promotion proof.
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
