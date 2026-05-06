# Lifeline Receipt Projection

## Purpose

Lifeline receipt projection is a read-first Foundation lane for execution and deployment receipts.

Foundation projects Lifeline receipts; it does not execute Lifeline.

## Operator workflow

1. Collect a Lifeline receipt snapshot.
2. Render a Lifeline receipt projection in Foundation.
3. Review the projection.
4. If registry changes are needed, render a registry change bundle.
5. Approve the bundle before editing `data/projects.json` manually.
6. Run `pnpm build`.
7. Run `pnpm verify:local`.
8. Commit generated surfaces.

Canonical flow:

```text
Lifeline receipt -> Foundation projection draft -> registry change bundle -> approved manual registry update
```

## Commands

Render the projection from an input file:

```bash
pnpm lifeline:receipt:project --input fixtures/lifeline-receipt-projection.example.json
```

Or through the operator CLI:

```bash
pnpm foundation lifeline receipt project --input fixtures/lifeline-receipt-projection.example.json
```

Runtime outputs:

- `.foundation/lifeline-receipt-projection.json`
- `.foundation/lifeline-receipt-projection.md`

Both files are runtime-only and must remain untracked.

## Contract

- Projection schema: `packages/contracts/lifeline-receipt-projection.schema.json`
- Safe example: `fixtures/lifeline-receipt-projection.example.json`

## Represented evidence

- Lifeline repo identity
- target runtime and environment
- command and action name
- receipt ID and path
- approval state
- execution state
- healthcheck state
- rollback availability
- risk class
- open warnings and blockers
- recommended Foundation registry updates

## Rules

- Foundation projects Lifeline receipts; it does not execute Lifeline.
- Receipt projections remain proposal-only with `mutationAuthority: none`.
- Use registry change bundles before any manual registry edit.
- Preserve per-repo provenance so every Foundation judgment can point back to a specific Lifeline receipt.

## Failure mode

Treating Foundation as the execution boundary duplicates Lifeline and weakens operator provenance.

## Non-goals

- No Lifeline execution from Foundation
- No Lifeline repo mutation
- No automatic registry mutation
- No provider writes
