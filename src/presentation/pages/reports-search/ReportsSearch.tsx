import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { reportDetailPath } from "@/common/app-routes";
import Footer from "@presentation/shared/components/Footer";
import Header from "@presentation/shared/components/Header";
import SearchContainer from "@presentation/pages/search/components/SearchContainer";
import NotFound from "@/presentation/pages/search/components/NotFound";
import Formatter from "@/presentation/shared/utils/formatter";
import { getValidPage } from "@/presentation/shared/utils/search-pagination.util";
import PaginationNav from "@/presentation/shared/components/PaginationNav";
import ReportTextSearchForm from "@/presentation/pages/reports-search/components/ReportTextSearchForm";
import { MOCK_TEXT_REPORT_HITS } from "@/presentation/pages/reports-search/mock-reports";

/** When the user has submitted a real query, paginate one hit per page (like /busqueda demos). */
const SEARCH_PAGE_SIZE = 1;
/** Sample / browse mode shows every mock card on one page. */
const BROWSE_PAGE_SIZE = MOCK_TEXT_REPORT_HITS.length;

function ReportsSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const formattedUrlQuery = Formatter.FormatInput(urlQuery);
  const [query, setQuery] = useState(formattedUrlQuery);
  const [syncedUrlQuery, setSyncedUrlQuery] = useState(urlQuery);

  if (urlQuery !== syncedUrlQuery) {
    setSyncedUrlQuery(urlQuery);
    setQuery(formattedUrlQuery);
  }

  const requestedPage = getValidPage(
    searchParams.get("p") || searchParams.get("page"),
  );
  const hasSubmittedSearch = urlQuery.trim().length > 0;
  const normalizedQuery = Formatter.toSearchQuery(formattedUrlQuery);
  const filterActive = hasSubmittedSearch && normalizedQuery.length > 0;

  const matches = useMemo(() => {
    if (!filterActive) {
      return MOCK_TEXT_REPORT_HITS;
    }

    const q = normalizedQuery.toLowerCase();
    return MOCK_TEXT_REPORT_HITS.filter((hit) => {
      const haystack = `${hit.title} ${hit.snippet}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [filterActive, normalizedQuery]);

  const pageSize = filterActive ? SEARCH_PAGE_SIZE : BROWSE_PAGE_SIZE;
  const totalResults = matches.length;
  const totalPages =
    pageSize > 0 ? Math.ceil(totalResults / pageSize) : 0;
  const currentPage =
    totalPages > 0 ? Math.min(requestedPage, totalPages) : 1;

  useEffect(() => {
    if (
      filterActive &&
      normalizedQuery &&
      totalPages > 0 &&
      requestedPage !== currentPage
    ) {
      setSearchParams(
        `?${Formatter.buildSearchQueryString(urlQuery, currentPage)}`,
        { replace: true },
      );
    }
  }, [
    currentPage,
    filterActive,
    normalizedQuery,
    requestedPage,
    setSearchParams,
    totalPages,
    urlQuery,
  ]);
  const pageOffset = (currentPage - 1) * pageSize;
  const pageResults = matches.slice(pageOffset, pageOffset + pageSize);

  const handleInputChange = (event: React.InputEvent<HTMLInputElement>) => {
    setQuery(Formatter.FormatInput(event.currentTarget.value));
  };

  const handleSubmit = () => {
    const formatted = Formatter.FormatInput(query);
    const nextSearch = formatted.trim()
      ? `?${Formatter.buildSearchQueryString(formatted, 1)}`
      : "";

    setSearchParams(nextSearch);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setSearchParams(`?${Formatter.buildSearchQueryString(urlQuery, page)}`);
  };

  return (
    <>
      <title>FraudeBot - Búsqueda de reportes</title>

      <Header />

      <SearchContainer>
        {/* mt-28 clears the fixed header (h-20); matches /busqueda form offset */}
        <h1 className="mb-8 mt-28 px-4 text-center font-[Nunito] text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Búsqueda de reportes
        </h1>

        <ReportTextSearchForm
          query={query}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />

        {!filterActive && (
          <p className="mb-6 max-w-3xl px-4 text-center text-sm font-[Nunito] text-gray-500">
            Ejemplos de resultados. Usa el buscador para filtrar por palabras
            clave.
          </p>
        )}

        {pageResults.length > 0 &&
          pageResults.map((hit) => (
            <Link
              key={hit.id}
              to={reportDetailPath(hit.id)}
              className="mb-4 flex w-full max-w-3xl flex-col gap-2 border border-gray-200 bg-white p-5 font-[Nunito] shadow-sm transition-all duration-200 ease-in-out hover:border-gray-300 hover:bg-gray-50/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 flex-1 text-lg font-bold leading-snug text-gray-900">
                  #{hit.displayId} - {hit.title}
                </h2>
                <span
                  className="mt-0.5 shrink-0 text-gray-400"
                  aria-hidden
                >
                  {/* Diagonal arrow only — avoids a square outline that can read like a checkbox */}
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7 17L17 7M7 7h10v10"
                    />
                  </svg>
                </span>
              </div>
              <p className="text-sm font-medium text-gray-600">{hit.snippet}</p>
            </Link>
          ))}

        {filterActive && normalizedQuery && totalPages > 1 && (
          <PaginationNav
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            ariaLabel="Paginación de reportes"
            className="mb-4 mt-2"
          />
        )}

        {filterActive && normalizedQuery && totalResults === 0 && (
          <NotFound />
        )}

        {hasSubmittedSearch && !normalizedQuery && (
          <p className="px-4 pb-16 text-center font-[Nunito] text-gray-600">
            Ingresa un término de búsqueda o revisa que no esté vacío.
          </p>
        )}
      </SearchContainer>

      <Footer />
    </>
  );
}

export default ReportsSearch;
