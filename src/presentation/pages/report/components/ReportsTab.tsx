import { useEffect, useRef, useState } from "react";
import PartyReportEntity from "@/core/domain/report/entities/party-report.entity";
import type { CreateAttachedReportRequest } from "@/core/domain/report/models/create-report.request";
import { useDependencies } from "@/presentation/providers/useDependencies";
import AddReportModal, {
  type AddReportDraft,
} from "@presentation/pages/report/components/AddReportModal";
import PartyReportCard from "@presentation/pages/report/components/PartyReportCard";
import { isCanceledError } from "@/common/utils/http-error.util";
import PaginationNav from "@/presentation/shared/components/PaginationNav";

interface ReportsTabProps {
  partyId: string;
  partyType: "scammer" | "organization";
}

function toAttachedReportRequest(
  draft: AddReportDraft,
): CreateAttachedReportRequest {
  return {
    email: draft.email,
    title: draft.title,
    description: draft.description,
    products: draft.products,
    ...(draft.proofs.length > 0 ? { proofs: draft.proofs } : {}),
  };
}

function ReportsTab({ partyId, partyType }: ReportsTabProps) {
  const {
    findReportsByPartyUseCase,
    createReportForScammerUseCase,
    createReportForOrganizationUseCase,
  } = useDependencies();
  const [currentPage, setCurrentPage] = useState(1);
  const [reports, setReports] = useState<PartyReportEntity[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [isAddReportOpen, setIsAddReportOpen] = useState(false);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const isCreatingReportRef = useRef(false);
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

  useEffect(() => {
    return () => {
      createReportForOrganizationUseCase.cancel();
      createReportForScammerUseCase.cancel();
    };
  }, [createReportForOrganizationUseCase, createReportForScammerUseCase]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setCurrentPage(page);
  };

  function closeAddReport() {
    isCreatingReportRef.current = false;
    createReportForScammerUseCase.cancel();
    createReportForOrganizationUseCase.cancel();
    setIsCreatingReport(false);
    setIsAddReportOpen(false);
  }

  async function handleCreateReport(draft: AddReportDraft) {
    if (isCreatingReportRef.current) {
      return;
    }

    isCreatingReportRef.current = true;
    setIsCreatingReport(true);

    try {
      const request = toAttachedReportRequest(draft);
      if (partyType === "scammer") {
        await createReportForScammerUseCase.execute(partyId, request);
      } else {
        await createReportForOrganizationUseCase.execute(partyId, request);
      }

      if (!isCreatingReportRef.current) {
        return;
      }

      setIsAddReportOpen(false);
      if (currentPage === 1) {
        setRequestVersion((version) => version + 1);
      } else {
        setCurrentPage(1);
      }
    } catch (error: unknown) {
      if (!isCreatingReportRef.current || isCanceledError(error)) {
        return;
      }
    } finally {
      if (isCreatingReportRef.current) {
        isCreatingReportRef.current = false;
        setIsCreatingReport(false);
      }
    }
  }

  return (
    <section className="border border-gray-200 bg-white p-6 sm:p-8">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <h2 className="text-xl font-extrabold leading-none text-gray-900">
          Historial de Reportes:
        </h2>
        <button
          type="button"
          onClick={() => setIsAddReportOpen(true)}
          className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-red-700"
        >
          Agregar +
        </button>
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

      {isAddReportOpen ? (
        <AddReportModal
          onClose={closeAddReport}
          onCreate={handleCreateReport}
          isSubmitting={isCreatingReport}
        />
      ) : null}
    </section>
  );
}

export default ReportsTab;
