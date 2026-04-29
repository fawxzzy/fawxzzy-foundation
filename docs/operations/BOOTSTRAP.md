# Bootstrap Runbook

## Goal

Turn this local scaffold into the first committed Foundation repository.

## Local verification

```bash
corepack enable
pnpm build
pnpm verify:local
pnpm foundation status
```

Expected result:

- registry docs are generated,
- console data is generated,
- `.foundation/verify.json` is written locally,
- no required-file or registry invariant errors remain.

## First commit

```bash
git init
git add .
git commit -m "Bootstrap Fawxzzy Foundation"
```

## First remote push

```bash
gh repo create fawxzzy/fawxzzy-foundation --public --source=. --remote=origin --push
```

## First Vercel link

```bash
vercel link --yes --project fawxzzy-foundation --scope fawxzzy
vercel deploy
```

## After remote exists

Update `data/projects.json`:

- set `foundation.repo.exists` to `true`,
- set `foundation.vercel.exists` to `true` if Vercel was linked,
- run `pnpm build && pnpm verify:local`,
- commit the registry update.
