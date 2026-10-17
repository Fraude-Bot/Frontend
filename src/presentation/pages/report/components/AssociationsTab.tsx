import { useEffect, useState } from "react";
import PartyAssociationEntity from "@/core/domain/association/entities/party-association.entity";
import { useDependencies } from "@/presentation/providers/useDependencies";
import AssociationCard from "@presentation/pages/report/components/AssociationCard";
import { isCanceledError } from "@/common/utils/http-error.util";
import PaginationNav from "@/presentation/shared/components/PaginationNav";

interface AssociationsTabProps {
  partyId: string;
  partyType: "scammer" | "organization";
}

const copyByPartyType = {
  scammer: {
    title: "Empresas:",
    description: "Organizaciones a las que pertenece este estafador.",
    loading: "Cargando empresas...",
    empty: "No se encontraron empresas.",
    error:
      "No pudimos cargar las empresas. Revisa tu conexión e inténtalo de nuevo.",
    pagination: "Paginación de empresas",
    associationType: "organization",
  },
  organization: {
    title: "Estafadores:",
    description: "Estafadores asociados a esta empresa.",
    loading: "Cargando estafadores...",
    empty: "No se encontraron estafadores.",
    error:
      "No pudimos cargar los estafadores. Revisa tu conexión e inténtalo de nuevo.",
    pagination: "Paginación de estafadores",
    associationType: "scammer",
  },
} as const;

function AssociationsTab({ partyId, partyType }: AssociationsTabProps) {
  const { findAssociationsByPartyUseCase } = useDependencies();
  const [currentPage, setCurrentPage] = useState(1);
  const [associations, setAssociations] = useState<PartyAssociationEntity[]>(
    [],
  );
  const [totalResults, setTotalResults] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const requestKey = `${partyId}:${partyType}:${currentPage}:${requestVersion}`;
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(
    null,
  );
  const copy = copyByPartyType[partyType];

  const totalPages = pageSize > 0 ? Math.ceil(totalResults / pageSize) : 0;
  const isLoading = loadedRequestKey !== requestKey;

  useEffect(() => {
    let ignore = false;

    findAssociationsByPartyUseCase
      .execute(partyId, partyType, currentPage)
      .then((result) => {
        if (ignore) {
          return;
        }

        setAssociations(result.data);
        setCurrentPage(result.page);
        setTotalResults(result.total);
        setPageSize(result.count);
        setErrorMessage(null);
        setLoadedRequestKey(requestKey);
      })
      .catch((error: unknown) => {
        if (ignore || isCanceledError(error)) {
          return;
        }

        setAssociations([]);
        setTotalResults(0);
        setPageSize(0);
        setErrorMessage(copy.error);
        setLoadedRequestKey(requestKey);
      });

    return () => {
      ignore = true;
      findAssociationsByPartyUseCase.cancel();
    };
  }, [
    copy.error,
    currentPage,
    findAssociationsByPartyUseCase,
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
      <h2 className="text-xl font-extrabold leading-none text-gray-900">
        {copy.title}
      </h2>
      <p className="mt-4 text-base leading-6 text-gray-900">{copy.description}</p>

      <div className="mt-6 max-h-[30rem] space-y-3 overflow-y-scroll pr-1">
        {isLoading && (
          <p className="py-10 text-center text-sm text-gray-400">
            {copy.loading}
          </p>
        )}

        {!isLoading &&
          !errorMessage &&
          associations.map((association) => (
            <AssociationCard
              key={association.id}
              association={association}
              associationType={copy.associationType}
            />
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

        {!isLoading && !errorMessage && associations.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">{copy.empty}</p>
        )}
      </div>

      {!isLoading && !errorMessage && (
        <PaginationNav
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          ariaLabel={copy.pagination}
          className="mt-6"
        />
      )}
    </section>
  );
}

export default AssociationsTab;
