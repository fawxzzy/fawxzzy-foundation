# Project Registry

Generated from `data/projects.json`. Do not hand-edit this file unless the generator is also updated.

Updated: 2026-05-06T19:20:00.000Z

## Summary

- Owner: fawxzzy
- Projects: 8
- Active projects: 7
- Deployment-mapped projects: 5

## State Model

- Rule: Desired state, observed state, and health judgment must remain separate machine fields.
- Pattern: `desiredState -> observedState -> healthState -> derived prose`.
- Failure mode: Scorecards built on blended status fields create false precision and rewrite pressure.
- Legacy compatibility: `status` remains present for existing consumers, but migrated projects derive it from the split model.
- Rule: Scorecards consume split-state truth; they do not replace registry evidence.
- Pattern: `desiredState -> observedState -> healthState -> scorecard -> recommended next action`.
- Failure mode: Numeric scores without evidence explanations create false confidence.

## Projects

| Slug | Name | Kind | Desired lifecycle | Observed proof | Health | Scorecard | Legacy status | Repo | Repo exists | Vercel | First next action |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| foundation | Fawxzzy Foundation | control-plane | active | current | healthy | healthy 100/100 | active | fawxzzy/fawxzzy-foundation | yes | fawxzzy-foundation | Ingest Playbook verification receipts and read-first artifacts into Foundation |
| playbook | Fawxzzy Playbook | governance-runtime | active | not-applicable | healthy | healthy 90/100 | active | fawxzzy/fawxzzy-playbook | yes | - | provide Playbook verification receipts and read-first artifacts to the Foundation ingestion draft |
| atlas | ATLAS | workspace-architecture | active | not-applicable | healthy | healthy 90/100 | active | fawxzzy/ATLAS | yes | - | sync Foundation registry from ATLAS workspace observations |
| fitness | Fawxzzy Fitness | application | active | current | warning | warning 85/100 | active | fawxzzy/fawxzzy-fitness | yes | fawxzzy-fitness (primary), fawxzzy-fitness-prod-deploy (historical) | monitor future Fitness deployment proof freshness on the primary fawxzzy-fitness project |
| lifeline | Fawxzzy Lifeline | operator-runtime | active | not-applicable | healthy | healthy 90/100 | active | fawxzzy/fawxzzy-lifeline | yes | - | provide reviewed Lifeline receipts and rollback-state artifacts to the Foundation receipt projection |
| mazer | Fawxzzy Mazer | application-game | active | current | healthy | healthy 100/100 | active | fawxzzy/fawxzzy-mazer | yes | fawxzzy-mazer | surface build/runtime proof in Foundation console |
| trove | Fawxzzy Trove | content-data | active | current | healthy | healthy 100/100 | active | fawxzzy/fawxzzy-trove | yes | fawxzzy-trove | monitor future Trove deployment proof freshness |
| nat-1-games | Nat 1 Games | application | observed-deployment | current | healthy | healthy 100/100 | observed-deployment | ZachariahRedfield/nat1-games | unknown | nat-1-games | refresh proof only from READY production deployments whose Vercel metadata still identifies ZachariahRedfield/nat1-games on main |


## Health Ledger

