# Privacy Remediation Tracking

## Purpose

Privacy remediation tracking is the Foundation lane for following Fitness privacy and security findings without mutating Supabase or the Fitness repo.

Foundation tracks Fitness privacy remediation; it does not mutate Supabase or Fitness.

## Operator workflow

1. Capture reviewed Supabase advisor evidence or inventory output.
2. Render a privacy remediation tracker in Foundation.
3. Review the tracked findings, owners, and next actions.
4. If registry wording should change, render a registry change bundle.
5. Approve the bundle before editing `data/projects.json` manually.
6. Route actual fixes into the Fitness owner repo or Supabase operator lane.
7. Run `pnpm build`.
8. Run `pnpm verify:local`.
9. Commit generated surfaces.

Canonical flow:

```text
Supabase advisor evidence -> remediation tracker -> registry change bundle -> approved owner-repo/Supabase action
```

## Commands

Render the tracker from an input file:

```bash
pnpm privacy:remediation:track --input fixtures/privacy-remediation-tracker.example.json
```

Or through the operator CLI:

```bash
pnpm foundation privacy remediation track --input fixtures/privacy-remediation-tracker.example.json
```

Runtime outputs:

- `.foundation/privacy-remediation-tracker.json`
- `.foundation/privacy-remediation-tracker.md`

Both files are runtime-only and must remain untracked.

## Contract

- Tracker schema: `packages/contracts/privacy-remediation-tracker.schema.json`
- Safe example: `fixtures/privacy-remediation-tracker.example.json`

## Represented evidence

- finding class
- severity
- affected surfaces, tables, or functions
- owner repo
- remediation status
- proposed next action
- risk if ignored
- evidence reference
- whether Fitness or Supabase action is required

## Rules

- Foundation tracks Fitness privacy remediation; it does not mutate Supabase or Fitness.
- Remediation trackers remain proposal-only with `mutationAuthority: none`.
- Use registry change bundles before changing Fitness health wording or scorecard guidance.
- Keep privacy claim posture conservative until reviewed remediation proof exists.

## Failure mode

Marking privacy posture as proved before remediation evidence exists creates false trust.

## Non-goals

- No Supabase DDL
- No Supabase auth, RLS, or storage changes
- No Fitness source edits
- No automatic registry mutation
- No hidden provider writes
