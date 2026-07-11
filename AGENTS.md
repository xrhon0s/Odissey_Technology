<!-- BEGIN:nextjs-agent-rules -->

# Next.js version notice

This project may use Next.js APIs and conventions newer than an agent's training data. Read the relevant guide in `node_modules/next/dist/docs/` before implementing framework-specific behavior and heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Repository rules

## Product and architecture

- Build a Colombian, Spanish-first ecommerce with prices in COP.
- Keep a single Next.js modular monolith. Organize business logic under `src/features` by domain.
- Use Server Components by default and isolate client interactivity.
- Do not introduce out-of-scope systems such as microservices, Redis, GraphQL, queues, multi-vendor, multibodega or multimoneda without explicit approval.

## Code conventions

- Keep TypeScript strict; do not use `any` or unsafe casts to suppress errors.
- Validate untrusted input with Zod at system boundaries and validate all commercial data again on the server.
- Use kebab-case filenames, PascalCase components, camelCase functions and snake_case database identifiers.
- Keep business rules outside visual components. Avoid generic dumping grounds in `lib`, `utils` or `components`.
- Meet semantic HTML, keyboard, focus, contrast and alternative-text requirements.

## Commerce and data safety

- Store money as precise integer minor units or an exact database numeric type, never floats.
- Track inventory per variant and create an auditable movement for every change.
- Persist historical item and delivery-address snapshots on orders.
- Keep order fulfillment and payment states separate.
- Calculate totals server-side. Wompi webhooks must be verified, recorded and idempotent.
- Enforce administrative authorization on the server for every protected read and mutation.
- Never log, expose or commit secrets. Stop and report any discovered credential.

## Commands and verification

Use pnpm exclusively:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Add unit tests for pure business rules, integration tests for transactional and authorization boundaries, and Playwright coverage for critical user journeys. Do not report completion while relevant checks fail.

## Database

- Maintain PostgreSQL schema and reproducible migrations with Drizzle.
- Use constraints, indexes and transactions where operations are dependent.
- Review migrations for data loss before generation or execution.
- Never apply production migrations or destructive data operations without explicit authorization.

## Git

- Inspect status, branch and existing diffs before editing. Preserve unrelated user work.
- Work on short task branches, never directly on `main` unless explicitly requested.
- Use atomic Conventional Commits in English and imperative mood.
- Review the diff, staged files, checks and possible secrets before every commit.
- Never push, merge, rebase shared branches, publish releases or deploy without explicit authorization.