### Fawxzzy Foundation
- Desired: lifecycle `active`, role `control-plane`
- Desired summary: Foundation should remain the active read-first control plane for the project family.
- Owner intent: Project registry truth, proof health, privacy posture, and operator status stay here without taking execution authority.
- Observed: repo `verified`, deployment `ready`, database `not-applicable`, proof `current`
- Observed summary: Foundation is publicly versioned, mapped to production on Vercel, and its pinned promotion proof remains current.
- Health judgment: overall `healthy`, quality `clean`
- Health summary: Desired control-plane role, live deployment evidence, and clean pinned proof currently align.
- Legacy compatibility status: `active`
- Scorecard: `healthy` 100/100
- Score Evidence completeness: `pass` 25/25 - Split-state truth, deployment evidence, and promotion-proof lineage are all present.
- Score Proof freshness: `pass` 25/25 - Proof is current, clean, and anchored to the pinned active-control-plane promotion proof.
- Score Deployment posture: `pass` 25/25 - Foundation has a READY production deployment with clean observed provenance.
- Score Data and security posture: `not-applicable` 25/25 - Foundation itself is not using an application database posture lane in this scorecard slice.
- Score next action: Ingest Playbook verification receipts and read-first artifacts into Foundation.
- Overall health facet: `healthy` - Promotion proof stays pinned to the original active-control-plane deployment while the latest production parity is tracked separately.
- GitHub: `verified` - GitHub repo exists, is public, and tracks main as the default branch. (checked `2026-05-01T03:18:52.146Z`)
- Vercel: `verified` - Vercel project is mapped under the fawxzzy team. (checked `2026-05-01T03:18:52.146Z`)
- Vercel projects: `fawxzzy-foundation`
- Recorded Vercel mappings: `fawxzzy-foundation`
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
- Desired: lifecycle `active`, role `governance-runtime`
- Desired summary: Playbook should be the deterministic governance and verification runtime for repo-local truth.
- Owner intent: Foundation should ingest Playbook read surfaces and receipts without re-implementing Playbook execution.
- Observed: repo `verified`, deployment `not-applicable`, database `not-applicable`, proof `not-applicable`
- Observed summary: Foundation currently verifies Playbook source ownership, but no deployment or proof target is defined here yet.
- Health judgment: overall `healthy`, quality `advisory`
- Health summary: The observed state is acceptable for the intended governance-runtime role, but Foundation still needs supplied Playbook read artifacts before visibility can move beyond a partial view.
- Health warning: Foundation now has a Playbook ingestion lane, but no reviewed Playbook verification receipts or read-interface artifacts have been supplied yet.
- Legacy compatibility status: `active`
- Scorecard: `healthy` 90/100
- Score Evidence completeness: `warn` 15/25 - Split-state truth is present, and Foundation now has an ingestion lane, but no reviewed Playbook verification receipts or read-interface evidence have been supplied yet.
- Score Proof freshness: `not-applicable` 25/25 - No deployment proof target is defined for Playbook in Foundation yet.
- Score Deployment posture: `not-applicable` 25/25 - Foundation does not currently track a deployment lane for Playbook.
- Score Data and security posture: `not-applicable` 25/25 - No Playbook database or privacy posture lane is modeled in Foundation yet.
- Score warning: Foundation now has a Playbook ingestion lane, but no reviewed Playbook verification receipts or read-interface artifacts have been supplied yet.
- Score next action: Provide Playbook verification receipts and read-first artifacts to the Foundation ingestion draft.
- Overall health facet: `tracked` - GitHub repo truth is recorded; deployment proof has not been introduced into Foundation yet.
- GitHub: `verified` - GitHub repo exists and is recorded in Foundation. (checked `2026-05-01T03:18:52.146Z`)
- Vercel: `not-applicable` - No Vercel project is mapped for Playbook in Foundation yet. (checked `2026-05-01T03:18:52.146Z`)
- Deployment: `not-applicable` - Foundation has no deployment proof target for Playbook yet. (checked `2026-05-01T03:18:52.146Z`)
- Proof: `repo-tracked` - Repo ownership proof is recorded; deployment proof is not applicable until a deployment surface is defined. (checked `2026-05-01T03:18:52.146Z`)
- Proof freshness window: 168h

