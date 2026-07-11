# Contributing

## Branch workflow

Start from an updated `main` and create one short branch per coherent task, for example `feat/cart`, `fix/inventory-validation` or `chore/project-setup`. Do not combine unrelated features.

## Commits

Use Conventional Commits in English:

```text
<type>(<scope>): <imperative description>
```

Allowed types are `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `perf`, `style`, `build`, `ci` and `revert`. Keep commits atomic and include relevant tests.

## Required verification

Before closing a unit of work, run the checks proportional to the change:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Review `git diff`, staged files and possible secrets before committing.

## Pull requests

Explain context, changes, technical decisions, tests, database changes, environment variables, risks and manual steps. Keep the pull request focused and attach screenshots for visual work. Do not merge with failing relevant checks.

## Migrations

Generate Drizzle migrations from the versioned schema. Review SQL and data-loss risk, add integration coverage, and document rollout requirements. Never edit production manually or apply a production migration without explicit approval.

## Dependencies

Prefer platform and existing project capabilities. For every new package, verify maintenance, compatibility, bundle impact and security; install an exact compatible version with pnpm and commit the lockfile. Avoid unrelated upgrades.
