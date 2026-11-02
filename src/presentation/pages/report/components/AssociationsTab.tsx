import { useEffect, useRef, useState } from "react";
import type PartyAssociationEntity from "@/core/domain/association/entities/party-association.entity";
import { useDependencies } from "@/presentation/providers/useDependencies";
import AddCollaboratorModal from "@/presentation/pages/report-form/components/AddCollaboratorModal";
import type { ReportFormCollaboratorDraft } from "@/presentation/pages/report-form/components/types";
import AssociationCard from "@presentation/pages/report/components/AssociationCard";
import { getHttpStatus, isCanceledError } from "@/common/utils/http-error.util";
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

function createScammerErrorMessage(error: unknown) {
  const status = getHttpStatus(error);

  if (status === 422) {
    return "Revisa el nombre. Debe tener entre 1 y 100 caracteres.";
  }

  if (status === 404) {
    return "No encontramos esta empresa.";
  }

  if (status === 429) {
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  }

  return "No pudimos agregar el estafador. Inténtalo de nuevo.";
}

function AssociationsTab({ partyId, partyType }: AssociationsTabProps) {
  const { findAssociationsByPartyUseCase, createOrganizationScammerUseCase } =
    useDependencies();
  const [currentPage, setCurrentPage] = useState(1);
  const [associations, setAssociations] = useState<PartyAssociationEntity[]>(
    [],
  );
  const [addedAssociations, setAddedAssociations] = useState<
    PartyAssociationEntity[]
  >([]);
  const [isAddCollaboratorOpen, setIsAddCollaboratorOpen] = useState(false);
  const [isCreatingScammer, setIsCreatingScammer] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(
    null,
  );
  const isCreatingScammerRef = useRef(false);
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
  const visibleAddedAssociations = addedAssociations.filter(
    (association) =>
      !associations.some((existing) => existing.id === association.id),
  );

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

  useEffect(() => {
    return () => {
      createOrganizationScammerUseCase.cancel();
    };
  }, [createOrganizationScammerUseCase]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setCurrentPage(page);
  };

  function closeAddCollaborator() {
    isCreatingScammerRef.current = false;
    createOrganizationScammerUseCase.cancel();
    setIsCreatingScammer(false);
    setCreateErrorMessage(null);
    setIsAddCollaboratorOpen(false);
  }

  async function handleCreateCollaborator(
    collaborator: Omit<ReportFormCollaboratorDraft, "id">,
  ) {
    if (isCreatingScammerRef.current) {
      return;
    }

    isCreatingScammerRef.current = true;
    setIsCreatingScammer(true);
    setCreateErrorMessage(null);

    try {
      const association = await createOrganizationScammerUseCase.execute(
        partyId,
        { name: collaborator.name },
      );

      if (!isCreatingScammerRef.current) {
        return;
      }

      setAddedAssociations((current) =>
        current.some((item) => item.id === association.id)
          ? current
          : [association, ...current],
      );
      setIsAddCollaboratorOpen(false);
      setCreateErrorMessage(null);
    } catch (error: unknown) {
      if (!isCreatingScammerRef.current || isCanceledError(error)) {
        return;
      }

      setCreateErrorMessage(createScammerErrorMessage(error));
    } finally {
      if (isCreatingScammerRef.current) {
        isCreatingScammerRef.current = false;
        setIsCreatingScammer(false);
      }
    }
  }

  const canAddCollaborator = partyType === "organization";

  return (
    <section className="border border-gray-200 bg-white p-6 sm:p-8">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <h2 className="text-xl font-extrabold leading-none text-gray-900">
          {copy.title}
        </h2>
        {canAddCollaborator ? (
          <button
            type="button"
            onClick={() => {
              setCreateErrorMessage(null);
              setIsAddCollaboratorOpen(true);
            }}
            className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-red-700"
          >
            Agregar +
          </button>
        ) : null}
      </div>
      <p className="mt-4 text-base leading-6 text-gray-900">{copy.description}</p>

      <div className="mt-6 max-h-[30rem] space-y-3 overflow-y-scroll pr-1">
        {isLoading && (
          <p className="py-10 text-center text-sm text-gray-400">
            {copy.loading}
          </p>
        )}

        {visibleAddedAssociations.map((association) => (
          <AssociationCard
            key={association.id}
            association={association}
            associationType={copy.associationType}
          />
        ))}

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

        {!isLoading &&
          !errorMessage &&
          visibleAddedAssociations.length === 0 &&
          associations.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              {copy.empty}
            </p>
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

      {canAddCollaborator && isAddCollaboratorOpen ? (
        <AddCollaboratorModal
          onClose={closeAddCollaborator}
          onCreate={handleCreateCollaborator}
          errorMessage={createErrorMessage}
          isSubmitting={isCreatingScammer}
        />
      ) : null}
    </section>
  );
}

export default AssociationsTab;
