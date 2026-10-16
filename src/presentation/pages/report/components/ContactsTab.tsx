import { useEffect, useRef, useState } from "react";
import ContactSummaryEntity from "@/core/domain/contact/entities/contact-summary.entity";
import { useDependencies } from "@/presentation/providers/useDependencies";
import ContactCard from "@presentation/pages/report/components/ContactCard";
import PlatformFilterRow from "@presentation/pages/report/components/PlatformFilterRow";
import { getHttpStatus, isCanceledError } from "@/common/utils/http-error.util";
import AddContactModal, {
  type AddContactDraft,
} from "@/presentation/shared/components/AddContactModal";
import PaginationNav from "@/presentation/shared/components/PaginationNav";

function contactPlatformKey(platform: string) {
  const key = platform.trim().toLowerCase();
  return key === "webpage" || key === "url" ? "url" : key;
}

function createContactErrorMessage(
  error: unknown,
  partyType: "scammer" | "organization",
) {
  const status = getHttpStatus(error);

  if (status === 422) {
    return "Revisa el contacto. La plataforma o la referencia no es válida.";
  }

  if (status === 404) {
    return partyType === "organization"
      ? "No encontramos esta empresa."
      : "No encontramos este estafador.";
  }

  if (status === 429) {
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  }

  return "No pudimos agregar el contacto. Inténtalo de nuevo.";
}

interface ContactsTabProps {
  partyId: string;
  partyType: "scammer" | "organization";
}

function ContactsTab({ partyId, partyType }: ContactsTabProps) {
  const {
    findContactsByPartyUseCase,
    createScammerContactUseCase,
    createOrganizationContactUseCase,
  } = useDependencies();
  const [currentPage, setCurrentPage] = useState(1);
  const [platform, setPlatform] = useState<string | undefined>();
  const [contacts, setContacts] = useState<ContactSummaryEntity[]>([]);
  const [addedContacts, setAddedContacts] = useState<ContactSummaryEntity[]>(
    [],
  );
  const [totalResults, setTotalResults] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isCreatingContact, setIsCreatingContact] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(
    null,
  );
  const isCreatingContactRef = useRef(false);
  const requestKey = `${partyId}:${partyType}:${currentPage}:${platform ?? ""}:${requestVersion}`;
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(
    null,
  );

  const totalPages = pageSize > 0 ? Math.ceil(totalResults / pageSize) : 0;
  const isLoading = loadedRequestKey !== requestKey;
  const visibleAddedContacts = addedContacts.filter(
    (contact) =>
      !contacts.some((existing) => existing.id === contact.id) &&
      (!platform ||
        contactPlatformKey(contact.platform) === contactPlatformKey(platform)),
  );

  useEffect(() => {
    let ignore = false;

    findContactsByPartyUseCase
      .execute(partyId, partyType, currentPage, platform)
      .then((result) => {
        if (ignore) {
          return;
        }

        setContacts(result.data);
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

        setContacts([]);
        setTotalResults(0);
        setPageSize(0);
        setErrorMessage(
          "No pudimos cargar los contactos. Revisa tu conexión e inténtalo de nuevo.",
        );
        setLoadedRequestKey(requestKey);
      });

    return () => {
      ignore = true;
      findContactsByPartyUseCase.cancel();
    };
  }, [
    currentPage,
    findContactsByPartyUseCase,
    partyId,
    partyType,
    platform,
    requestKey,
    requestVersion,
  ]);

  useEffect(() => {
    return () => {
      createScammerContactUseCase.cancel();
      createOrganizationContactUseCase.cancel();
    };
  }, [createOrganizationContactUseCase, createScammerContactUseCase]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setCurrentPage(page);
  };

  const handlePlatformChange = (nextPlatform: string) => {
    setPlatform((current) =>
      current === nextPlatform ? undefined : nextPlatform,
    );
    setCurrentPage(1);
  };

  function closeAddContact() {
    isCreatingContactRef.current = false;
    createScammerContactUseCase.cancel();
    createOrganizationContactUseCase.cancel();
    setIsCreatingContact(false);
    setCreateErrorMessage(null);
    setIsAddContactOpen(false);
  }

  async function handleCreateContact(draft: AddContactDraft) {
    if (isCreatingContactRef.current) {
      return;
    }

    isCreatingContactRef.current = true;
    setIsCreatingContact(true);
    setCreateErrorMessage(null);

    try {
      const request = {
        platform: draft.platform,
        reference: draft.url,
      };
      const contact =
        partyType === "scammer"
          ? await createScammerContactUseCase.execute(partyId, request)
          : await createOrganizationContactUseCase.execute(partyId, request);

      if (!isCreatingContactRef.current) {
        return;
      }

      setAddedContacts((current) => [contact, ...current]);
      if (
        platform &&
        contactPlatformKey(contact.platform) !== contactPlatformKey(platform)
      ) {
        setPlatform(undefined);
        setCurrentPage(1);
      }
      setIsAddContactOpen(false);
      setCreateErrorMessage(null);
    } catch (error: unknown) {
      if (!isCreatingContactRef.current || isCanceledError(error)) {
        return;
      }

      setCreateErrorMessage(createContactErrorMessage(error, partyType));
    } finally {
      if (isCreatingContactRef.current) {
        isCreatingContactRef.current = false;
        setIsCreatingContact(false);
      }
    }
  }

  return (
    <section className="border border-gray-200 bg-white p-6 sm:p-8">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <h2 className="text-xl font-extrabold leading-none text-gray-900">
          Contactos:
        </h2>
        <button
          type="button"
          onClick={() => {
            setCreateErrorMessage(null);
            setIsAddContactOpen(true);
          }}
          className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-red-700"
        >
          Agregar Contacto +
        </button>
      </div>

      <p className="mt-4 text-base leading-6 text-gray-900">
        Los medios de contacto que este estafador/empresa ha utilizado a lo
        largo del tiempo.
      </p>

      <PlatformFilterRow
        selectedPlatform={platform}
        onPlatformChange={handlePlatformChange}
      />

      <div className="mt-6 max-h-[30rem] space-y-3 overflow-y-scroll pr-1">
        {isLoading && (
          <p className="py-10 text-center text-sm text-gray-400">
            Cargando contactos...
          </p>
        )}

        {!errorMessage &&
          visibleAddedContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}

        {!isLoading &&
          !errorMessage &&
          contacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
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
          visibleAddedContacts.length === 0 &&
          contacts.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">
            No se encontraron contactos.
          </p>
        )}
      </div>

      {!isLoading && !errorMessage && (
        <PaginationNav
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          ariaLabel="Paginación de contactos"
          className="mt-6"
        />
      )}

      {isAddContactOpen ? (
        <AddContactModal
          onClose={closeAddContact}
          onCreate={handleCreateContact}
          errorMessage={createErrorMessage}
          isSubmitting={isCreatingContact}
        />
      ) : null}
    </section>
  );
}

export default ContactsTab;
