# Registry Change Bundles

## Purpose

Registry change bundles are the review and approval layer between proposal artifacts and manual edits to `data/projects.json`.

They do not mutate the registry. They package:

- the reviewed source artifact,
- the source artifact hash,
- the affected project slugs,
- the proposed manual operations,
- the required evidence references,
- and the approval state.

## Operator workflow

1. Generate or collect a proposal artifact.
2. Review the proposal artifact.
3. Render a registry change bundle.
4. Record approval, rejection, or supersession in the bundle.
5. Edit `data/projects.json` manually if the bundle is approved.
6. Run `pnpm build`.
7. Run `pnpm verify:local`.
8. Commit source truth plus generated surfaces.
9. Deploy Foundation only if source is clean and a Foundation-only parity update is intended.

Canonical flow:

```text
proposal artifact -> review -> registry change bundle -> approval -> manual registry edit -> build -> verify -> commit -> optional deploy
```

## Commands

Render a bundle from an input file:

```bash
pnpm registry:change-bundle --input fixtures/registry-change-bundle.example.json
```

Or through the operator CLI:

```bash
pnpm foundation registry change-bundle --input fixtures/registry-change-bundle.example.json
```

Artifacts:

- `.foundation/registry-change-bundle.json`
- `.foundation/registry-change-bundle.md`

Both artifacts remain runtime-only and must stay gitignored.

## Contract

Schema:

- `packages/contracts/registry-change-bundle.schema.json`

Safe example:

- `fixtures/registry-change-bundle.example.json`

Bundle fields:

- source draft path
- source draft SHA-256
- affected project slugs
- proposed registry operations
- required evidence references
- approval state and notes
- `mutationAuthority: "none"`

Bundle statuses:

- `proposed`
- `approved`
- `rejected`
- `superseded`

Approval statuses:

- `pending`
- `approved`
- `rejected`
- `superseded`

## Rules

- Bundles are auditable review artifacts, not mutation authority.
- Approved bundles still do not edit `data/projects.json` automatically.
- Evidence references must stay explicit so reviewers can trace every proposed registry change back to a reviewed artifact.
- Foundation promotion proof stays pinned unless an operator explicitly chooses to change it through a separately reviewed process.

## Non-goals

- No automatic registry mutation
- No downstream repo edits
- No provider writes
- No hidden deploy actions
