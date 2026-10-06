import { useId, useState } from "react";
import {
  detectPaymentType,
  PAYMENT_TYPE_OPTIONS,
} from "@/presentation/pages/report/components/payment-method.util";
import { getPaymentIconSrc } from "@/presentation/pages/report/components/payment-icons";
import type { ReportFormPaymentDraft } from "@/presentation/pages/report-form/components/types";
import Modal from "@/presentation/shared/components/Modal";
import SearchableSelect from "@/presentation/shared/components/SearchableSelect";
import Formatter from "@/presentation/shared/utils/formatter";

const FIELD_CLASS =
  "h-11 w-full rounded-md border border-gray-300 px-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

const LABEL_CLASS = "mb-2 block font-bold text-gray-900";

const TYPE_OPTIONS = PAYMENT_TYPE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
  iconSrc: getPaymentIconSrc(option.value),
}));

type EditPaymentModalProps = {
  payment: ReportFormPaymentDraft;
  onClose: () => void;
  onSave: (payment: Omit<ReportFormPaymentDraft, "id">) => void;
};

function EditPaymentModal({ payment, onClose, onSave }: EditPaymentModalProps) {
  const referenceId = useId();
  const typeId = useId();
  const [reference, setReference] = useState(payment.reference);
  const [type, setType] = useState<string | null>(payment.type);
  const canSave = reference.trim().length > 0 && type !== null;

  function handleSave() {
    if (!canSave || type === null) {
      return;
    }

    onSave({
      reference: reference.trim(),
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
      <div className="grid items-start gap-x-8 gap-y-5 py-5 sm:grid-cols-3">
        <div className="sm:col-span-2">
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
                (nextReference) => {
                  setReference(nextReference);
                  setType(detectPaymentType(nextReference));
                },
              );
            }}
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor={typeId} className={LABEL_CLASS}>
            Tipo de Método
          </label>
          <SearchableSelect
            id={typeId}
            value={type}
            options={TYPE_OPTIONS}
            onChange={setType}
            placeholder="Selecciona un tipo"
            listLabel="Tipos de método de pago"
            noResultsText="No hay tipos con ese nombre"
            disabled
          />
        </div>
      </div>
    </Modal>
  );
}

export default EditPaymentModal;
