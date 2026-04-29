# Project Registry

Generated from `data/projects.json`. Do not hand-edit this file unless the generator is also updated.

Updated: 2026-04-29T18:02:03.438Z

## Summary

- Owner: fawxzzy
- Projects: 8
- Active projects: 6
- Deployment-mapped projects: 4

## Projects

| Slug | Name | Kind | Status | Repo | Repo exists | Vercel | First next action |
| --- | --- | --- | --- | --- | --- | --- | --- |
| foundation | Fawxzzy Foundation | control-plane | incubating | fawxzzy/fawxzzy-foundation | yes | fawxzzy-foundation | Create/link Vercel project: fawxzzy-foundation |
| playbook | Fawxzzy Playbook | governance-runtime | active | fawxzzy/fawxzzy-playbook | yes | - | adopt Playbook bootstrap in Foundation once package install is available |
| atlas | ATLAS | workspace-architecture | active | fawxzzy/ATLAS | yes | - | sync Foundation registry from ATLAS workspace observations |
| fitness | Fawxzzy Fitness | application | active | fawxzzy/fawxzzy-fitness | yes | fawxzzy-fitness, fawxzzy-fitness-prod-deploy | normalize AGENT.md to AGENTS.md convention |
| lifeline | Fawxzzy Lifeline | operator-runtime | active | fawxzzy/fawxzzy-lifeline | yes | - | define Foundation lifeline target once deployment runtime is chosen |
| mazer | Fawxzzy Mazer | application-game | active | fawxzzy/fawxzzy-mazer | yes | fawxzzy-mazer | surface build/runtime proof in Foundation console |
| trove | Fawxzzy Trove | content-data | active | fawxzzy/fawxzzy-trove | yes | fawxzzy-trove | add repo-local AI/governance contract when ready |
| nat-1-games | Nat 1 Games | application | observed-deployment | fawxzzy/nat-1-games | unknown | nat-1-games | confirm canonical GitHub repository |


## Promotion Ledger

### Fawxzzy Foundation
- Current label: `remote-created / incubating`
- Promotion target: `active control-plane`
- Blocked on: `Vercel/deployment proof`
- GitHub Actions lane: Foundation CI succeeded at 2026-04-29 17:14:02Z.
- Overall commit/check state: not fully green yet because a Vercel check suite is still queued/pending on the same SHA.
- The connector surface I have here did not expose that push workflow run directly, and the combined-status lookup returned no status entries, so your GitHub UI/API observation is the source of truth for the CI detail.
- Latest registry commit: `b83cea80e82231f15f435abd64be45e565df2d0f` (Register Foundation GitHub remote)
- Vercel project `fawxzzy-foundation`: not found / 404
- Visible Vercel projects: `fitness`, `fitness-prod-deploy`, `trove`, `nat-1-games`, `mazer`

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
| Vercel project exists | [ ] |
| Vercel deployment exists | [ ] |
| Vercel deployment verified | [ ] |
| Registry records Vercel deployment proof | [ ] |
| Foundation promoted to active control-plane | [ ] |

Next valid move:
1. Create/link Vercel project: fawxzzy-foundation
2. Deploy Foundation
3. Verify deployment is observable
4. Update Foundation registry with Vercel project/deployment proof
5. Run pnpm build and pnpm verify:local
6. Commit and push the registry/deployment proof update


## Principles

- private-first runtime artifacts
- deterministic project registry
- brief-thin human surfaces with machine-readable JSON truth
- modular repos under a shared governance layer
