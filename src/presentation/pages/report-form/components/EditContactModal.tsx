import { useId, useState } from "react";
import { detectContactPlatform } from "@/presentation/pages/report/components/contact-platform";
import type { ReportFormContactDraft } from "@/presentation/pages/report-form/components/types";
import Modal from "@/presentation/shared/components/Modal";

const FIELD_CLASS =
  "h-11 w-full rounded-md border border-gray-300 px-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

const LABEL_CLASS = "mb-2 block font-bold text-gray-900";

type EditContactModalProps = {
  contact: ReportFormContactDraft;
  onClose: () => void;
  onSave: (contact: Omit<ReportFormContactDraft, "id">) => void;
};

function EditContactModal({ contact, onClose, onSave }: EditContactModalProps) {
  const urlId = useId();
  const [url, setUrl] = useState(contact.url);
  const trimmedUrl = url.trim();
  const canSave = trimmedUrl.length > 0;

  function handleSave() {
    const platform = detectContactPlatform(trimmedUrl);
    if (!canSave || platform === null) {
      return;
    }

    onSave({
      platform,
      url: trimmedUrl,
    });
  }

  return (
    <Modal
      title="Editar Contacto"
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
        <label htmlFor={urlId} className={LABEL_CLASS}>
          Número telefónico, Facebook, Instagram, URL...
        </label>
        <input
          id={urlId}
          type="text"
          value={url}
          autoComplete="off"
          placeholder="Ej. (6623145124, https://website.org...)"
          onChange={(event) => setUrl(event.currentTarget.value)}
          className={FIELD_CLASS}
        />
      </div>
    </Modal>
  );
}

export default EditContactModal;