### ATLAS
- Desired: lifecycle `active`, role `workspace-architecture`
- Desired summary: ATLAS should remain the stack boundary, coordination layer, and workspace architecture inventory for the project family.
- Owner intent: Foundation should project ATLAS coordination truth without replacing the stack root or treating it like an application runtime.
- Observed: repo `verified`, deployment `not-applicable`, database `not-applicable`, proof `not-applicable`
- Observed summary: Foundation verifies the public ATLAS source repo and intentionally does not expect a deployment or database surface from the workspace architecture layer.
- Health judgment: overall `healthy`, quality `advisory`
- Health summary: The observed repo-only state matches the intended workspace-architecture role, but Foundation still treats ATLAS as a read-first coordination surface rather than a scored runtime.
- Health warning: ATLAS is intentionally tracked as a coordination and architecture repo without a deployment-proof lane.
- Legacy compatibility status: `active`
- Scorecard: `healthy` 90/100
- Score Evidence completeness: `warn` 15/25 - Split-state truth and repo visibility are present, but Foundation has not yet ingested ATLAS-side coordination receipts or validation artifacts.
- Score Proof: `not-applicable` 25/25 - ATLAS is tracked as a coordination and workspace inventory layer rather than a deployment-proof target.
- Score Deployment posture: `not-applicable` 25/25 - Foundation does not expect a deployment surface for ATLAS.
- Score Data and security posture: `not-applicable` 25/25 - ATLAS is not modeled as an application data or privacy surface inside Foundation.
- Score warning: Foundation has not yet ingested ATLAS coordination receipts or validation artifacts.
- Score next action: Sync Foundation registry from ATLAS workspace observations and future coordination receipts.
- Overall health facet: `tracked` - Foundation tracks the GitHub source-of-truth repo, but no deployment proof is expected from this workspace layer.
- GitHub: `verified` - GitHub repo exists and is recorded in Foundation. (checked `2026-05-01T03:18:52.146Z`)
- Vercel: `not-applicable` - No Vercel project is mapped for the workspace inventory layer. (checked `2026-05-01T03:18:52.146Z`)
- Deployment: `not-applicable` - Foundation does not expect a deployment surface for ATLAS. (checked `2026-05-01T03:18:52.146Z`)
- Proof: `repo-tracked` - Repo ownership proof is recorded; deployment proof is not applicable. (checked `2026-05-01T03:18:52.146Z`)
- Proof freshness window: 168h

### Fawxzzy Fitness
- Desired: lifecycle `active`, role `application`
- Desired summary: Fitness should remain the primary application proving ground for deployment proof, privacy posture, and Supabase governance.
- Owner intent: Track clean production proof and conservative private-data posture without moving Fitness implementation truth into Foundation.
- Observed: repo `verified`, deployment `ready`, database `observed`, proof `current`
- Observed summary: Foundation observes a verified public repo, READY production deployment, current deployment proof, and an active Supabase project with advisor evidence.
- Health judgment: overall `warning`, quality `advisory`
- Health summary: Deployment proof is clean and Wave 1A search_path hardening is proved, but remaining security findings still keep Fitness privacy and database posture below healthy.
- Health warning: Wave 1A search_path hardening is now proved in Supabase advisor evidence, but SECURITY DEFINER execute-permission findings and leaked password protection still block stronger privacy posture claims.
- Health warning: Historical prod-deploy mapping remains documented until active inventory or remediation changes.
- Legacy compatibility status: `active`
- Scorecard: `warning` 85/100
- Score Evidence completeness: `pass` 25/25 - Split-state truth, production deployment evidence, and Supabase observation data are all present.
- Score Proof freshness: `pass` 25/25 - Deployment proof is current and clean on the primary Fitness Vercel project.
- Score Deployment posture: `pass` 25/25 - Primary production deployment is READY, while the legacy prod-deploy lane is retained only as historical inventory.
- Score Data and security posture: `warn` 10/25 - Wave 1A cleared the four search_path findings, but SECURITY DEFINER execute-permission warnings and leaked password protection still block stronger privacy and data-security claims.
- Score warning: Wave 1A search_path hardening is now proved in Supabase advisor evidence, but SECURITY DEFINER execute-permission findings and leaked password protection still block stronger privacy posture claims.
- Score warning: Historical prod-deploy mapping remains documented until active inventory or remediation changes.
- Score next action: Execute the next Fitness-owned remediation lanes for SECURITY DEFINER execute permissions and leaked password protection, then require reviewed advisor proof before changing posture.
- Overall health facet: `deployment-observed` - GitHub repo is public, the primary Vercel production deployment is proved, and the legacy fawxzzy-fitness-prod-deploy lane is now classified as historical.
- GitHub: `verified` - GitHub repo exists publicly on main. (checked `2026-05-01T03:45:12.577Z`)
- Vercel: `verified` - Primary Vercel project is visible under the fawxzzy team. The recorded fawxzzy-fitness-prod-deploy project ID now returns 404 and is absent from the current team inventory, so Foundation keeps it only as a historical mapping. (checked `2026-05-02T18:04:46.3873760Z`)
- Vercel projects: `fawxzzy-fitness`
- Recorded Vercel mappings: `fawxzzy-fitness (primary)`, `fawxzzy-fitness-prod-deploy (historical)`
- Deployment: `ready` - Latest observed production deployment is READY on fawxzzy-fitness-local.vercel.app and the primary project now reports clean commit provenance. (checked `2026-05-02T17:24:42.9220000Z`)
- Latest deployment facts: deployment `dpl_B8f413NisExwpfyCzEw74JgRhpcS`, target `production`, alias `fawxzzy-fitness-local.vercel.app`, commit `01bf2dc272ad7c892bf2dac64d47b2b47d943cff`, message "Merge remote-tracking branch 'origin/main' into codex/supabase-canonical-upsert"
- Proof: `current` - Foundation captured a current clean deployment proof snapshot for Fitness from the primary Vercel project, and the former prod-deploy lane is now recorded as historical rather than an active proof target. (checked `2026-05-02T18:04:46.3873760Z`)
- Proof freshness window: 168h
- Last deployment proof captured: `2026-05-02T17:24:42.9220000Z`
- Proof quality: `clean` - READY proof from the primary project is current and clean, and the legacy prod-deploy lane is classified as historical inventory only.
- Latest observed deployment commit: `01bf2dc272ad7c892bf2dac64d47b2b47d943cff`
- Latest observed deployment id: `dpl_B8f413NisExwpfyCzEw74JgRhpcS`

