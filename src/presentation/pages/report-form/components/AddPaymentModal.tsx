import { useId, useState } from "react";
import { PAYMENT_TYPE_OPTIONS } from "@/presentation/pages/report/components/payment-method.util";
import type { ReportFormPaymentDraft } from "@/presentation/pages/report-form/components/types";
import Modal from "@/presentation/shared/components/Modal";
import SearchableSelect from "@/presentation/shared/components/SearchableSelect";

const FIELD_CLASS =
  "h-11 w-full rounded-md border border-gray-300 px-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

const LABEL_CLASS = "mb-2 block font-bold text-gray-900";

const TYPE_OPTIONS = PAYMENT_TYPE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
}));

type AddPaymentModalProps = {
  onClose: () => void;
  onCreate: (payment: Omit<ReportFormPaymentDraft, "id">) => void;
};

function AddPaymentModal({ onClose, onCreate }: AddPaymentModalProps) {
  const referenceId = useId();
  const holderId = useId();
  const typeId = useId();
  const [reference, setReference] = useState("");
  const [holder, setHolder] = useState("");
  const [type, setType] = useState<string | null>(null);
  const canCreate =
    reference.trim().length > 0 &&
    holder.trim().length > 0 &&
    type !== null;

  function handleCreate() {
    if (!canCreate || type === null) {
      return;
    }

    onCreate({
      reference: reference.trim(),
      holder: holder.trim(),
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
          disabled: !canCreate,
          onClick: handleCreate,
        },
      ]}
    >
      <div className="grid items-start gap-x-8 gap-y-5 py-5 sm:grid-cols-2">
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
            onChange={(event) => setReference(event.currentTarget.value)}
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor={holderId} className={LABEL_CLASS}>
            Titular de la Cuenta
          </label>
          <input
            id={holderId}
            type="text"
            value={holder}
            autoComplete="off"
            placeholder="Ej. (José Lopez, Armando Caveira...)"
            onChange={(event) => setHolder(event.currentTarget.value)}
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
          />
        </div>
      </div>
    </Modal>
  );
}

export default AddPaymentModal;
