# DESIGN.md

Visual reference for the FraudeBot frontend as it exists today. This is not a tokenized design system: there is no `@theme` block, no CSS custom properties, and no shared `Button` / `Input` / `Modal` primitives. UI is Tailwind CSS v4 utilities written inline in React components.

Read this file before changing layout, color, typography, or shared presentation components. Prefer existing patterns over new visual values.

Product copy and chrome are in Spanish (`lang="es"`). Locale-sensitive dates use `es-MX`.

## Stack and source of truth

| Concern | Current state |
| --- | --- |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite`; `@import "tailwindcss"` in `src/index.css` |
| Theme config | None (`tailwind.config.*` does not exist) |
| Custom CSS | Font-face + body reset only (`src/index.css`). `src/presentation/App.css` is empty |
| Dark mode | Not used |
| UI library | None (no shadcn, Radix, or MUI). Custom React components |
| Typeface | Nunito, applied on `body` and often restated with `font-[Nunito]` |
| Language | Spanish UI; `index.html` sets `lang="es"` |

Presentation lives under `src/presentation/`:

- `shared/components/` — reusable chrome used across pages
- `pages/<page>/components/` — page-specific UI
- `assets/` — logo, hero images, Lottie files, report icons

## Product surfaces

Two visual contexts coexist. Keep them; do not unify orange and red unless a later design pass says so.

| Context | Pages | Accent | Typical focus ring |
| --- | --- | --- | --- |
| Marketing | Home, Contact, 404 | Orange | `outline-orange-600` / `outline-orange-700` |
| Investigation | Search, report/profile | Red | `outline-red-600` |

Header and footer are shared on every page and always use the marketing (orange) treatment, including on search and report pages.

## Color

Colors are Tailwind palette utilities plus a few arbitrary hex values. There is no named token layer.

### Neutrals

Used for most surfaces, type, and borders.

| Role | Typical classes / values |
| --- | --- |
| Page background | `bg-white` (search, report, 404); `bg-orange-50` (contact) |
| Heading text | `text-gray-900`, `text-gray-950`, `text-black` |
| Body text | `text-gray-600`, `text-gray-700`, `text-gray-800` |
| Muted / meta | `text-gray-400`, `text-gray-500` |
| Placeholder | `placeholder:text-gray-500` |
| Empty / loading message | `#6b7280` (`gray-500`) |
| Hairline borders | `border-gray-100`, `border-gray-200` |
| Stronger borders | `border-gray-300`, `border-gray-400` (search field) |
| Hover surface | `hover:bg-gray-50`, `hover:bg-gray-50/50` |
| Skeleton pulse | `bg-gray-100`, `bg-gray-200` |
| Tab track | `bg-gray-100`; active tab `bg-gray-950 text-white` |
| Chart bars | `#111827` (`gray-900`) |
| Chart ticks | `#4b5563` (`gray-600`) |

### Brand orange (marketing)

| Role | Typical classes / values |
| --- | --- |
| Page wash | `bg-orange-50` |
| Soft border | `border-orange-100` |
| Nav hover | `hover:text-orange-700`, `hover:bg-orange-50` |
| Primary CTA | `bg-orange-700 hover:bg-orange-800 text-white` |
| Eyebrow label | `text-orange-700` |
| Footer “Próximamente” | `text-orange-300` |
| Feature primary (custom) | `#c95f28` / hover `#a94c1e` |
| Feature secondary text | `#9a451d` with `border-[#c95f28]` |

`orange-700` and `#c95f28` are both in use. Match the nearest existing control rather than introducing a third orange.

### Investigation red

| Role | Typical classes / values |
| --- | --- |
| Primary CTA | `bg-red-600 hover:bg-red-700 text-white` |
| Active pagination | `border-red-600 bg-red-600 text-white` |
| Report count badge | `bg-red-600 text-white` |
| Error panel | `border-red-200 bg-red-50`, heading `text-red-900` / `text-red-950`, body `text-red-800` |
| Danger value | `text-red-600` (`SummaryItem` tone) |
| Map “Estás aquí” | `text-red-600` |
| Hero background | `hero-red.webp` photograph, not a solid fill |

### Other accents already in the UI

These are real, not leftovers to ignore:

| Role | Value |
| --- | --- |
| Footer background | `#242b35` |
| Footer body text | `text-gray-200`; headings `text-gray-300`; links `text-white` |
| Default `DropdownButton` | `bg-sky-500 hover:bg-sky-600` |
| Support mailto link | `text-sky-400 hover:text-sky-500` |
| Selected platform chip | `border-blue-500 bg-blue-500 text-white` |
| Status “Activo” | `bg-amber-100 text-amber-800` |
| Status “Inactivo” | `bg-slate-100 text-slate-600` |
| Lightbox overlay | `bg-black/80` |
| Resource tile overlay | `bg-gray-900` image at `opacity-60`, badge `bg-black/70` |

