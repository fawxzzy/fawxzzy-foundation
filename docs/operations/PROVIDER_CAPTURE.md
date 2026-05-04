# Provider Capture

## Purpose

Provider capture is the operator-facing collection step that happens before proof refresh. It turns manually gathered GitHub, Vercel, and Supabase evidence into a normalized provider observation file without giving Foundation hidden provider authority.

## Contracts

- Raw capture schema: `packages/contracts/provider-capture.schema.json`
- Normalized observation schema: `packages/contracts/provider-observations.schema.json`
- Raw capture example: `fixtures/provider-capture.example.json`
- Normalized observation example: `fixtures/provider-observations.example.json`

## Capture checklist

GitHub repo state:

- record `slug`
- record `observedAt`
- record repo existence and `fullName`
- record visibility
- record default branch
- record source URL if available

GitHub workflow/check state:

- record `slug`
- record `observedAt`
- record workflow/check status
- record conclusion
- record commit SHA
- record branch
- record run ID if available

Vercel project state:

- record `slug`
- record `observedAt`
- record team slug
- record visible project names
- record visible project IDs when available

Vercel deployment state:

- record `slug`
- record `observedAt`
- record deployment status
- record target
- record deployment ID
- record alias
- record GitHub commit SHA
- record `gitDirty` only when directly visible in provider evidence

Supabase project inventory:

- record `slug`
- record `observedAt`
- record project status
- record project ref
- record project name
- record region
- record Postgres version
- record organization when available

## Safe fixture rules

- no tokens
- no cookies
- no `Authorization` headers
- no environment variable dumps
- no database URLs with credentials
- no private secrets or service-role strings

## Normalize a capture pack

```bash
pnpm provider:observations:normalize --input fixtures/provider-capture.example.json
```

Default runtime outputs:

- `.foundation/provider-observations.normalized.json`
- `.foundation/provider-observations.normalized.md`

Both outputs are runtime-only and must remain untracked.

## Next step

After normalization:

```bash
pnpm foundation proof refresh --draft --observations .foundation/provider-observations.normalized.json
```

The proof-refresh command remains proposal-only. It still does not mutate `data/projects.json`.