### Fawxzzy Lifeline
- Desired: lifecycle `active`, role `operator-runtime`
- Desired summary: Lifeline should remain the execution and runtime receipt boundary for stack operations.
- Owner intent: Foundation should project Lifeline receipts and runtime outcomes without becoming the executor.
- Observed: repo `verified`, deployment `not-applicable`, database `not-applicable`, proof `not-applicable`
- Observed summary: Foundation currently verifies Lifeline source ownership, but execution receipts are not yet projected into the control plane.
- Health judgment: overall `healthy`, quality `advisory`
- Health summary: The intended operator-runtime role is clear, but Foundation still needs supplied Lifeline receipts before its view of execution outcomes can move beyond a partial state.
- Health warning: Foundation now has a Lifeline receipt projection lane, but no reviewed Lifeline receipts or rollback-state artifacts have been supplied yet.
- Legacy compatibility status: `active`
- Scorecard: `healthy` 90/100
- Score Evidence completeness: `warn` 15/25 - Split-state truth is present, and Foundation now has a receipt projection lane, but no reviewed Lifeline receipts or rollback evidence have been supplied yet.
- Score Proof freshness: `not-applicable` 25/25 - No deployment proof target is defined for Lifeline yet.
- Score Deployment posture: `not-applicable` 25/25 - Foundation does not currently track a deployment lane for Lifeline.
- Score Data and security posture: `not-applicable` 25/25 - No Lifeline database or privacy posture lane is modeled in Foundation yet.
- Score warning: Foundation now has a Lifeline receipt projection lane, but no reviewed Lifeline receipts or rollback-state artifacts have been supplied yet.
- Score next action: Provide reviewed Lifeline receipts and rollback-state artifacts to the Foundation receipt projection.
- Overall health facet: `tracked` - GitHub repo truth is recorded; deployment proof will follow once Lifeline runtime targets are formalized.
- GitHub: `verified` - GitHub repo exists and is recorded in Foundation. (checked `2026-05-01T03:18:52.146Z`)
- Vercel: `not-applicable` - No Vercel project is mapped for Lifeline. (checked `2026-05-01T03:18:52.146Z`)
- Deployment: `not-applicable` - Foundation has not defined a deployment surface for Lifeline. (checked `2026-05-01T03:18:52.146Z`)
- Proof: `repo-tracked` - Repo ownership proof is recorded; deployment proof is not applicable yet. (checked `2026-05-01T03:18:52.146Z`)
- Proof freshness window: 168h

