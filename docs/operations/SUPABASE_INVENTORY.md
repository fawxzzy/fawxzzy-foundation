# Supabase Inventory

## Purpose

Supabase inventory is the first read-only Foundation layer for the private data and security backbone. It records observed database posture without mutating Supabase and without making privacy claims beyond the evidence currently captured.

## Commands

Render a draft from an input file:

```bash
pnpm supabase:inventory:draft --input fixtures/supabase-inventory.example.json
```

Or through the operator CLI:

```bash
pnpm foundation supabase inventory --draft --input fixtures/supabase-inventory.example.json
```

Runtime outputs:

- `.foundation/supabase-inventory-draft.json`
- `.foundation/supabase-inventory-draft.md`

Both files are runtime-only and must remain untracked.

## Contract

- Draft schema: `packages/contracts/supabase-inventory-draft.schema.json`
- Safe example: `fixtures/supabase-inventory.example.json`

## Represented evidence

- project ref, name, region, status, and Postgres version
- schema and table summary
- migration summary
- extension summary
- edge function summary
- security advisor summary
- performance advisor summary
- RLS/security posture classification
- privacy claim posture

## Privacy claim rule

Use these values conservatively:

- `unclaimed`
- `draft`
- `proved`
- `blocked`

Do not move to `proved` without actual security evidence and review. If important security evidence is unavailable, prefer `draft` or `blocked`.

## Non-goals

- No DDL
- No auth/policy/storage changes
- No project or branch creation
- No hidden provider writes
- No automatic registry mutation
