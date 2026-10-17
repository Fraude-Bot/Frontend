import { useEffect, useRef, useState } from "react";
import PaymentMethodSummaryEntity from "@/core/domain/payment-method/entities/payment-method-summary.entity";
import { useDependencies } from "@/presentation/providers/useDependencies";
import PaymentMethodCard from "@presentation/pages/report/components/PaymentMethodCard";
import PaymentTypeFilterRow from "@presentation/pages/report/components/PaymentTypeFilterRow";
import { getHttpStatus, isCanceledError } from "@/common/utils/http-error.util";
import AddPaymentModal, {
  type AddPaymentDraft,
} from "@/presentation/shared/components/AddPaymentModal";
import PaginationNav from "@/presentation/shared/components/PaginationNav";

function createPaymentMethodErrorMessage(
  error: unknown,
  partyType: "scammer" | "organization",
) {
  const status = getHttpStatus(error);

  if (status === 422) {
    return "Este método de pago ya está registrado, o la referencia no es válida.";
  }

  if (status === 404) {
    return partyType === "organization"
      ? "No encontramos esta empresa."
      : "No encontramos este estafador.";
  }

  if (status === 429) {
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  }

  return "No pudimos agregar el método de pago. Inténtalo de nuevo.";
}

interface PaymentMethodsTabProps {
  partyId: string;
  partyType: "scammer" | "organization";
}

