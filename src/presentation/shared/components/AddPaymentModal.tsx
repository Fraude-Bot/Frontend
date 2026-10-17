import { useId, useState } from "react";
import { detectPaymentType } from "@/presentation/pages/report/components/payment-method.util";
import Modal from "@/presentation/shared/components/Modal";
import Formatter from "@/presentation/shared/utils/formatter";

const FIELD_CLASS =
  "h-11 w-full rounded-md border border-gray-300 px-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

const LABEL_CLASS = "mb-2 block font-bold text-gray-900";

export type AddPaymentDraft = {
  reference: string;
  type: string;
};

type AddPaymentModalProps = {
  onClose: () => void;
  onCreate: (payment: AddPaymentDraft) => void | Promise<void>;
  errorMessage?: string | null;
  isSubmitting?: boolean;
};

function AddPaymentModal({
  onClose,
  onCreate,
  errorMessage = null,
  isSubmitting = false,
}: AddPaymentModalProps) {
  const referenceId = useId();
  const [reference, setReference] = useState("");
  const trimmedReference = reference.trim();
  const canCreate = trimmedReference.length > 0;

  function handleCreate() {
    const type = detectPaymentType(trimmedReference);
    if (!canCreate || type === null) {
      return;
    }

    onCreate({
      reference: trimmedReference,
      type,
    });
  }

  return (
    <Modal
      title="Agregar Método de Pago"
      size="lg"
      headerDivider
      autoFocusAction={false}
      onClose={onClose}
      actions={[
        { label: "Cerrar", variant: "secondary", onClick: onClose },
        {
          label: "Crear",
          variant: "primary",
          disabled: !canCreate || isSubmitting,
          onClick: handleCreate,
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
      {errorMessage ? (
        <p role="alert" className="pb-5 text-sm font-semibold text-red-800">
          {errorMessage}
        </p>
      ) : null}
    </Modal>
  );
}

export default AddPaymentModal;
