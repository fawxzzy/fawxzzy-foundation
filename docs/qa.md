# QA

This repo owns QA intent only.

- Adapter manifests live under `qa/adapters/`.
- Scenario manifests live under `qa/scenarios/`.
- ATLAS root owns schemas, runners, evidence validation, reporting, and promotion logic.

Foundation satisfies QA LLEL through deterministic command and contract evidence.

- Required preflight evidence: `pnpm run build`
- Required promotion evidence: `pnpm run verify:local`
- No visual or physical-device proof is required for the Foundation v1 contract lane.