### Fawxzzy Mazer
- Desired: lifecycle `active`, role `application`
- Desired summary: Mazer should remain an active application surface with current deployment proof and owner-repo implementation truth kept outside Foundation.
- Owner intent: Track READY production proof and repo ownership without inventing data or governance claims that Mazer has not published yet.
- Observed: repo `verified`, deployment `ready`, database `unknown`, proof `current`
- Observed summary: Foundation observes a verified public repo, READY production deployment, and current clean proof for Mazer, but no database posture is modeled here yet.
- Health judgment: overall `healthy`, quality `clean`
- Health summary: Desired application ownership, live deployment evidence, and current clean proof are aligned for Mazer.
- Legacy compatibility status: `active`
- Scorecard: `healthy` 100/100
- Score Evidence completeness: `pass` 25/25 - Split-state truth, repo visibility, and current deployment evidence are all present for Mazer.
- Score Proof freshness: `pass` 25/25 - Current clean proof is captured from the live production alias.
- Score Deployment posture: `pass` 25/25 - Mazer has a READY production deployment with recorded commit provenance.
- Score Data and security posture: `not-applicable` 25/25 - No database or privacy posture lane is modeled for Mazer in Foundation yet.
- Score next action: Surface build and runtime proof details for Mazer in the Foundation console.
- Overall health facet: `deployment-observed` - GitHub repo is public and a current production deployment proof is captured from Vercel.
- GitHub: `verified` - GitHub repo exists publicly on main. (checked `2026-05-01T03:45:12.577Z`)
- Vercel: `verified` - Vercel project is visible under the fawxzzy team and exposes a current production target. (checked `2026-05-01T03:45:12.577Z`)
- Vercel projects: `fawxzzy-mazer`
- Recorded Vercel mappings: `fawxzzy-mazer`
- Deployment: `ready` - Latest observed production deployment is READY on fawxzzy-mazer.vercel.app. (checked `2026-05-01T03:45:12.577Z`)
- Latest deployment facts: deployment `dpl_9yFBd8hRjq1uKoibCZC7bFMBtrMR`, target `production`, alias `fawxzzy-mazer.vercel.app`, commit `f42f472bb057b2e4d57d8ac5c06253e2c3ef5166`, message "updated"
- Proof: `current` - Foundation captured a current deployment proof snapshot for Mazer from the live production alias. (checked `2026-05-01T03:45:12.577Z`)
- Proof freshness window: 168h
- Last deployment proof captured: `2026-05-01T03:45:12.577Z`
- Proof quality: `clean` - READY proof is current and the checked deployment metadata appears clean.
- Latest observed deployment commit: `f42f472bb057b2e4d57d8ac5c06253e2c3ef5166`
- Latest observed deployment id: `dpl_9yFBd8hRjq1uKoibCZC7bFMBtrMR`

### Fawxzzy Trove
- Desired: lifecycle `active`, role `application`
- Desired summary: Trove should remain an active content and data application surface with current deployment proof and owner-repo truth preserved.
- Owner intent: Track clean production proof and project identity while leaving future governance and data-contract expansion in the Trove owner repo until explicit contracts exist.
- Observed: repo `verified`, deployment `ready`, database `unknown`, proof `current`
- Observed summary: Foundation observes a verified public repo, READY production deployment, and current clean proof for Trove, but no database or privacy posture lane is modeled yet.
- Health judgment: overall `healthy`, quality `clean`
- Health summary: Desired application ownership, live deployment evidence, and current clean proof are aligned for Trove.
- Legacy compatibility status: `active`
- Scorecard: `healthy` 100/100
- Score Evidence completeness: `pass` 25/25 - Split-state truth, repo visibility, and current deployment evidence are all present for Trove.
- Score Proof freshness: `pass` 25/25 - Current clean proof is captured from the live production alias.
- Score Deployment posture: `pass` 25/25 - Trove has a READY production deployment with clean recorded provenance.
- Score Data and security posture: `not-applicable` 25/25 - No database or privacy posture lane is modeled for Trove in Foundation yet.
- Score next action: Monitor Trove deployment proof freshness and add repo-local governance contracts when they exist.
- Overall health facet: `deployment-observed` - GitHub repo is public and a current production deployment proof is captured from Vercel.
- GitHub: `verified` - GitHub repo exists publicly on main. (checked `2026-05-01T03:45:12.577Z`)
- Vercel: `verified` - Vercel project is visible under the fawxzzy team and exposes a current production target. (checked `2026-05-01T03:45:12.577Z`)
- Vercel projects: `fawxzzy-trove`
- Recorded Vercel mappings: `fawxzzy-trove`
- Deployment: `ready` - Latest observed production deployment is READY on fawxzzy-trove.vercel.app and the checked deployment metadata appears clean. (checked `2026-05-02T17:19:13.7580000Z`)
- Latest deployment facts: deployment `dpl_CjmRU5tRnirBC42hs2eWg4WKK4QL`, target `production`, alias `fawxzzy-trove.vercel.app`, commit `0e9ae02c4c70e604b458e6d9d0489651827134a3`, message "Merge pull request #3 from fawxzzy/codex/trove-pilot-release-cutover"
- Proof: `current` - Foundation captured a current clean deployment proof snapshot for Trove from the live production alias. (checked `2026-05-02T17:19:13.7580000Z`)
- Proof freshness window: 168h
- Last deployment proof captured: `2026-05-02T17:19:13.7580000Z`
- Proof quality: `clean` - READY proof is current and the checked deployment metadata appears clean.
- Latest observed deployment commit: `0e9ae02c4c70e604b458e6d9d0489651827134a3`
- Latest observed deployment id: `dpl_CjmRU5tRnirBC42hs2eWg4WKK4QL`

