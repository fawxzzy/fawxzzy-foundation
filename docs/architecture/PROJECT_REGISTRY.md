# Project Registry

Generated from `data/projects.json`. Do not hand-edit this file unless the generator is also updated.

Updated: 2026-04-30T01:21:01.916Z

## Summary

- Owner: fawxzzy
- Projects: 8
- Active projects: 7
- Deployment-mapped projects: 5

## Projects

| Slug | Name | Kind | Status | Repo | Repo exists | Vercel | First next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| foundation | Fawxzzy Foundation | control-plane | active | fawxzzy/fawxzzy-foundation | yes | fawxzzy-foundation | Maintain green GitHub Actions and clean Vercel provenance on future control-plane commits |
| playbook | Fawxzzy Playbook | governance-runtime | active | fawxzzy/fawxzzy-playbook | yes | - | adopt Playbook bootstrap in Foundation once package install is available |
| atlas | ATLAS | workspace-architecture | active | fawxzzy/ATLAS | yes | - | sync Foundation registry from ATLAS workspace observations |
| fitness | Fawxzzy Fitness | application | active | fawxzzy/fawxzzy-fitness | yes | fawxzzy-fitness, fawxzzy-fitness-prod-deploy | normalize AGENT.md to AGENTS.md convention |
| lifeline | Fawxzzy Lifeline | operator-runtime | active | fawxzzy/fawxzzy-lifeline | yes | - | define Foundation lifeline target once deployment runtime is chosen |
| mazer | Fawxzzy Mazer | application-game | active | fawxzzy/fawxzzy-mazer | yes | fawxzzy-mazer | surface build/runtime proof in Foundation console |
| trove | Fawxzzy Trove | content-data | active | fawxzzy/fawxzzy-trove | yes | fawxzzy-trove | add repo-local AI/governance contract when ready |
| nat-1-games | Nat 1 Games | application | observed-deployment | fawxzzy/nat-1-games | unknown | nat-1-games | confirm canonical GitHub repository |


## Promotion Ledger

### Fawxzzy Foundation
- Current label: `active control-plane`
- GitHub Actions Foundation CI push run 25131302841 completed successfully for commit abda5a586716d356f7c2bb1e670f5783f80b0fed at 2026-04-29T20:10:19Z.
- Latest Vercel production deployment dpl_8CbDvRtaeq7gxSbCAg94r7vWR8A2 reached READY at 2026-04-30T00:51:18Z and serves https://fawxzzy-foundation.vercel.app.
- Clean deployment provenance is pinned to commit abda5a586716d356f7c2bb1e670f5783f80b0fed with source cli, actor codex, and no gitDirty flag.
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
