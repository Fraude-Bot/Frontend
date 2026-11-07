---
name: pagination
description: Implements and maintains server-driven React pagination and the shared paginated list-row card layout (ContactCard, PaymentMethodCard, PartyReportCard, AssociationCard). Use when adding pagination, new report-tab lists, changing page navigation, synchronizing search pages with URL parameters, resetting pagination after filters, or working with paginated API results.
---

# Frontend Pagination

Follow the established pagination patterns in:

- `src/presentation/pages/search/Search.tsx`
- `src/presentation/pages/report/components/ContactsTab.tsx` (rendered by the Contactos section in `Report.tsx`)
- `src/presentation/shared/utils/search-pagination.util.ts`

## Data model

Treat the API response as the source of truth. Store:

- `currentPage` from `result.page`
- `totalResults` from `result.total`
- `pageSize` from `result.count`
- the current page's entities from `result.data`

Derive the page count instead of storing it:

```ts
const totalPages = pageSize > 0 ? Math.ceil(totalResults / pageSize) : 0;
```

Do not infer the page count from `data.length`; the last page can contain fewer records.

## Page navigation

Validate every requested page before fetching or updating state:

```ts
if (page < 1 || page > totalPages || page === currentPage) {
  return;
}
```

Use `getVisiblePages(currentPage, totalPages)` from
`search-pagination.util.ts`. It keeps the first page, previous/current/next
pages, and last page. Insert `...` whenever adjacent visible values differ by
more than one.

Render:

- Anterior, disabled on page 1
- visible numbered pages
- Siguiente, disabled on the last page
- `aria-current="page"` on the selected page
- a descriptive `aria-label` on the pagination `<nav>`

Hide pagination while loading. On result lists, render it only when it is
useful; Search requires more than one page, while Contactos lets its pagination
component return `null` when there are no pages.

## Search page

Search pagination is URL-addressable:

1. Initialize the page with `getValidPage()` from `p` or the legacy `page`
   query parameter.
2. Pass the requested page to the search use case.
3. After a successful response, update state and the URL using the page returned
   by the API.
4. Include both normalized query and page in cache lookups.
5. Reset to page 1 when the query changes or a new search is submitted.

Keep stale requests from clearing a newer request's loading state. Use the
existing request ID guard and ignore cancellation errors.

## Report Contactos tab

Contact pagination is local to `ContactsTab`; it does not update the browser
URL. Include `currentPage` and `platform` in the data-loading effect
dependencies and pass both to `findContactsByPartyUseCase.execute`.

Changing the platform filter must reset `currentPage` to 1. Guard asynchronous
state updates after effect cleanup with the existing `ignore` flag, and ignore
cancellation errors.

Keep the pagination UI in a small component receiving only:

```ts
currentPage: number;
totalPages: number;
onPageChange: (page: number) => void;
```

## Paginated list row cards

Profile tabs that paginate entities (Contactos, Métodos de pago, Reportes,
Colaboradores/Empresas, etc.) render **one card per row** inside a scrollable
list, then `PaginationNav` below. Match the layout already used in:

- `src/presentation/pages/report/components/ContactCard.tsx`
- `src/presentation/pages/report/components/PaymentMethodCard.tsx`
- `src/presentation/shared/components/PartyReportCard.tsx`
- `src/presentation/pages/report/components/AssociationCard.tsx` (same two-row
  rhythm; optional uppercase kind label on row 1)

Do not introduce a third card layout for paginated report-tab lists. Reuse an
existing card or extend it with props; copy structure and Tailwind classes from
the references above.

### List container (inside the tab section)

```tsx
<div className="mt-6 max-h-[30rem] space-y-3 overflow-y-scroll pr-1">
  {items.map((item) => (
    <SomeCard key={item.id} … />
  ))}
</div>
```

Mirror `ContactsTab`, `ReportsTab`, `PaymentMethodsTab`, and `AssociationsTab`.

### Card shell

- Wrap each row in `<article>`.
- Interactive surface: `<a>`, `<Link>`, or `<button type="button">` with
  `className` including at least:
  `block w-full cursor-pointer rounded-md border border-gray-200 px-4 py-3
  text-left hover:bg-gray-50` (payment copy cards may add copy-state borders;
  keep the same padding and radius).
- Use `min-w-0` + `truncate` on primary text; set `title` when truncation is
  likely.

### Two-row content (required)

**Row 1 — header** (`flex items-start justify-between gap-3`):

- Leading cluster: optional icon (platform/payment) + title (`h3`, `text-sm
  font-bold` or `font-extrabold`, `text-gray-900`), **or** for associations an
  uppercase kind label (`text-xs font-bold uppercase tracking-wide
  text-gray-500`) with name on row 2 instead.
- Trailing affordance when navigation applies: external-link icon (`aria-hidden`
  on decorative icons). Payment cards use a copy feedback badge in this corner
  instead when copying.

**Row 2 — detail + date** (always this wrapper):

```tsx
<div className="mt-3 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
  {/* left: secondary value — icon + truncate */}
  {/* right: CalendarIcon + <time dateTime={…}> */}
</div>
```

- Left: secondary field (URL, account reference, description, or primary name
  when row 1 is only a kind label). Pair with a small gray icon when it helps
  (link, copy, etc.).
- Right: calendar icon (`h-4 w-4 shrink-0 text-gray-400`) +
  `formatContactDate(createdAt)` inside `<time dateTime={iso}>`.
- On small viewports the row stacks (`flex-col`); from `sm:` onward, detail and
  date sit on one line (`justify-between`).

### Dates and entities

- Format every list date with `formatContactDate` from
  `contact-date.util.ts`.
- If the API exposes `created_at`, map it on the entity (see `PartyReportEntity`
  + `public-api.adapter.ts`) so cards can show the calendar row consistently.

### When adding a new paginated tab

1. Implement the tab fetch/pagination like `ContactsTab` (this skill’s earlier
   sections).
2. Render rows with an existing card component or the same two-row markup.
3. Place `PaginationNav` only when `!isLoading && !errorMessage` (and when
   `totalPages >= 1` per component rules).
4. Before shipping, compare the new UI side-by-side with Contactos and Reportes
   in the browser; row structure and spacing should match.

## Checklist

- Paginated use case accepts the requested page.
- Response exposes `data`, `page`, `total`, and `count`.
- Page state is corrected from the API response.
- New searches and filter changes reset to page 1.
- Invalid and redundant navigation is ignored.
- Previous/next disabled states and active-page accessibility are present.
- Loading, empty, cancellation, and stale-response states are handled.
- Paginated lists use `max-h-[30rem] space-y-3 overflow-y-scroll pr-1` and row
  cards that follow the two-row ContactCard / PaymentMethodCard /
  PartyReportCard layout (detail left, calendar date right on `sm+`).
