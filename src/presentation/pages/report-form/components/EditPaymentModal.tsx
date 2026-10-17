import { useId, useState } from "react";
import { detectPaymentType } from "@/presentation/pages/report/components/payment-method.util";
import type { ReportFormPaymentDraft } from "@/presentation/pages/report-form/components/types";
import Modal from "@/presentation/shared/components/Modal";
import Formatter from "@/presentation/shared/utils/formatter";

const FIELD_CLASS =
  "h-11 w-full rounded-md border border-gray-300 px-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

const LABEL_CLASS = "mb-2 block font-bold text-gray-900";

type EditPaymentModalProps = {
  payment: ReportFormPaymentDraft;
  onClose: () => void;
  onSave: (payment: Omit<ReportFormPaymentDraft, "id">) => void;
};

function EditPaymentModal({ payment, onClose, onSave }: EditPaymentModalProps) {
  const referenceId = useId();
  const [reference, setReference] = useState(payment.reference);
  const trimmedReference = reference.trim();
  const canSave = trimmedReference.length > 0;

  function handleSave() {
    const type = detectPaymentType(trimmedReference);
    if (!canSave || type === null) {
      return;
    }

    onSave({
      reference: trimmedReference,
      type,
    });
  }

  return (
    <Modal
      title="Editar Método de Pago"
      size="lg"
      headerDivider
      autoFocusAction={false}
      onClose={onClose}
      actions={[
        { label: "Cerrar", variant: "secondary", onClick: onClose },
        {
          label: "Guardar",
          variant: "primary",
          disabled: !canSave,
          onClick: handleSave,
        },
      ]}
    >
      <div className="py-5">
        <label htmlFor={referenceId} className={LABEL_CLASS}>
          Número de tarjeta/cuenta/wallet/referencia
        </label>
        <input
          id={referenceId}
          type="text"
          value={reference}
          autoComplete="off"
          placeholder="Ej. (4152316423, 1A1zP1eP5, 100023)"
          onChange={(event) => {
            Formatter.FormatInputAndUpdate(
              event.currentTarget.value,
              setReference,
            );
          }}
          className={FIELD_CLASS}
        />
      </div>
    </Modal>
  );
}

export default EditPaymentModal;
