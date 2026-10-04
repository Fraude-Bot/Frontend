import { useId, useState } from "react";
import {
  detectContactPlatform,
  SOCIAL_FILTERS,
} from "@/presentation/pages/report/components/contact-platform";
import { getPlatformIconSrc } from "@/presentation/pages/report/components/platform-icons";
import {
  detectPaymentType,
  PAYMENT_TYPE_OPTIONS,
} from "@/presentation/pages/report/components/payment-method.util";
import { getPaymentIconSrc } from "@/presentation/pages/report/components/payment-icons";
import PartyPhotoInput from "@/presentation/pages/report-form/components/PartyPhotoInput";
import type {
  ReportFormCollaboratorEntryDraft,
  ReportFormContactDraft,
} from "@/presentation/pages/report-form/components/types";
import Modal from "@/presentation/shared/components/Modal";
import SearchableSelect from "@/presentation/shared/components/SearchableSelect";
import Formatter from "@/presentation/shared/utils/formatter";

const FIELD_CLASS =
  "h-11 w-full rounded-md border border-gray-300 px-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

const LABEL_CLASS = "mb-2 block text-center text-sm font-bold text-gray-900";

const TYPE_OPTIONS = PAYMENT_TYPE_OPTIONS.map((option) => ({
  value: option.value,
  label: option.label,
  iconSrc: getPaymentIconSrc(option.value),
}));

const PLATFORM_OPTIONS = SOCIAL_FILTERS.map((filter) => ({
  value: filter.platform,
  label: filter.label,
  iconSrc: getPlatformIconSrc(filter.platform),
}));

type EntryRow = {
  id: string;
  reference: string;
  type: string | null;
};

type ContactRow = {
  id: string;
  platform: string | null;
  url: string;
};

type CollaboratorFormModalProps = {
  title: string;
  submitLabel: string;
  initialName: string;
  initialAvatarFile: File | null;
  initialAvatarPath: string | null;
  initialPayments: ReportFormCollaboratorEntryDraft[];
  initialContacts: ReportFormContactDraft[];
  onClose: () => void;
  onSubmit: (collaborator: {
    name: string;
    avatarFile: File | null;
    avatarPath: string | null;
    payments: ReportFormCollaboratorEntryDraft[];
    contacts: ReportFormContactDraft[];
  }) => void;
};

