import { useState } from "react";
import { getPaymentLabel } from "@/presentation/pages/report/components/payment-method.util";
import AddPaymentModal from "@/presentation/pages/report-form/components/AddPaymentModal";
import ReportAddTile from "@/presentation/pages/report-form/components/ReportAddTile";
import type { ReportFormPaymentDraft } from "@/presentation/pages/report-form/components/types";

type ReportPaymentsSectionProps = {
  description: string;
  payments: ReportFormPaymentDraft[];
  onChange: (payments: ReportFormPaymentDraft[]) => void;
};

function createPaymentId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `payment-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ReportPaymentsSection({
  description,
  payments,
  onChange,
}: ReportPaymentsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function addPayment(payment: Omit<ReportFormPaymentDraft, "id">) {
    onChange([...payments, { ...payment, id: createPaymentId() }]);
    setIsModalOpen(false);
  }

  function removePayment(id: string) {
    onChange(payments.filter((payment) => payment.id !== id));
  }

  return (
    <div className="pt-1">
      <h3 className="font-extrabold text-gray-900">Métodos de pagos</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
      <div className="mt-4 flex flex-wrap gap-4">
        {payments.map((payment) => {
          const typeLabel = getPaymentLabel(payment.type, Number(payment.type));

          return (
            <article
              key={payment.id}
              className="relative flex h-20 min-w-40 max-w-56 flex-col justify-center border border-gray-300 bg-white px-3 pr-8"
            >
              <button
                type="button"
                onClick={() => removePayment(payment.id)}
                aria-label={`Eliminar método de pago ${payment.reference}`}
                className="absolute top-1 right-1 cursor-pointer px-1 text-lg leading-none text-gray-500 hover:text-gray-900"
              >
                ×
              </button>
              <p className="truncate text-sm font-bold text-gray-900">
                {payment.holder}
              </p>
              <p
                className="mt-1 truncate text-xs text-gray-500"
                title={`${typeLabel} · ${payment.reference}`}
              >
                {typeLabel} · {payment.reference}
              </p>
            </article>
          );
        })}
        <ReportAddTile
          label="Agregar método de pago"
          onClick={() => setIsModalOpen(true)}
        />
      </div>
      {isModalOpen ? (
        <AddPaymentModal
          onClose={() => setIsModalOpen(false)}
          onCreate={addPayment}
        />
      ) : null}
    </div>
  );
}

export default ReportPaymentsSection;
