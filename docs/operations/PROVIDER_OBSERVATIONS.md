# Provider Observations

## Purpose

Provider observations are file-based inputs for proof refresh. They let an operator compare current external evidence against `data/projects.json` without giving Foundation live provider authority.

## Contract

Schema:

- `packages/contracts/provider-observations.schema.json`

Safe example:

- `fixtures/provider-observations.example.json`
- `fixtures/provider-capture.example.json` via normalization

Supported observation facets:

- GitHub repo state
- GitHub CI/check state
- Vercel project state
- Vercel deployment state
- Supabase project inventory state

## Capture rules

- Keep capture files as explicit operator artifacts.
- Do not put secrets, tokens, cookies, or private credentials in the JSON.
- Use `captureMode: "operator-capture"` for real snapshots.
- Use `coverage: "full"` only when every tracked project intended for the pass is represented.
- Use `coverage: "partial"` when the file is only a targeted sample; omitted projects fall back to registry-recorded observations during draft generation.

## Usage

Normalize a manual capture pack first:

```bash
pnpm provider:observations:normalize --input fixtures/provider-capture.example.json
```

The normalizer writes:

- `.foundation/provider-observations.normalized.json`
- `.foundation/provider-observations.normalized.md`

Then use the normalized output with proof refresh:

```bash
pnpm foundation proof refresh --draft --observations .foundation/provider-observations.normalized.json
```

Or use a committed example directly:

Registry-only mode:

```bash
pnpm foundation proof refresh --draft
```

External observation mode:

```bash
pnpm foundation proof refresh --draft --observations fixtures/provider-observations.example.json
```

The command still writes only:

- `.foundation/proof-refresh-draft.json`
- `.foundation/proof-refresh-draft.md`

Runtime observation normalization also stays under `.foundation/`:

- `.foundation/provider-observations.normalized.json`
- `.foundation/provider-observations.normalized.md`

## Non-goals

- No live provider reads inside the draft script yet
- No automatic registry mutation
- No provider writes
- No hidden deployments
