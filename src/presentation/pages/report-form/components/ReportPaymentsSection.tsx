import { useState } from "react";
import { getPaymentLabel } from "@/presentation/pages/report/components/payment-method.util";
import { getPaymentIconSrc } from "@/presentation/pages/report/components/payment-icons";
import AddPaymentModal from "@/presentation/pages/report-form/components/AddPaymentModal";
import EditPaymentModal from "@/presentation/pages/report-form/components/EditPaymentModal";
import ReportAddTile from "@/presentation/pages/report-form/components/ReportAddTile";
import type { ReportFormPaymentDraft } from "@/presentation/pages/report-form/components/types";

type ReportPaymentsSectionProps = {
  description: string;
  payments: ReportFormPaymentDraft[];
  onChange: (payments: ReportFormPaymentDraft[]) => void;
  error?: string;
  errorId?: string;
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
  error,
  errorId,
}: ReportPaymentsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const editingPayment =
    payments.find((payment) => payment.id === editingPaymentId) ?? null;

  function addPayment(payment: Omit<ReportFormPaymentDraft, "id">) {
    onChange([...payments, { ...payment, id: createPaymentId() }]);
    setIsModalOpen(false);
  }

  function savePayment(payment: Omit<ReportFormPaymentDraft, "id">) {
    if (editingPaymentId === null) {
      return;
    }

    onChange(
      payments.map((item) =>
        item.id === editingPaymentId ? { ...payment, id: item.id } : item,
      ),
    );
    setEditingPaymentId(null);
  }

  function removePayment(id: string) {
    onChange(payments.filter((payment) => payment.id !== id));
    if (editingPaymentId === id) {
      setEditingPaymentId(null);
    }
  }

  return (
    <div className="pt-1" data-report-field="payments">
      <h3 className="font-extrabold text-gray-900">Métodos de pagos</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
      <div className="mt-4 flex flex-wrap gap-4">
        {payments.map((payment) => {
          const typeLabel = getPaymentLabel(payment.type, Number(payment.type));
          const typeIconSrc = getPaymentIconSrc(payment.type);

          return (
            <article
              key={payment.id}
              className="relative flex h-20 min-w-40 max-w-56 flex-col justify-center border border-gray-300 bg-white px-3 pr-8 transition-colors hover:border-orange-400 hover:bg-orange-50"
            >
              <button
                type="button"
                aria-label={`Editar método de pago ${payment.reference}`}
                title={`${typeLabel} · ${payment.reference}`}
                onClick={() => setEditingPaymentId(payment.id)}
                className="absolute inset-0 cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
              />
              <button
                type="button"
                onClick={() => removePayment(payment.id)}
                aria-label={`Eliminar método de pago ${payment.reference}`}
                className="absolute top-1 right-1 z-10 cursor-pointer px-1 text-lg leading-none text-gray-500 hover:text-gray-900"
              >
                ×
              </button>
              <div className="pointer-events-none flex min-w-0 items-center gap-2">
                {typeIconSrc ? (
                  <img
                    src={typeIconSrc}
                    alt=""
                    className="h-5 w-5 shrink-0 object-contain"
                  />
                ) : null}
                <p className="truncate text-sm font-bold text-gray-900">
                  {payment.reference}
                </p>
              </div>
              <p className="pointer-events-none mt-1 truncate text-xs text-gray-500">
                {typeLabel}
              </p>
            </article>
          );
        })}
        <ReportAddTile
          label="Agregar método de pago"
          onClick={() => setIsModalOpen(true)}
          invalid={Boolean(error)}
          describedBy={error ? errorId : undefined}
        />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
      {isModalOpen ? (
        <AddPaymentModal
          onClose={() => setIsModalOpen(false)}
          onCreate={addPayment}
        />
      ) : null}
      {editingPayment ? (
        <EditPaymentModal
          payment={editingPayment}
          onClose={() => setEditingPaymentId(null)}
          onSave={savePayment}
        />
      ) : null}
    </div>
  );
}

export default ReportPaymentsSection;