Do not add new hue families (green success, purple, etc.) for product chrome. Platform brand colors on icons are an exception.

### Platform icon colors

Hardcoded in `src/presentation/pages/report/components/PlatformIcon.tsx`. Keep official brand colors for those glyphs.

| Platform | Color |
| --- | --- |
| Facebook | `#1877F2` |
| WhatsApp | `#25D366` |
| Telegram | `#26A5E4` |
| YouTube | `#FF0000` |
| TikTok | `#000000` |
| Email | `#EA4335` |
| Cellphone | `#111827` |
| Webpage / URL | `#2563EB` |
| Other | `#6B7280` |
| Instagram | Gradient `#F58529` → `#DD2A7B` → `#8134AF` |

## Typography

- **Family:** `"Nunito", ui-sans-serif, system-ui, sans-serif`
- **Loading:** `@font-face` in `src/index.css` with `font-weight: 200 900`, `font-display: swap`, local sources (`Nunito Variable`, `Nunito`, `Arial`)
- **UI language:** Spanish. Headings, buttons, empty states, and errors are sentence- or title-cased in Spanish, not English.

### Scale in use

| Role | Typical classes |
| --- | --- |
| Hero / marketing title | `text-3xl sm:text-4xl`; home search title mixes `font-medium` with `font-bold` emphasis |
| Page title | `text-2xl font-extrabold` or `text-3xl/4xl font-black` |
| Section title | `text-xl font-extrabold text-gray-900` or `text-3xl font-semibold/bold` |
| Body | `text-base` or `text-lg leading-relaxed` / `leading-6` / `leading-7` |
| Card title | `text-lg font-bold` (search cards) or `text-sm font-bold` / `font-extrabold` (report list cards) |
| Meta / helper | `text-sm`, `text-xs` |
| Eyebrow / kicker | `text-sm font-extrabold uppercase tracking-[0.18em]` |
| Label over value | `text-xs font-bold uppercase tracking-wide text-gray-400` |
| Tiny badge count | `text-[10px]` |
| Empty / loading | `text-2xl text-[#6b7280]` |

Weights already used: `font-light`, `font-medium`, `font-semibold`, `font-bold`, `font-extrabold`, `font-black`.

## Layout

| Pattern | Values |
| --- | --- |
| Header width | `max-w-6xl`, `h-20`, `px-4 sm:px-8` |
| Header placement | `absolute left-0 right-0 top-0 z-40`; content offsets with `pt-28` / `pt-32` / `mt-28` |
| Home / footer content | `max-w-6xl` |
| Home search card | `max-w-4xl` |
| Search form | `max-w-3xl` |
| Contact card | `max-w-2xl` |
| Report hero + tabs + panels | `max-w-5xl` |
| Search result card | `max-w-200` |
| Review card | `max-w-100` |
| Horizontal page padding | `px-4`, `px-6`, `px-8` |
| Section vertical rhythm | `py-12`, `py-16`; report panels `px-6 py-6 sm:px-8 sm:py-8` |
| Common gaps | `gap-1` … `gap-4`, `gap-8`, `gap-9`, `gap-10`, `gap-12` |
| Breakpoints | Default Tailwind `sm`, `md`, `lg` |

Pages are a vertical stack: **Header → main → Footer**. Header is overlayed, so the first main block must include top padding so content clears the 5rem bar.

## Shape, elevation, motion

| Token | In use |
| --- | --- |
| Radius | `rounded-sm` (search cards, resource tiles, pagination), `rounded` / `rounded-md` (most controls), `rounded-lg` (marketing CTAs, 404 art frame), `rounded-xl` (home search card, empty profile), `rounded-2xl` (contact card, review cards, report hero, avatars), `rounded-full` (coming-soon pill, avatars) |
| Shadow | `shadow-sm` (header, cards, pagination), `shadow-lg` (home search, reviews, dropdown), `shadow-xl` (report hero), `shadow-md` on search-card hover |
| Overlay | Lightbox `bg-black/80`; resource tiles `opacity-60` image + `bg-black/70` pill |
| Motion | Color/shadow `transition-colors` or `transition-all duration-200 ease-in-out`; skeletons `animate-pulse` / `motion-safe:animate-pulse` |
| Report tabs | No rounding on the tab strip |

## Components

Reuse these before adding new ones. New shared UI belongs in `src/presentation/shared/components/`. Page-only UI stays under the page folder.

### Shared (`src/presentation/shared/components/`)

