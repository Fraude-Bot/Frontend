---
description: Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.
applyTo: '**/*'
# applyTo: 'Describe when these instructions should be loaded by the agent based on task context' # when provided, instructions will automatically be added to the request context when the pattern matches an attached file
---

# Tech Stack

- Tailwind
- React SPA
- Vite
- TypeScript

# Architecture

The dependency rules and composition model are defined in `CLEAN_ARCHITECTURE.md`. The main
source folders are `core`, `application`, `infrastructure`, and `presentation`.

- `core` is framework- and transport-independent.
- `application` owns use cases and ports; it must not import infrastructure or presentation.
- `infrastructure` implements application ports and owns API DTOs, routes, and adapters.
- `presentation` uses application contracts through `useDependencies`; only `main.tsx` composes
  concrete infrastructure.

## Presentation Layer

The `presentation` layer is organized into:

- `assets`: Contains static assets such as images, fonts, and stylesheets for all components.
- `shared`: Contains reusable components, hooks, and utilities that can be used across the application.
- `pages`: Contains components that represent different pages or views in the application. Each page is organized into its own folder, which may contain subfolders for components, hooks, and styles specific to that page.

### Components

- Prefer regular function declarations for named components and readable stack traces. Function
  syntax does not by itself affect React render frequency.

- Keep small, component-specific prop types next to the component. Move types to `types.ts` only
  when multiple files in the feature share them.
- Prefer TypeScript `type` aliases for props.