function createRowId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `row-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function blankRow(): EntryRow {
  return {
    id: createRowId(),
    reference: "",
    type: null,
  };
}

function seedRows(entries: ReportFormCollaboratorEntryDraft[]): EntryRow[] {
  if (entries.length === 0) {
    return [];
  }

  return entries.map((entry) => ({
    id: entry.id,
    reference: entry.reference,
    type: entry.type,
  }));
}

function isBlank(row: EntryRow) {
  return row.reference.trim() === "";
}

function isComplete(row: EntryRow) {
  return row.reference.trim() !== "" && row.type !== null;
}

function rowsAreValid(rows: EntryRow[]) {
  return rows.every((row) => isBlank(row) || isComplete(row));
}

function toEntries(rows: EntryRow[]): ReportFormCollaboratorEntryDraft[] {
  return rows.filter(isComplete).map((row) => ({
    id: row.id,
    reference: row.reference.trim(),
    type: row.type ?? "",
  }));
}

function seedContacts(entries: ReportFormContactDraft[]): ContactRow[] {
  return entries.map((entry) => ({
    id: entry.id,
    platform: entry.platform,
    url: entry.url,
  }));
}

function blankContact(): ContactRow {
  return {
    id: createRowId(),
    platform: null,
    url: "",
  };
}

function isBlankContact(row: ContactRow) {
  return row.url.trim() === "";
}

function isCompleteContact(row: ContactRow) {
  return row.url.trim() !== "" && row.platform !== null;
}

function contactsAreValid(rows: ContactRow[]) {
  return rows.every((row) => isBlankContact(row) || isCompleteContact(row));
}

function toContacts(rows: ContactRow[]): ReportFormContactDraft[] {
  return rows.filter(isCompleteContact).map((row) => ({
    id: row.id,
    platform: row.platform ?? "",
    url: row.url.trim(),
  }));
}

function EntryRows({
  legend,
  description,
  rows,
  onChange,
  removeLabel,
  addLabel,
}: {
  legend: string;
  description: string;
  rows: EntryRow[];
  onChange: (rows: EntryRow[]) => void;
  removeLabel: string;
  addLabel: string;
}) {
  const headingId = useId();

  function updateRow(id: string, patch: Partial<EntryRow>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  return (
    <section className="min-w-0" aria-labelledby={headingId}>
      <h3 id={headingId} className="text-base font-extrabold text-gray-900">
        {legend}
      </h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
      <div className="mt-4 space-y-3">
        {rows.map((row, index) => (
          <EntryRowFields
            key={row.id}
            row={row}
            showLabels={index === 0}
            removeLabel={removeLabel}
            onRemove={() => onChange(rows.filter((item) => item.id !== row.id))}
            onChange={(patch) => updateRow(row.id, patch)}
          />
        ))}
      </div>
      <button
        type="button"
        aria-label={addLabel}
        onClick={() => onChange([...rows, blankRow()])}
        className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center rounded-md bg-orange-600 text-3xl leading-none font-light text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
      >
        <span aria-hidden="true">+</span>
      </button>
    </section>
  );
}

function EntryRowFields({
  row,
  showLabels,
  removeLabel,
  onRemove,
  onChange,
}: {
  row: EntryRow;
  showLabels: boolean;
  removeLabel: string;
  onRemove: () => void;
  onChange: (patch: Partial<EntryRow>) => void;
}) {
  const referenceId = useId();
  const typeId = useId();

  return (
    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-end gap-3">
      <button
        type="button"
        aria-label={removeLabel}
        onClick={onRemove}
        className="mb-0.5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-gray-300 text-lg leading-none text-gray-500 hover:border-gray-400 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
      >
        <span aria-hidden="true">×</span>
      </button>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label
            htmlFor={referenceId}
            className={showLabels ? LABEL_CLASS : "sr-only"}
          >
            Número de cuenta/tarjeta/wallet
          </label>
          <input
            id={referenceId}
            type="text"
            value={row.reference}
            autoComplete="off"
            placeholder="Ej. (4152316423, 1A1zP1eP5, 100023)"
            onChange={(event) => {
              Formatter.FormatInputAndUpdate(
                event.currentTarget.value,
                (nextReference) => {
                  onChange({
                    reference: nextReference,
                    type: detectPaymentType(nextReference),
                  });
                },
              );
            }}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label
            htmlFor={typeId}
            className={showLabels ? LABEL_CLASS : "sr-only"}
          >
            Tipo de Método
          </label>
          <SearchableSelect
            id={typeId}
            value={row.type}
            options={TYPE_OPTIONS}
            onChange={(type) => onChange({ type })}
            placeholder="Selecciona un tipo"
            listLabel="Tipos de método de pago"
            noResultsText="No hay tipos con ese nombre"
            disabled
          />
        </div>
      </div>
    </div>
  );
}

function ContactRows({
  rows,
  onChange,
}: {
  rows: ContactRow[];
  onChange: (rows: ContactRow[]) => void;
}) {
  const headingId = useId();

  function updateRow(id: string, patch: Partial<ContactRow>) {
    onChange(rows.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  return (
    <section className="min-w-0" aria-labelledby={headingId}>
      <h3 id={headingId} className="text-base font-extrabold text-gray-900">
        Contactos
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        Los perfiles/números que haya utilizado el colaborador para contactarte
      </p>
      <div className="mt-4 space-y-5">
        {rows.map((row, index) => (
          <ContactRowFields
            key={row.id}
            row={row}
            showLabels={index === 0}
            onRemove={() => onChange(rows.filter((item) => item.id !== row.id))}
            onChange={(patch) => updateRow(row.id, patch)}
          />
        ))}
      </div>
      <button
        type="button"
        aria-label="Agregar contacto"
        onClick={() => onChange([...rows, blankContact()])}
        className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center rounded-md bg-orange-600 text-3xl leading-none font-light text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
      >
        <span aria-hidden="true">+</span>
      </button>
    </section>
  );
}

function ContactRowFields({
  row,
  showLabels,
  onRemove,
  onChange,
}: {
  row: ContactRow;
  showLabels: boolean;
  onRemove: () => void;
  onChange: (patch: Partial<ContactRow>) => void;
}) {
  const urlId = useId();
  const platformId = useId();
  const labelClass = showLabels ? LABEL_CLASS : "sr-only";

  return (
    <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-end gap-3">
      <button
        type="button"
        aria-label="Eliminar contacto"
        onClick={onRemove}
        className="mb-0.5 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-gray-300 text-lg leading-none text-gray-500 hover:border-gray-400 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
      >
        <span aria-hidden="true">×</span>
      </button>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor={urlId} className={labelClass}>
            URL
          </label>
          <input
            id={urlId}
            type="text"
            value={row.url}
            autoComplete="off"
            placeholder="https://website.org"
            onChange={(event) => {
              const nextUrl = event.currentTarget.value;
              onChange({
                url: nextUrl,
                platform: detectContactPlatform(nextUrl),
              });
            }}
            className={FIELD_CLASS}
          />
        </div>
        <div>
          <label htmlFor={platformId} className={labelClass}>
            Plataforma
          </label>
          <SearchableSelect
            id={platformId}
            value={row.platform}
            options={PLATFORM_OPTIONS}
            onChange={(platform) => onChange({ platform })}
            placeholder="Selecciona una plataforma"
            listLabel="Plataformas"
            noResultsText="No hay plataformas con ese nombre"
            disabled
          />
        </div>
      </div>
    </div>
  );
}

function CollaboratorFormModal({
  title,
  submitLabel,
  initialName,
  initialAvatarFile,
  initialAvatarPath,
  initialPayments,
  initialContacts,
  onClose,
  onSubmit,
}: CollaboratorFormModalProps) {
  const photoId = useId();
  const nameId = useId();
  const [name, setName] = useState(initialName);
  const [avatarFile, setAvatarFile] = useState<File | null>(initialAvatarFile);
  const [avatarPath, setAvatarPath] = useState<string | null>(initialAvatarPath);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [payments, setPayments] = useState<EntryRow[]>(() =>
    seedRows(initialPayments),
  );
  const [contacts, setContacts] = useState<ContactRow[]>(() =>
    seedContacts(initialContacts),
  );
  const canSubmit =
    name.trim().length > 0 &&
    !isUploadingPhoto &&
    rowsAreValid(payments) &&
    contactsAreValid(contacts);

  function handleSubmit() {
    if (!canSubmit) {
      return;
    }

    onSubmit({
      name: name.trim(),
      avatarFile,
      avatarPath,
      payments: toEntries(payments),
      contacts: toContacts(contacts),
    });
  }

  return (
    <Modal
      title={title}
      size="lg"
      headerDivider
      autoFocusAction={false}
      onClose={onClose}
      actions={[
        { label: "Cerrar", variant: "secondary", onClick: onClose },
        {
          label: submitLabel,
          variant: "primary",
          disabled: !canSubmit,
          onClick: handleSubmit,
        },
      ]}
    >
      <div className="space-y-6 py-5">
        <PartyPhotoInput
          id={photoId}
          file={avatarFile}
          onChange={(nextFile, nextPath) => {
            setAvatarFile(nextFile);
            setAvatarPath(nextPath);
          }}
          onUploadingChange={setIsUploadingPhoto}
          addLabel="Agregar foto del colaborador"
          changeLabel="Cambiar foto del colaborador"
          required={false}
        />

        <div>
          <label htmlFor={nameId} className="mb-2 block font-bold text-gray-900">
            Nombre del colaborador
          </label>
          <input
            id={nameId}
            type="text"
            value={name}
            autoComplete="off"
            placeholder="E.g. (Carlos Ponzi, Ruja Ignatova, Bernard Madoff)"
            onChange={(event) => setName(event.currentTarget.value)}
            className={FIELD_CLASS}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">Opcional</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <EntryRows
          legend="Métodos de pago"
          description="Los números de cuenta/bancos/wallets que esté utilizando el colaborador para captar fondos"
          rows={payments}
          onChange={setPayments}
          removeLabel="Eliminar método de pago"
          addLabel="Agregar método de pago"
        />

        <ContactRows rows={contacts} onChange={setContacts} />
      </div>
    </Modal>
  );
}

export default CollaboratorFormModal;