| Component | Role |
| --- | --- |
| `Header` | Fixed-width white bar, logo, Inicio / Búsqueda / Contacto. Desktop `gap-8` links; mobile hamburger (`min-h-11 min-w-11`) with `border-gray-300`. Orange focus and hover. |
| `Footer` | Full-bleed `#242b35`, three columns (logo + quote, navegación, en desarrollo). Underlined white links. White focus ring. |
| `SearchInput` | Composite text field + **Buscar**. `accent="orange"` (default, home) or `"red"` (search). Border `border-gray-400`, `rounded-md`, stacks on small screens. |
| `PaginationNav` | Anterior / pages / Siguiente. White buttons, active page red. Hidden when `totalPages < 1`. |
| `DropdownButton` | Menu button; default sky fill, overridable `className`. Menu: `rounded-md border-gray-100 bg-white shadow-lg`. Escape and outside click close it. |
| `ErrorBoundary` | Full-screen gray-50 fallback, red **Actualizar página**. |
| `LottieAnimation` | Wrapper for `.lottie` assets. |

There is **no** shared Button, Input, Badge, Card, Modal, or icon set. Those patterns are duplicated in page components.

### Page-level patterns to copy

| Pattern | Where | Notes |
| --- | --- | --- |
| Hero on photograph | Home (`hero.webp`), reviews (`hero-alternative.webp`), report (`hero-red.webp`) | `bg-cover bg-center`; white card over the image |
| Coming-soon resource tiles | Home `AnchorBlocks` | 12rem squares, white title, “Próximamente” pill |
| Feature split | Home `FeatureBlock` | Image + copy, optional reverse row, custom orange buttons |
| Review cards | Home `Reviews` | White `rounded-2xl` cards, circular 3rem avatar |
| Search result card | `ReportCard` | White, `rounded-sm`, hover lift; inline SVG person/company icons |
| Profile hero | `ReportHero` | White `rounded-2xl` card, 7–8rem `rounded-2xl` photo, summary grid |
| Profile tabs | `ReportTabNavigation` | `role="tablist"`, arrow-key roving tabindex, active `bg-gray-950` |
| Profile panels | General / Support | White, `border-gray-200`, `divide-y` / `lg:divide-x`, hover `bg-gray-50` |
| List row card | `ContactCard`, `PartyReportCard` | `rounded-md border-gray-200 px-4 py-3 hover:bg-gray-50` |
| Platform chips | `PlatformFilterRow` | Unselected white + gray border; selected blue fill |
| Lightbox | `ImageLightbox` | `role="dialog"`, Escape, restore focus, lock body scroll |
| Map nodes | `MapPartyNode`, `MapSatelliteNode` | `w-52 rounded-md border-gray-200 bg-white shadow-sm`; current party uses `border-gray-950` |
| Chart | `MonthlyReportsChart` | Chart.js bars `#111827`, Nunito ticks, `sr-only` data table |
| Empty / loading illustration | Search `NotFound` / `Loader`, page `404` | 16rem frame `bg-gray-50 rounded-lg` + Lottie + gray-500 message |
| Skeleton | Report hero + general panels | Gray bars, `rounded`, pulse |

## Buttons

Copy the closest existing variant. Do not introduce a new radius/padding combo for the same action type.

| Variant | Classes (representative) | Used on |
| --- | --- | --- |
| Marketing primary | `rounded-lg bg-orange-700 px-6 py-3 font-bold text-white hover:bg-orange-800` | Contact, 404 |
| Marketing secondary | `rounded-lg border border-gray-300 px-6 py-3 font-bold text-gray-800 hover:bg-gray-50` | Contact, 404 |
| Feature primary | `rounded px-6 py-2.5 font-medium shadow-sm bg-[#c95f28] hover:bg-[#a94c1e] text-white` | Home features |
| Feature secondary | `bg-white border border-[#c95f28] text-[#9a451d] hover:bg-orange-50` | Home features |
| Investigation primary | `rounded-md bg-red-600 px-5 py-2 text-sm font-extrabold text-white hover:bg-red-700` | Report hero, errors, profile missing |
| Investigation secondary / disabled | `rounded-md border border-gray-300 px-5 py-2 text-sm font-extrabold text-gray-500` | “Ayuda (próximamente)” |
| Search submit | `px-8 py-4 text-lg font-bold text-white` + orange-700 or red-600 | `SearchInput` |
| Pagination | `px-3 py-2 text-sm font-semibold border rounded-sm shadow-sm` | `PaginationNav` |
| Icon / chevron | `inline-flex h-8 w-8 items-center justify-center rounded-md border border-gray-200` | Platform filter |
| Disabled coming-soon | `cursor-not-allowed border border-gray-300 bg-gray-100 text-gray-500` | Home features |
| Dropdown default | `rounded-md bg-sky-500 px-4 py-2 text-xs font-extrabold text-white hover:bg-sky-600` | Report share |

Disabled controls keep visible text (`próximamente`) rather than being omitted.

## Forms and inputs

