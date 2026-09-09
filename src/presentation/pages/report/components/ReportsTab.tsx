import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PartyReportEntity from "@/core/domain/report/entities/party-report.entity";
import { useDependencies } from "@/presentation/providers/useDependencies";
import PartyReportCard from "@presentation/pages/report/components/PartyReportCard";
import { isCanceledError } from "@/common/utils/http-error.util";
import PaginationNav from "@/presentation/shared/components/PaginationNav";
import {
  reportPartyPath,
} from "@/common/app-routes";

interface ReportsTabProps {
  partyId: string;
  partyType: "scammer" | "organization";
}

function ReportsTab({ partyId, partyType }: ReportsTabProps) {
  const { findReportsByPartyUseCase } = useDependencies();
  const [currentPage, setCurrentPage] = useState(1);
  const [reports, setReports] = useState<PartyReportEntity[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const requestKey = `${partyId}:${partyType}:${currentPage}:${requestVersion}`;
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(
    null,
  );

  const totalPages = pageSize > 0 ? Math.ceil(totalResults / pageSize) : 0;
  const isLoading = loadedRequestKey !== requestKey;

  useEffect(() => {
    let ignore = false;

    findReportsByPartyUseCase
      .execute(partyId, partyType, currentPage)
      .then((result) => {
        if (ignore) {
          return;
        }

        setReports(result.data);
        setCurrentPage(result.page);
        setTotalResults(result.total);
        setPageSize(result.count);
        setErrorMessage(null);
        setLoadedRequestKey(requestKey);
      })
      .catch((error) => {
        if (ignore || isCanceledError(error)) {
          return;
        }

        setReports([]);
        setTotalResults(0);
        setPageSize(0);
        setErrorMessage(
          "No pudimos cargar los reportes. Revisa tu conexión e inténtalo de nuevo.",
        );
        setLoadedRequestKey(requestKey);
      });

    return () => {
      ignore = true;
      findReportsByPartyUseCase.cancel();
    };
  }, [
    currentPage,
    findReportsByPartyUseCase,
    partyId,
    partyType,
    requestKey,
    requestVersion,
  ]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setCurrentPage(page);
  };

  return (
    <section className="border border-gray-200 bg-white p-6 sm:p-8">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <h2 className="text-xl font-extrabold leading-none text-gray-900">
          Historial de Reportes:
        </h2>
        <Link
          to={reportPartyPath(partyId, partyType)}
          className="inline-block cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-red-700"
        >
          Agregar +
        </Link>
      </div>

      <div className="mt-6 max-h-[30rem] space-y-3 overflow-y-scroll pr-1">
        {isLoading && (
          <p className="py-10 text-center text-sm text-gray-400">
            Cargando reportes...
          </p>
        )}

        {!isLoading &&
          !errorMessage &&
          reports.map((report) => (
            <PartyReportCard key={report.id} report={report} />
          ))}

        {!isLoading && errorMessage && (
          <div role="alert" className="py-10 text-center">
            <p className="text-sm font-semibold text-red-800">{errorMessage}</p>
            <button
              type="button"
              onClick={() => setRequestVersion((version) => version + 1)}
              className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        )}

        {!isLoading && !errorMessage && reports.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">
            No se encontraron reportes.
          </p>
        )}
      </div>

      {!isLoading && !errorMessage && (
        <PaginationNav
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          ariaLabel="Paginación de reportes"
          className="mt-6"
        />
      )}
    </section>
  );
}

export default ReportsTab;
