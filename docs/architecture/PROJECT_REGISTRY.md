# Project Registry

Generated from `data/projects.json`. Do not hand-edit this file unless the generator is also updated.

Updated: 2026-04-29T19:18:00.000Z

## Summary

- Owner: fawxzzy
- Projects: 8
- Active projects: 6
- Deployment-mapped projects: 5

## Projects

| Slug | Name | Kind | Status | Repo | Repo exists | Vercel | First next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| foundation | Fawxzzy Foundation | control-plane | incubating | fawxzzy/fawxzzy-foundation | yes | fawxzzy-foundation | Confirm the overall GitHub/Vercel commit check state is fully green |
| playbook | Fawxzzy Playbook | governance-runtime | active | fawxzzy/fawxzzy-playbook | yes | - | adopt Playbook bootstrap in Foundation once package install is available |
| atlas | ATLAS | workspace-architecture | active | fawxzzy/ATLAS | yes | - | sync Foundation registry from ATLAS workspace observations |
| fitness | Fawxzzy Fitness | application | active | fawxzzy/fawxzzy-fitness | yes | fawxzzy-fitness, fawxzzy-fitness-prod-deploy | normalize AGENT.md to AGENTS.md convention |
| lifeline | Fawxzzy Lifeline | operator-runtime | active | fawxzzy/fawxzzy-lifeline | yes | - | define Foundation lifeline target once deployment runtime is chosen |
| mazer | Fawxzzy Mazer | application-game | active | fawxzzy/fawxzzy-mazer | yes | fawxzzy-mazer | surface build/runtime proof in Foundation console |
| trove | Fawxzzy Trove | content-data | active | fawxzzy/fawxzzy-trove | yes | fawxzzy-trove | add repo-local AI/governance contract when ready |
| nat-1-games | Nat 1 Games | application | observed-deployment | fawxzzy/nat-1-games | unknown | nat-1-games | confirm canonical GitHub repository |


## Promotion Ledger

### Fawxzzy Foundation
- Current label: `remote-created + deployed / incubating`
- Promotion target: `active control-plane`
- Blocked on: `Fully green commit/check confirmation`
- GitHub Actions lane: Foundation CI succeeded at 2026-04-29 17:14:02Z.
- Vercel production deployment verified at https://fawxzzy-foundation.vercel.app on 2026-04-29.
- The connector surface I have here did not expose that push workflow run directly, and the combined-status lookup returned no status entries, so your GitHub UI/API observation is the source of truth for the CI detail.
- GitHub remote registration commit: `b83cea80e82231f15f435abd64be45e565df2d0f` (Register Foundation GitHub remote)
- Vercel project `fawxzzy-foundation`: project created + production deployment verified
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
| Overall commit/check state fully green | [ ] |
| Vercel project exists | [x] |
| Vercel deployment exists | [x] |
| Vercel deployment verified | [x] |
| Registry records Vercel deployment proof | [x] |
| Foundation promoted to active control-plane | [ ] |

Next valid move:
1. Confirm the overall GitHub/Vercel commit check state is fully green
2. Promote Foundation from incubating to active control-plane
3. Commit and push the registry/deployment proof update


## Principles

- private-first runtime artifacts
- deterministic project registry
- brief-thin human surfaces with machine-readable JSON truth
- modular repos under a shared governance layer
