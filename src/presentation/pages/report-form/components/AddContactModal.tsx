import { useId, useState } from "react";
import {
  detectContactPlatform,
  SOCIAL_FILTERS,
} from "@/presentation/pages/report/components/contact-platform";
import { getPlatformIconSrc } from "@/presentation/pages/report/components/platform-icons";
import type { ReportFormContactDraft } from "@/presentation/pages/report-form/components/types";
import Modal from "@/presentation/shared/components/Modal";
import SearchableSelect from "@/presentation/shared/components/SearchableSelect";

const FIELD_CLASS =
  "h-11 w-full rounded-md border border-gray-300 px-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

const LABEL_CLASS = "mb-2 block font-bold text-gray-900";

const PLATFORM_OPTIONS = SOCIAL_FILTERS.map((filter) => ({
  value: filter.platform,
  label: filter.label,
  iconSrc: getPlatformIconSrc(filter.platform),
}));

type AddContactModalProps = {
  onClose: () => void;
  onCreate: (contact: Omit<ReportFormContactDraft, "id">) => void;
};

function AddContactModal({ onClose, onCreate }: AddContactModalProps) {
  const platformId = useId();
  const urlId = useId();
  const [platform, setPlatform] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const canCreate = platform !== null && url.trim().length > 0;

  function handleCreate() {
    if (!canCreate || platform === null) {
      return;
    }

    onCreate({
      platform,
      url: url.trim(),
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
          disabled: !canCreate,
          onClick: handleCreate,
        },
      ]}
    >
      <div className="grid items-start gap-x-8 gap-y-5 py-5 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor={urlId} className={LABEL_CLASS}>
            Número telefónico, Facebook, Instagram, URL...
          </label>
          <input
            id={urlId}
            type="text"
            value={url}
            autoComplete="off"
            placeholder="Ej. (6623145124, https://website.org...)"
            onChange={(event) => {
              const nextUrl = event.currentTarget.value;
              setUrl(nextUrl);
              setPlatform(detectContactPlatform(nextUrl));
            }}
            className={FIELD_CLASS}
          />
        </div>

        <div>
          <label htmlFor={platformId} className={LABEL_CLASS}>
            Plataforma
          </label>
          <SearchableSelect
            id={platformId}
            value={platform}
            options={PLATFORM_OPTIONS}
            onChange={setPlatform}
            placeholder="Selecciona una plataforma"
            listLabel="Plataformas"
            noResultsText="No hay plataformas con ese nombre"
            disabled
          />
        </div>
      </div>
    </Modal>
  );
}

export default AddContactModal;
