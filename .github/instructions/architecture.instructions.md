---
description: Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.
applyTo: '**/*'
---

# Authoritative architecture

Full dependency rules, ports, DTO ownership, ESLint boundaries, and verification live in the Cursor rules (source of truth for this repo):

- `.cursor/rules/clean-architecture.mdc` — layers, import direction, composition root
- `.cursor/rules/presentation-structure.mdc` — `pages/` vs `shared/` placement
- `.cursor/rules/architecture-verification.mdc` — tests and `npm run quality` before handoff

Keep this file aligned when those rules change.

# Tech Stack

- Tailwind
- React SPA
- Vite
- TypeScript

# Architecture

The main source folders are `core`, `application`, `infrastructure`, and `presentation`.

- `core` is framework- and transport-independent.
- `application` owns use cases and ports; it must not import infrastructure or presentation.
- `infrastructure` implements application ports and owns API DTOs, routes, and adapters.
- `presentation` uses application contracts through `useDependencies`; only `main.tsx` composes
  concrete infrastructure. It must not import `@/infrastructure/**` (ESLint enforced).

Wire DTOs, snake_case API fields, routes, env vars, and HTTP error mapping belong in
infrastructure. Expected failures surface as typed application errors, not Axios-shaped values.

## Presentation Layer

The `presentation` layer is organized into:

- `assets`: static assets for the UI.
- `shared`: reusable components, hooks, and utilities across pages.
- `pages`: one folder per route/view; page-specific components stay there until a second page
  imports them — then move the module to `shared/` (see `presentation-structure.mdc`).

### Components

- Prefer regular function declarations for named components and readable stack traces.

- Keep small, component-specific prop types next to the component. Move types to `types.ts` only
  when multiple files in the feature share them.
- Prefer TypeScript `type` aliases for props.

# Verification

Before handoff, run:

```bash
npm run quality
npm run typecheck
```

CI runs `quality` on every push; agents should also run `typecheck` before handoff.
