import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDependencies } from "@/presentation/providers/useDependencies";
import Footer from "@presentation/shared/components/Footer";
import Header from "@presentation/shared/components/Header";
import SearchContainer from "@presentation/pages/search/components/SearchContainer";
import Loader from "@/presentation/pages/search/components/Loader";
import NotFound from "@/presentation/pages/search/components/NotFound";
import Formatter from "@/presentation/shared/utils/formatter";
import { getValidPage } from "@/presentation/shared/utils/search-pagination.util";
import { isCanceledError } from "@/common/utils/http-error.util";
import PaginationNav from "@/presentation/shared/components/PaginationNav";
import ReportTextSearchForm from "@/presentation/pages/reports-search/components/ReportTextSearchForm";
import PartyReportEntity from "@/core/domain/report/entities/party-report.entity";
import PartyReportCard from "@/presentation/shared/components/PartyReportCard";

function ReportsSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = searchParams.get("q") || "";
  const formattedUrlQuery = Formatter.FormatInput(urlQuery);
  const [query, setQuery] = useState(formattedUrlQuery);
  const [syncedUrlQuery, setSyncedUrlQuery] = useState(urlQuery);
  const [requestVersion, setRequestVersion] = useState(0);
  const [fetched, setFetched] = useState<{
    key: string;
    reports: PartyReportEntity[];
    currentPage: number;
    totalResults: number;
    pageSize: number;
    errorMessage: string | null;
  } | null>(null);

  const activeSearchId = useRef(0);
  const { searchReportsByTitleUseCase } = useDependencies();
  const requestedPage = getValidPage(
    searchParams.get("p") || searchParams.get("page"),
  );
  const hasSubmittedSearch = urlQuery.trim().length > 0;
  const hasQuery = Formatter.toSearchQuery(formattedUrlQuery).length > 0;
  const requestKey = `${formattedUrlQuery}:${requestedPage}:${requestVersion}`;

  if (urlQuery !== syncedUrlQuery) {
    setSyncedUrlQuery(urlQuery);
    setQuery(formattedUrlQuery);
  }

  useEffect(() => {
    if (!hasQuery) {
      activeSearchId.current += 1;
      return;
    }

    const searchId = ++activeSearchId.current;

    void searchReportsByTitleUseCase
      .execute(Formatter.toSearchQuery(formattedUrlQuery), requestedPage)
      .then((result) => {
        if (searchId !== activeSearchId.current) {
          return;
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
      searchReportsByTitleUseCase.cancel();
    };
  }, [
    formattedUrlQuery,
    hasQuery,
    requestKey,
    requestVersion,
    requestedPage,
    searchReportsByTitleUseCase,
    setSearchParams,
  ]);

  const activeResult =
    !hasQuery || fetched?.key !== requestKey
      ? null
      : {
          reports: fetched.reports,
          currentPage: fetched.currentPage,
          totalResults: fetched.totalResults,
          pageSize: fetched.pageSize,
          errorMessage: fetched.errorMessage,
        };

  const isSearching = hasQuery && fetched?.key !== requestKey;
  const reports = activeResult?.reports ?? [];
  const currentPage = activeResult?.currentPage ?? 1;
  const totalResults = activeResult?.totalResults ?? 0;
  const pageSize = activeResult?.pageSize ?? 0;
  const errorMessage = activeResult?.errorMessage ?? null;
  const totalPages = pageSize > 0 ? Math.ceil(totalResults / pageSize) : 0;

  const handleInputChange = (event: React.InputEvent<HTMLInputElement>) => {
    setQuery(Formatter.FormatInput(event.currentTarget.value));
  };

  const handleSubmit = () => {
    const formatted = Formatter.FormatInput(query);
    const nextSearch = formatted.trim()
      ? `?${Formatter.buildSearchQueryString(formatted, 1)}`
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
      <title>FraudeBot - Búsqueda de reportes</title>

      <Header />

      <SearchContainer>
        <h1 className="mb-8 mt-28 px-4 text-center font-[Nunito] text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Búsqueda de reportes
        </h1>

        <ReportTextSearchForm
          query={query}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
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
          reports.length > 0 && (
            <div className="flex w-full max-w-3xl flex-col gap-4 px-4">
              {reports.map((report) => (
                <PartyReportCard key={report.id} report={report} />
              ))}
            </div>
          )}

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
          hasQuery &&
          totalResults === 0 && <NotFound />}

        {!hasSubmittedSearch && (
          <p className="px-4 pb-16 text-center font-[Nunito] text-gray-600">
            Ingresa palabras clave para explorar reportes de la comunidad.
          </p>
        )}

        {hasSubmittedSearch && !hasQuery && (
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