- Search is the only production form. Placeholder: `Número de cuenta, tarjeta, teléfono o URL`.
- Composite field: white fill, `border-gray-400`, `rounded-md`, `focus-within:outline-2 focus-within:outline-offset-2` in the page accent.
- Standalone text inside the composite: `px-4 py-4 text-lg text-gray-900 outline-none`.
- Visible `<label>` on home; `sr-only` label on the search page (the page has an `sr-only` `h1`).
- Year selector and other native controls in report General follow nearby gray borders; do not restyle them as a new component.

## Cards, badges, tabs

**Cards** are white with gray borders. Search cards are `rounded-sm` and whole-card links. Report list cards are `rounded-md`. Marketing cards are more rounded (`rounded-xl` / `rounded-2xl`) and more shadowed.

**Status badges** (search cards):

- Activo: `bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-1 rounded` plus warning icon
- Inactivo: `bg-slate-100 text-slate-600` plus clock icon

**Report count:** red pill with a nested white-bordered number.

**Tabs:** gray track, active almost-black, inactive `text-gray-600 hover:bg-gray-200`. Icons invert to white when selected (`brightness-0 invert`).

## Icons and media

- Logo: `fraudebot-logo.webp` in the header (`h-12 sm:h-14`) and footer (`rounded-2xl`).
- Favicons and apple-touch icon live under `src/presentation/assets/`.
- Report chrome icons: raster files via `pages/report/components/icons`.
- Platform and many list icons: inline SVG in the component file. There is no shared icon package.
- Decorative Lottie: `404.lottie`, `not-found.lottie`, `robot.lottie`.
- Default profile photo: `default-avatar.png`.
- Hero photographs are full-bleed background images, not CSS gradients.

## Accessibility (current conventions)

Follow these when adding UI; they are already used in production components.

- Visible `focus-visible` rings (`outline-2`, usually `outline-offset-4`; tighter offset inside dense chrome).
- Marketing focus: orange. Investigation focus: red. Footer links: white. Support email: sky.
- Header mobile toggle meets `min-h-11 min-w-11`.
- Dialogs (`ImageLightbox`) use `role="dialog"`, Escape to close, focus restore, `aria-modal`.
- Tabs use `role="tablist"` / `tab` / `tabpanel`, `aria-selected`, and arrow / Home / End keys.
- Pagination uses `aria-current="page"` and an `aria-label` on the nav.
- Loading and empty search results use `role="status"`; errors use `role="alert"`.
- Chart data is mirrored in an `sr-only` table.
- Decorative images use `alt=""` and `aria-hidden` as appropriate.
- External links use `rel="noopener noreferrer"` when `target="_blank"`.

## Copy and empty states

- Coming-soon features stay visible and disabled or labeled **Próximamente**; they are not hidden.
- Errors tell the user to retry and provide a **Reintentar** / **Actualizar página** action.
- Missing profile: gray panel, **Volver a la búsqueda**.
- Failed search: red panel. Failed profile load: red panel.
- Zero search results: Lottie + “No se encontraron resultados”.
- Search before submit: “Ingresa un dato para consultar reportes de la comunidad.”

## Do

- Match the page context: orange on marketing pages, red on search/report actions.
- Reuse `Header`, `Footer`, `SearchInput`, `PaginationNav`, `DropdownButton`, `ImageLightbox`, and `PlatformIcon` instead of restyling from scratch.
- Keep Nunito, Spanish copy, and the existing type scale.
- Keep white content cards on photographic heroes.
- Prefer Tailwind utilities already used nearby over arbitrary new hex values.
- Preserve `focus-visible` rings and existing ARIA roles.

## Don’t

- Do not invent CSS variables, a Tailwind `@theme`, or a component library in passing UI work. Document-only file first; tokenization is a separate change.
- Do not introduce dark mode.
- Do not replace Nunito or mix in a second display font.
- Do not use red CTAs on home/contact/404, or orange primary actions on search/report bodies (header/footer remain orange everywhere).
- Do not add a third primary brand color.
- Do not build new buttons, inputs, or modals as one-off styles when a page already has a close variant.
- Do not drop accessibility attributes from the components that already have them.

## Known inconsistencies (document, don’t “fix” silently)

These are part of the current product. Change them only with an explicit design pass.

1. Two oranges for primary actions: Tailwind `orange-700` vs hex `#c95f28`.
2. Share dropdown defaults to sky, not red or orange.
3. Platform filter selection is blue, not red.
4. Support mailto is sky, not orange or red.
5. `font-[Nunito]` is repeated on many nodes even though `body` already sets it.
6. Border radius is inconsistent across similar cards (`rounded-sm` vs `rounded-md` vs `rounded-2xl`).
7. Search `accent` exists, but pagination is always red.
8. No shared primitives, so the same button is re-specified in several files.

When in doubt, copy the closest screen in `src/presentation/pages/` rather than averaging these values into a new one.
