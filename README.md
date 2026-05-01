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
- Structured per-project health and proof tracking in `data/projects.json`.

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

## Remote status

The canonical GitHub remote now exists at `fawxzzy/fawxzzy-foundation`.

Foundation is now `active control-plane`.

The current promotion proof is pinned to commit `abda5a586716d356f7c2bb1e670f5783f80b0fed`: GitHub Actions `Foundation CI` completed successfully for that push, and Vercel production deployment `dpl_8CbDvRtaeq7gxSbCAg94r7vWR8A2` is the durable active-control-plane proof on `fawxzzy-foundation.vercel.app`.

The latest observed production parity is tracked separately: deployment `dpl_YQ8Vcp5LbnfQzVX1qKZFSP2iDkad` is `READY` for commit `9fff053e264d4071f7e26503d5a4d382c3cf6285` (`Record Foundation display parity policy`) without changing the pinned promotion proof.

See [`docs/operations/GITHUB_SETUP.md`](docs/operations/GITHUB_SETUP.md) and [`docs/operations/VERCEL_SETUP.md`](docs/operations/VERCEL_SETUP.md) for the remaining remote and deployment handoff steps.

## Operating contract

Foundation is intentionally boring at the start. The source of truth is JSON, docs are generated from that truth, and verification stays local-first.

Each project now carries explicit `health.github`, `health.vercel`, `health.deployment`, and `health.proof` records so the registry and console can distinguish pinned promotion proof from the latest observed deployment state.

When changing the registry:

```bash
pnpm build
pnpm verify:local
```

When adding a new project, update `data/projects.json`, run `pnpm build`, and commit the generated registry docs plus console data.
