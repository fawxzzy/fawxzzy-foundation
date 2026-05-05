# Playbook Ingestion

## Purpose

Playbook ingestion is a read-first Foundation lane for verification receipts and governance artifacts.

Foundation ingests Playbook read artifacts; it does not execute or replace Playbook.

## Operator workflow

1. Collect a Playbook read-interface snapshot.
2. Render a Playbook ingestion draft in Foundation.
3. Review the ingestion draft.
4. If registry changes are needed, render a registry change bundle.
5. Approve the bundle before editing `data/projects.json` manually.
6. Run `pnpm build`.
7. Run `pnpm verify:local`.
8. Commit generated surfaces.

Canonical flow:

```text
Playbook receipt/artifact -> ingestion draft -> registry change bundle -> approved manual registry update
```

## Commands

Render the draft from an input file:

```bash
pnpm playbook:ingestion:draft --input fixtures/playbook-read-interface.example.json
```

Or through the operator CLI:

```bash
pnpm foundation playbook ingestion --draft --input fixtures/playbook-read-interface.example.json
```

Runtime outputs:

- `.foundation/playbook-ingestion-draft.json`
- `.foundation/playbook-ingestion-draft.md`

Both files are runtime-only and must remain untracked.

## Contract

- Draft schema: `packages/contracts/playbook-read-interface.schema.json`
- Safe example: `fixtures/playbook-read-interface.example.json`

## Represented evidence

- Playbook repo identity
- verification receipt status
- command and run evidence
- pattern and proposal artifacts
- policy and readiness artifacts
- open warnings and blockers
- recommended Foundation registry updates

## Rules

- Foundation ingests Playbook read artifacts; it does not execute or replace Playbook.
- Ingestion drafts remain proposal-only with `mutationAuthority: none`.
- Use registry change bundles before any manual registry edit.
- Preserve per-repo provenance so every Foundation judgment can point back to a specific Playbook artifact.

## Failure mode

Treating Foundation as the governance runtime duplicates Playbook and breaks repo ownership boundaries.

## Non-goals

- No Playbook execution from Foundation
- No Playbook repo mutation
- No automatic registry mutation
- No hidden deployment actions
