---
name: pagination
description: Implements and maintains server-driven React pagination using this project's Search page and Report Contactos tab patterns. Use when adding pagination, changing page navigation, synchronizing search pages with URL parameters, resetting pagination after filters, or working with paginated API results.
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

## Checklist

- Paginated use case accepts the requested page.
- Response exposes `data`, `page`, `total`, and `count`.
- Page state is corrected from the API response.
- New searches and filter changes reset to page 1.
- Invalid and redundant navigation is ignored.
- Previous/next disabled states and active-page accessibility are present.
- Loading, empty, cancellation, and stale-response states are handled.
