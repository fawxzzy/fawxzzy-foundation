# Proof Refresh

## Purpose

Foundation proof refresh is proposal-only. It compares the registry's recorded proof against the current provider observation already captured in `data/projects.json` and emits review artifacts under `.foundation/`.

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

Policy flags:

- `accepted-private-source`
- `historical-mapping`

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
