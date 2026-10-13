import { useEffect, useState } from "react";
import PaymentMethodSummaryEntity from "@/core/domain/payment-method/entities/payment-method-summary.entity";
import { useDependencies } from "@/presentation/providers/useDependencies";
import PaymentMethodCard from "@presentation/pages/report/components/PaymentMethodCard";
import PaymentTypeFilterRow from "@presentation/pages/report/components/PaymentTypeFilterRow";
import { isCanceledError } from "@/common/utils/http-error.util";
import PaginationNav from "@/presentation/shared/components/PaginationNav";

interface PaymentMethodsTabProps {
  partyId: string;
  partyType: "scammer" | "organization";
}

function PaymentMethodsTab({ partyId, partyType }: PaymentMethodsTabProps) {
  const { findPaymentMethodsByPartyUseCase } = useDependencies();
  const [currentPage, setCurrentPage] = useState(1);
  const [paymentType, setPaymentType] = useState<string | undefined>();
  const [paymentMethods, setPaymentMethods] = useState<
    PaymentMethodSummaryEntity[]
  >([]);
  const [totalResults, setTotalResults] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const requestKey = `${partyId}:${partyType}:${currentPage}:${paymentType ?? ""}:${requestVersion}`;
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(
    null,
  );

  const totalPages = pageSize > 0 ? Math.ceil(totalResults / pageSize) : 0;
  const isLoading = loadedRequestKey !== requestKey;

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

  return (
    <section className="border border-gray-200 bg-white p-6 sm:p-8">
      <h2 className="text-xl font-extrabold leading-none text-gray-900">
        Métodos de pago:
      </h2>

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

        {!isLoading && !errorMessage && paymentMethods.length === 0 && (
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
    </section>
  );
}

export default PaymentMethodsTab;