function PaymentMethodsTab({ partyId, partyType }: PaymentMethodsTabProps) {
  const {
    findPaymentMethodsByPartyUseCase,
    createScammerPaymentMethodUseCase,
    createOrganizationPaymentMethodUseCase,
  } = useDependencies();
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentType, setPaymentType] = useState<string | undefined>();
  const [paymentMethods, setPaymentMethods] = useState<
    PaymentMethodSummaryEntity[]
  >([]);
  const [addedPaymentMethods, setAddedPaymentMethods] = useState<
    PaymentMethodSummaryEntity[]
  >([]);
  const [totalResults, setTotalResults] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(
    null,
  );
  const isCreatingPaymentRef = useRef(false);
  const requestKey = `${partyId}:${partyType}:${currentPage}:${paymentType ?? ""}:${requestVersion}`;
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(
    null,
  );

  const totalPages = pageSize > 0 ? Math.ceil(totalResults / pageSize) : 0;
  const isLoading = loadedRequestKey !== requestKey;
  const visibleAddedPaymentMethods = addedPaymentMethods.filter(
    (paymentMethod) =>
      !paymentMethods.some((existing) => existing.id === paymentMethod.id) &&
      (!paymentType || String(paymentMethod.paymentType) === paymentType),
  );

  useEffect(() => {
    let ignore = false;

    findPaymentMethodsByPartyUseCase
      .execute(partyId, partyType, currentPage, paymentType)
      .then((result) => {
        if (ignore) {
          return;
        }

        setPaymentMethods(result.data);
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

        setPaymentMethods([]);
        setTotalResults(0);
        setPageSize(0);
        setErrorMessage(
          "No pudimos cargar los métodos de pago. Revisa tu conexión e inténtalo de nuevo.",
        );
        setLoadedRequestKey(requestKey);
      });

    return () => {
      ignore = true;
      findPaymentMethodsByPartyUseCase.cancel();
    };
  }, [
    currentPage,
    findPaymentMethodsByPartyUseCase,
    partyId,
    partyType,
    paymentType,
    requestKey,
    requestVersion,
  ]);

  useEffect(() => {
    return () => {
      createScammerPaymentMethodUseCase.cancel();
      createOrganizationPaymentMethodUseCase.cancel();
    };
  }, [
    createOrganizationPaymentMethodUseCase,
    createScammerPaymentMethodUseCase,
  ]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    setCurrentPage(page);
  };

  const handlePaymentTypeChange = (nextPaymentType: string) => {
    setPaymentType((current) =>
      current === nextPaymentType ? undefined : nextPaymentType,
    );
    setCurrentPage(1);
  };

  function closeAddPayment() {
    isCreatingPaymentRef.current = false;
    createScammerPaymentMethodUseCase.cancel();
    createOrganizationPaymentMethodUseCase.cancel();
    setIsCreatingPayment(false);
    setCreateErrorMessage(null);
    setIsAddPaymentOpen(false);
  }

  async function handleCreatePayment(draft: AddPaymentDraft) {
    if (isCreatingPaymentRef.current) {
      return;
    }

    isCreatingPaymentRef.current = true;
    setIsCreatingPayment(true);
    setCreateErrorMessage(null);

    try {
      const request = {
        reference: draft.reference,
      };
      const paymentMethod =
        partyType === "scammer"
          ? await createScammerPaymentMethodUseCase.execute(partyId, request)
          : await createOrganizationPaymentMethodUseCase.execute(
              partyId,
              request,
            );

      if (!isCreatingPaymentRef.current) {
        return;
      }

      setAddedPaymentMethods((current) => [paymentMethod, ...current]);
      if (
        paymentType &&
        String(paymentMethod.paymentType) !== paymentType
      ) {
        setPaymentType(undefined);
        setCurrentPage(1);
      }
      setIsAddPaymentOpen(false);
      setCreateErrorMessage(null);
    } catch (error: unknown) {
      if (!isCreatingPaymentRef.current || isCanceledError(error)) {
        return;
      }

      setCreateErrorMessage(
        createPaymentMethodErrorMessage(error, partyType),
      );
    } finally {
      if (isCreatingPaymentRef.current) {
        isCreatingPaymentRef.current = false;
        setIsCreatingPayment(false);
      }
    }
  }

  return (
    <section className="border border-gray-200 bg-white p-6 sm:p-8">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <h2 className="text-xl font-extrabold leading-none text-gray-900">
          Métodos de pago:
        </h2>
        <button
          type="button"
          onClick={() => {
            setCreateErrorMessage(null);
            setIsAddPaymentOpen(true);
          }}
          className="cursor-pointer rounded-md bg-red-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-red-700"
        >
          Agregar Método de Pago +
        </button>
      </div>

      <p className="mt-4 text-base leading-6 text-gray-900">
        Los métodos de pago que este estafador/empresa ha utilizado a lo largo
        del tiempo.
      </p>

      <PaymentTypeFilterRow
        selectedPaymentType={paymentType}
        onPaymentTypeChange={handlePaymentTypeChange}
      />

      <div className="mt-6 max-h-[30rem] space-y-3 overflow-y-scroll pr-1">
        {isLoading && (
          <p className="py-10 text-center text-sm text-gray-400">
            Cargando métodos de pago...
          </p>
        )}

        {!errorMessage &&
          visibleAddedPaymentMethods.map((paymentMethod) => (
            <PaymentMethodCard
              key={paymentMethod.id}
              paymentMethod={paymentMethod}
            />
          ))}

        {!isLoading &&
          !errorMessage &&
          paymentMethods.map((paymentMethod) => (
            <PaymentMethodCard
              key={paymentMethod.id}
              paymentMethod={paymentMethod}
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
          visibleAddedPaymentMethods.length === 0 &&
          paymentMethods.length === 0 && (
            <p className="py-10 text-center text-sm text-gray-400">
              No se encontraron métodos de pago.
            </p>
          )}
      </div>

      {!isLoading && !errorMessage && (
        <PaginationNav
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          ariaLabel="Paginación de métodos de pago"
          className="mt-6"
        />
      )}

      {isAddPaymentOpen ? (
        <AddPaymentModal
          onClose={closeAddPayment}
          onCreate={handleCreatePayment}
          errorMessage={createErrorMessage}
          isSubmitting={isCreatingPayment}
        />
      ) : null}
    </section>
  );
}

export default PaymentMethodsTab;
