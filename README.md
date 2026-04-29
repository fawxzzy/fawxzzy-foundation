# Fawxzzy Foundation

Foundation is the top-level operating layer for the Fawxzzy project family. It starts as a small, deterministic repo: a project registry, a governance contract, a static operator console, and local verification scripts that do not require any external dependencies.

## What this bootstrap gives us

- A canonical registry at `data/projects.json`.
- A Foundation config contract at `foundation.config.json`.
- A no-framework static console in `apps/console/public`.
- A dependency-free CLI at `packages/cli/bin/foundation.mjs`.
- A local verification gate at `pnpm verify:local`.
- GitHub/Vercel handoff docs in `docs/operations/`.
- Playbook-compatible AI handoff metadata in `.playbook/ai-contract.json`.

## Current role

Foundation does not replace ATLAS, Playbook, Lifeline, Fitness, Mazer, or Trove. It coordinates them.

| Layer | Role |
| --- | --- |
| Foundation | Project registry, governance map, operator console, deployment inventory |
| ATLAS | Architecture/workspace inventory |
| Playbook | Deterministic repo intelligence and verification runtime |
| Lifeline | Local operator/runtime control |
| Apps | Fitness, Mazer, Trove, Nat 1 Games, and future surfaces |

## Quick start

```bash
corepack enable
pnpm build
pnpm verify:local
pnpm foundation status
pnpm foundation projects
pnpm dev
```

The local console serves from `apps/console/public` on port `4310` by default.

```bash
PORT=4320 pnpm dev
```

## Repo setup

This folder is ready to become `fawxzzy/fawxzzy-foundation`.

```bash
git init
git add .
git commit -m "Bootstrap Fawxzzy Foundation"
gh repo create fawxzzy/fawxzzy-foundation --public --source=. --remote=origin --push
```

See [`docs/operations/GITHUB_SETUP.md`](docs/operations/GITHUB_SETUP.md) and [`docs/operations/VERCEL_SETUP.md`](docs/operations/VERCEL_SETUP.md).

## Operating contract

Foundation is intentionally boring at the start. The source of truth is JSON, docs are generated from that truth, and verification stays local-first.

When changing the registry:

```bash
pnpm build
pnpm verify:local
```

When adding a new project, update `data/projects.json`, run `pnpm build`, and commit the generated registry docs plus console data.
