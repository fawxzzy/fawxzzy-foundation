# Foundation Operating Doctrine

Foundation is the coordination layer for the Fawxzzy stack.

It exists to answer four questions quickly:

1. What projects exist?
2. Which repo, deployment, and runtime owns each project?
3. What contracts and verification gates protect each project?
4. What is the next responsible action?

## Principles

### Registry before memory

Project truth belongs in `data/projects.json`, not in chat memory, screenshots, or one-off notes.

### Brief-thin human surfaces

Human-facing output should lead with status, decision, next action, and blockers. Machine-heavy state should live in JSON artifacts.

### Private-first runtime artifacts

Generated runtime state belongs under `.foundation/` and should not be committed unless deliberately promoted to a contract or example.

### One stack family, many repo shapes

The Fawxzzy stack can include docs repos, apps, CLIs, games, content systems, and runtime tools. Foundation maps those shapes without forcing every project into the same implementation.

### Governance is a product surface

Verification commands, AI contracts, deployment receipts, and registry checks are user-facing product features, not internal paperwork.

## Initial layers

| Layer | Path | Responsibility |
| --- | --- | --- |
| Registry | `data/projects.json` | Project inventory and known ownership |
| Config | `foundation.config.json` | Foundation-level operating contract |
| Contracts | `packages/contracts/` | Machine-readable schema and shape docs |
| CLI | `packages/cli/` | Dependency-free operator commands |
| Console | `apps/console/public/` | Static project dashboard |
| Docs | `docs/` | Human-readable blueprint and setup |
| Runtime | `.foundation/` | Local generated receipts and verification results |

## First milestone

The first milestone is not a huge app. It is a trustworthy root:

- a real repository,
- a committed bootstrap,
- a deterministic registry,
- a local verification gate,
- a deployable static console,
- and a clear path for Playbook/Lifeline integration.
