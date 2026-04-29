# GitHub Setup

## Planned repository

`fawxzzy/fawxzzy-foundation`

## Create and push

From the repository root:

```bash
git init
git add .
git commit -m "Bootstrap Fawxzzy Foundation"
gh repo create fawxzzy/fawxzzy-foundation --public --source=. --remote=origin --push
```

## Branch policy target

Start simple:

- default branch: `main`
- require CI once the first GitHub Actions run succeeds
- keep the initial repo public unless a privacy review says otherwise

## Initial CI

The included workflow runs:

```bash
pnpm verify:local
```

The workflow intentionally avoids dependency-heavy setup. Foundation should prove the registry and generated surfaces before it grows into a bigger application.

## After creation checklist

- Confirm the remote URL is `https://github.com/fawxzzy/fawxzzy-foundation`.
- Confirm GitHub Actions sees `.github/workflows/ci.yml`.
- Run the first CI check on `main`.
- Update `data/projects.json` so `foundation.repo.exists` becomes `true`.
- Run `pnpm build && pnpm verify:local` and commit the registry truth update.
