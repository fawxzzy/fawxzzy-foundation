# Proof Refresh

## Purpose

Foundation proof refresh is proposal-only. It can compare the registry's recorded proof either against the provider observation already captured in `data/projects.json` or against an external file-based observation snapshot, and it emits review artifacts under `.foundation/`.

## Operator workflow

1. Read provider observation.
2. Generate a draft.
3. Review the proposed classification and rationale.
4. Edit `data/projects.json` manually if the draft should be promoted.
5. Run `pnpm build`.
6. Run `pnpm verify:local`.
7. Commit the registry update and generated surfaces.
8. Deploy Foundation only if source is clean and a Foundation-only parity update is intended.

Canonical flow:

```text
provider observation -> draft -> review -> registry edit -> build -> verify -> commit -> optional deploy
```

## Commands

Generate the draft:

```bash
pnpm proof:refresh:draft
```

Or through the operator CLI:

```bash
pnpm foundation proof refresh --draft
```

With an external observation file:

```bash
pnpm foundation proof refresh --draft --observations fixtures/provider-observations.example.json
```

With a normalized runtime capture:

```bash
pnpm provider:observations:normalize --input fixtures/provider-capture.example.json
pnpm foundation proof refresh --draft --observations .foundation/provider-observations.normalized.json
```

Artifacts:

- `.foundation/proof-refresh-draft.json`
- `.foundation/proof-refresh-draft.md`

Both artifacts remain runtime-only and must stay gitignored.

## Classification model

Primary disposition:

- `unchanged-proof`
- `stale-proof`
- `provider-newer-than-registry`
- `provider-missing`
- `provider-conflict`

Supplemental classifications:

- `accepted-private-source`
- `historical-mapping`
- `immutable-promotion-proof`

External observation input stays read-only. The file is evidence for comparison only; it does not grant mutation authority or provider access.

## Foundation immutability rule

Foundation promotion proof is pinned. The draft may observe newer live deployment facts, but it must not rewrite the pinned promotion proof fields unless an operator explicitly chooses to do so.

Protected fields:

- `health.proof.promotionProofCommitSha`
- `health.proof.promotionProofDeploymentId`
- `promotion.registryCommit.sha`

## Non-goals

- No automatic mutation of `data/projects.json`
- No provider setting changes
- No repo permission changes
- No downstream app edits
- No hidden deployment actions