### Nat 1 Games
- Desired: lifecycle `observed-deployment`, role `application`
- Desired summary: Nat 1 Games should remain a deployment-observed application in Foundation while its intentionally private source stays outside public repo verification.
- Owner intent: Track READY production proof and accepted private-source provenance without weakening the explicit policy boundary for the private GitHub repo.
- Observed: repo `private-source`, deployment `ready`, database `unknown`, proof `current`
- Observed summary: Foundation observes accepted private-source provenance from Vercel, a READY production deployment, and current proof for Nat 1 Games without direct GitHub repo access.
- Health judgment: overall `healthy`, quality `accepted-private-source`
- Health summary: Observed deployment evidence and accepted private-source provenance align with the intended observed-deployment role for Nat 1 Games.
- Legacy compatibility status: `observed-deployment`
- Scorecard: `healthy` 100/100
- Score Evidence completeness: `pass` 25/25 - Split-state truth, Vercel deployment evidence, and accepted private-source provenance are all present for Nat 1 Games.
- Score Proof freshness: `pass` 25/25 - Current proof is accepted under the private-source policy because Vercel still identifies the intended source repo on main.
- Score Deployment posture: `pass` 25/25 - Nat 1 Games has a READY production deployment with recorded commit provenance.
- Score Data and security posture: `not-applicable` 25/25 - No database or privacy posture lane is modeled for Nat 1 Games in Foundation yet.
- Score next action: Refresh Nat 1 Games proof only from READY production deployments whose Vercel metadata still identifies ZachariahRedfield/nat1-games on main.
- Overall health facet: `deployment-observed` - A current Vercel production deployment is proved, and Vercel metadata confirms the intentionally private GitHub source repo.
- GitHub: `private-source` - GitHub public API does not expose ZachariahRedfield/nat1-games, and Vercel production metadata confirms that private source repo on main. (checked `2026-05-01T03:45:12.577Z`)
- Vercel: `verified` - Vercel project is visible under the fawxzzy team and exposes a current production target. (checked `2026-05-01T03:45:12.577Z`)
- Vercel projects: `nat-1-games`
- Recorded Vercel mappings: `nat-1-games`
- Deployment: `ready` - Latest observed production deployment is READY on nat-1-games.vercel.app. (checked `2026-05-01T03:45:12.577Z`)
- Latest deployment facts: deployment `dpl_4rZ9yz4QZch3G9Q22B8eVqPx7gsq`, target `production`, alias `nat-1-games.vercel.app`, commit `ce9643465d69f76a46d92d0db6ed855d117e1bbd`, message "Merge pull request #227 from ZachariahRedfield/codex/simplify-time-zone-selection-and-auto-select Improve Start Session UI and prevent mobile input zoom"
- Proof: `current` - Foundation captured a current deployment proof snapshot for Nat 1 Games from Vercel, and the intentionally private GitHub source is accepted through Vercel provenance. (checked `2026-05-01T03:45:12.577Z`)
- Proof freshness window: 168h
- Last deployment proof captured: `2026-05-01T03:45:12.577Z`
- Proof quality: `accepted-private-source` - READY proof is current, and private-source provenance is explicitly accepted when Vercel metadata still identifies ZachariahRedfield/nat1-games on main.
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
- Visible Vercel projects: `foundation`, `fitness`, `trove`, `nat-1-games`, `mazer`

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
