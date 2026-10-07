# Frontend architecture

This project uses a pragmatic Clean Architecture. Dependencies point inward: UI and API
details depend on application contracts and domain types, never the reverse. Repository
interfaces are introduced only when a domain capability needs one; transport access uses a
small application-owned API client port.

## Layers

- **`src/core/`** contains domain entities, value objects, and domain-facing result models. It
  has no framework, browser, API, or infrastructure dependency.
- **`src/application/`** contains use-case classes and the ports they require. Use cases
  orchestrate domain behavior and expose application-facing results and errors.
- **`src/infrastructure/`** contains Axios and browser adapters, API DTOs/routes, and the
  dependency container. Adapters map transport data to application/domain types.
- **`src/presentation/`** contains React pages, components, providers, styles, and routing.
- **`src/common/`** contains truly layer-neutral utilities only. SPA routes belong to
  presentation and API configuration belongs to infrastructure.

The runtime flow is:

`React page/component -> injected use case -> application port -> infrastructure adapter -> API`

`main.tsx` is the composition root. It creates dependencies through
`infrastructure/di/container.ts` and passes them to `DependencyProvider`. Tests can replace
individual application contracts through typed provider overrides.

## Import guidance

Use the `@/` alias for imports from `src` (for example,
`@/application/usecases/report/search-report.usecase`). The existing `@presentation/` alias is
also retained because presentation files use it extensively. Prefer `@/` for new code so the
project converges on one general alias; do not add aliases for individual layers.

## Dependency direction

The allowed production dependency graph is:

- `core` -> core only;
- `application` -> core and application-owned ports/contracts;
- `infrastructure` -> application and core;
- `presentation` -> application, core, and presentation;
- `main.tsx` -> all layers because it is the composition root.

Presentation code accesses use cases through `useDependencies`. It must not import the
infrastructure container, HTTP client, API DTOs, or observability adapters. Application code
must not import infrastructure, presentation, Axios, React, or browser storage.

Wire DTOs, snake_case fields, API paths, environment variables, and HTTP error translation
belong to infrastructure. Expected failures cross into application/presentation as typed
application errors, not Axios-shaped values.

These boundaries are enforced in ESLint. Add a repository port only for a demonstrated domain
capability; do not add pass-through repository classes around the API client.
