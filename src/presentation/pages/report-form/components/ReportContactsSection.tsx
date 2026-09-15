import { useState } from "react";
import { getPlatformLabel } from "@/presentation/pages/report/components/contact-platform";
import { getPlatformIconSrc } from "@/presentation/pages/report/components/platform-icons";
import { PlatformIcon } from "@/presentation/pages/report/components/PlatformIcon";
import AddContactModal from "@/presentation/pages/report-form/components/AddContactModal";
import ReportAddTile from "@/presentation/pages/report-form/components/ReportAddTile";
import type { ReportFormContactDraft } from "@/presentation/pages/report-form/components/types";

type ReportContactsSectionProps = {
  description: string;
  contacts: ReportFormContactDraft[];
  onChange: (contacts: ReportFormContactDraft[]) => void;
};

function createContactId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `contact-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function ReportContactsSection({
  description,
  contacts,
  onChange,
}: ReportContactsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function addContact(contact: Omit<ReportFormContactDraft, "id">) {
    onChange([...contacts, { ...contact, id: createContactId() }]);
    setIsModalOpen(false);
  }

  function removeContact(id: string) {
    onChange(contacts.filter((contact) => contact.id !== id));
  }

  return (
    <div className="pt-1">
      <h3 className="font-extrabold text-gray-900">Contactos</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
      <div className="mt-4 flex flex-wrap gap-4">
        {contacts.map((contact) => {
          const platformIconSrc = getPlatformIconSrc(contact.platform);

          return (
            <article
            key={contact.id}
            className="relative flex h-20 min-w-40 max-w-56 flex-col justify-center border border-gray-300 bg-white px-3 pr-8"
          >
            <button
              type="button"
              onClick={() => removeContact(contact.id)}
              aria-label={`Eliminar contacto ${contact.name}`}
              className="absolute top-1 right-1 cursor-pointer px-1 text-lg leading-none text-gray-500 hover:text-gray-900"
            >
              ×
            </button>
            <div className="flex min-w-0 items-center gap-2">
              {platformIconSrc ? (
                <img
                  src={platformIconSrc}
                  alt=""
                  className="h-5 w-5 shrink-0 object-contain"
                />
              ) : (
                <PlatformIcon platform={contact.platform} />
              )}
              <p className="truncate text-sm font-bold text-gray-900">
                {contact.name}
              </p>
            </div>
            <p
              className="mt-1 truncate text-xs text-gray-500"
              title={`${getPlatformLabel(contact.platform)} · ${contact.url}`}
            >
              {contact.url}
            </p>
          </article>
          );
        })}
        <ReportAddTile
          label="Agregar contacto"
          onClick={() => setIsModalOpen(true)}
        />
      </div>
      {isModalOpen ? (
        <AddContactModal
          onClose={() => setIsModalOpen(false)}
          onCreate={addContact}
        />
      ) : null}
    </div>
  );
}

export default ReportContactsSection;
