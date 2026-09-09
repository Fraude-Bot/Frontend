import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDependencies } from "@/presentation/providers/useDependencies";
import Header from "@presentation/shared/components/Header";
import Footer from "@presentation/shared/components/Footer";
import SearchContainer from "@presentation/pages/search/components/SearchContainer";
import Loader from "@/presentation/pages/search/components/Loader";
import LookupForm from "@presentation/pages/search/components/LookupForm";
import Formatter from "@/presentation/shared/utils/formatter";
import searchReportCache from "@/presentation/shared/utils/search-report-cache.util";
import Report from "@/presentation/pages/search/components/ReportCard";
import ReportSummaryEntity from "@/core/domain/report/entities/report-summary.entity";
import NotFound from "@/presentation/pages/search/components/NotFound";
import { getValidPage } from "@/presentation/shared/utils/search-pagination.util";
import { isCanceledError } from "@/common/utils/http-error.util";
import PaginationNav from "@/presentation/shared/components/PaginationNav";

function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const formattedUrlQuery = Formatter.FormatInput(urlQuery);
  const [query, setQuery] = useState(formattedUrlQuery);
  const [syncedUrlQuery, setSyncedUrlQuery] = useState(urlQuery);
  const [requestVersion, setRequestVersion] = useState(0);
  const [fetched, setFetched] = useState<{
    key: string;
    reports: ReportSummaryEntity[];
    currentPage: number;
    totalResults: number;
    pageSize: number;
    errorMessage: string | null;
  } | null>(null);

  const activeSearchId = useRef(0);
  const { searchReportUseCase, searchReportStubUseCase } = useDependencies();
  const requestedPage = getValidPage(
    searchParams.get("p") || searchParams.get("page"),
  );
  const hasSubmittedSearch = urlQuery.trim().length > 0;
  const hasQuery = formattedUrlQuery.trim().length > 0;
  const requestKey = `${formattedUrlQuery}:${requestedPage}:${requestVersion}`;

  if (urlQuery !== syncedUrlQuery) {
    setSyncedUrlQuery(urlQuery);
    setQuery(formattedUrlQuery);
  }

  const cachedResult = hasQuery
    ? searchReportCache.get(formattedUrlQuery, requestedPage)
    : null;

  useEffect(() => {
    if (!hasQuery) {
      activeSearchId.current += 1;
      return;
    }

    if (searchReportCache.get(formattedUrlQuery, requestedPage)) {
      return;
    }

    const searchId = ++activeSearchId.current;
    const useStub =
      import.meta.env.DEV && formattedUrlQuery.includes("[TEST]");
    const useCase = useStub ? searchReportStubUseCase : searchReportUseCase;

    void useCase
      .execute(Formatter.toSearchQuery(formattedUrlQuery), requestedPage)
      .then((result) => {
        if (searchId !== activeSearchId.current) {
          return;
        }

        if (!useStub) {
          searchReportCache.set(formattedUrlQuery, result);
        }

        setFetched({
          key: requestKey,
          reports: result.data,
          currentPage: result.page,
          totalResults: result.total,
          pageSize: result.count,
          errorMessage: null,
        });

        if (result.page !== requestedPage) {
          setSearchParams(
            `?${Formatter.buildSearchQueryString(formattedUrlQuery, result.page)}`,
            { replace: true },
          );
        }
      })
      .catch((error: unknown) => {
        if (
          searchId !== activeSearchId.current ||
          isCanceledError(error)
        ) {
          return;
        }

        setFetched({
          key: requestKey,
          reports: [],
          currentPage: 1,
          totalResults: 0,
          pageSize: 0,
          errorMessage:
            "No pudimos completar la búsqueda. Revisa tu conexión e inténtalo de nuevo.",
        });
      });

    return () => {
      useCase.cancel();
    };
  }, [
    formattedUrlQuery,
    hasQuery,
    requestKey,
    requestVersion,
    requestedPage,
    searchReportStubUseCase,
    searchReportUseCase,
    setSearchParams,
  ]);

  const activeResult = !hasQuery
    ? null
    : cachedResult
      ? {
          reports: cachedResult.data,
          currentPage: cachedResult.page,
          totalResults: cachedResult.total,
          pageSize: cachedResult.count,
          errorMessage: null as string | null,
        }
      : fetched?.key === requestKey
        ? fetched
        : null;
  const isSearching = hasQuery && !cachedResult && fetched?.key !== requestKey;
  const reports = activeResult?.reports ?? [];
  const currentPage = activeResult?.currentPage ?? 1;
  const totalResults = activeResult?.totalResults ?? 0;
  const pageSize = activeResult?.pageSize ?? 0;
  const errorMessage = activeResult?.errorMessage ?? null;
  const totalPages = pageSize > 0 ? Math.ceil(totalResults / pageSize) : 0;

  const handleInputChange = (event: React.InputEvent<HTMLInputElement>) => {
    const formattedQuery = Formatter.FormatInput(event.currentTarget.value);

    setQuery(formattedQuery);
  };

  const handleSubmit = () => {
    const formattedQuery = Formatter.FormatInput(query);
    const nextSearch = formattedQuery.trim()
      ? `?${Formatter.buildSearchQueryString(formattedQuery, 1)}`
      : "";

    if (nextSearch === `?${searchParams.toString()}`) {
      setRequestVersion((version) => version + 1);
    } else {
      setSearchParams(nextSearch);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setSearchParams(`?${Formatter.buildSearchQueryString(urlQuery, page)}`);
  };

  return (
    <>
      <title>FraudeBot - Búsqueda</title>

      <Header />

      <SearchContainer>
        <h1 className="sr-only">Buscar reportes de fraude</h1>
        <LookupForm
          onSubmit={handleSubmit}
          onInputChange={handleInputChange}
          query={query}
        />

        {isSearching && <Loader />}

        {!isSearching && errorMessage && (
          <section
            role="alert"
            className="mx-4 mb-8 max-w-xl rounded-lg border border-red-200 bg-red-50 p-6 text-center font-[Nunito]"
          >
            <h2 className="text-lg font-extrabold text-red-900">
              La búsqueda falló
            </h2>
            <p className="mt-2 text-red-800">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setRequestVersion((version) => version + 1)}
              className="mt-4 rounded-md bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Reintentar
            </button>
          </section>
        )}

        {!isSearching &&
          !errorMessage &&
          reports.length > 0 &&
          reports.map((report) => (
            <Report
              key={`${report.type}:${report.id}`}
              id={report.id}
              name={report.name}
              organizations={report.organizations}
              products={report.products}
              reports={report.reports}
              tags={report.tags}
              status={report.status}
              type={report.type}
            />
          ))}

        {!isSearching && !errorMessage && totalPages > 1 && (
          <PaginationNav
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            ariaLabel="Paginación de reportes"
            className="mb-4 mt-2"
          />
        )}

        {!isSearching &&
          !errorMessage &&
          hasSubmittedSearch &&
          totalResults === 0 && <NotFound />}

        {!isSearching && !hasSubmittedSearch && (
          <p className="px-4 pb-16 text-center font-[Nunito] text-gray-600">
            Ingresa un dato para consultar reportes de la comunidad.
          </p>
        )}
      </SearchContainer>

      <Footer />
    </>
  );
}

export default Search;
