import { useId, useState } from "react";
import { detectContactPlatform } from "@/presentation/pages/report/components/contact-platform";
import Modal from "@/presentation/shared/components/Modal";

const FIELD_CLASS =
  "h-11 w-full rounded-md border border-gray-300 px-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

const LABEL_CLASS = "mb-2 block font-bold text-gray-900";

export type AddContactDraft = {
  platform: string;
  url: string;
};

type AddContactModalProps = {
  onClose: () => void;
  onCreate: (contact: AddContactDraft) => void | Promise<void>;
  errorMessage?: string | null;
  isSubmitting?: boolean;
};

function AddContactModal({
  onClose,
  onCreate,
  errorMessage = null,
  isSubmitting = false,
}: AddContactModalProps) {
  const urlId = useId();
  const [url, setUrl] = useState("");
  const trimmedUrl = url.trim();
  const canCreate = trimmedUrl.length > 0;

  function handleCreate() {
    const platform = detectContactPlatform(trimmedUrl);
    if (!canCreate || platform === null) {
      return;
    }

    onCreate({
      platform,
      url: trimmedUrl,
    });
  }

  return (
    <Modal
      title="Agregar Contacto"
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
      {errorMessage ? (
        <p role="alert" className="pb-5 text-sm font-semibold text-red-800">
          {errorMessage}
        </p>
      ) : null}
    </Modal>
  );
}

export default AddContactModal;
