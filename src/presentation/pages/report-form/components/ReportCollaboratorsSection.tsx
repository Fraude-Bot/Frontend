import { useEffect, useState } from "react";
import AddCollaboratorModal from "@/presentation/pages/report-form/components/AddCollaboratorModal";
import EditCollaboratorModal from "@/presentation/pages/report-form/components/EditCollaboratorModal";
import ReportAddTile from "@/presentation/pages/report-form/components/ReportAddTile";
import type { ReportFormCollaboratorDraft } from "@/presentation/pages/report-form/components/types";

type ReportCollaboratorsSectionProps = {
  collaborators: ReportFormCollaboratorDraft[];
  onChange: (collaborators: ReportFormCollaboratorDraft[]) => void;
};

function createCollaboratorId() {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `collaborator-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function CollaboratorAvatar({ file, name }: { file: File; name: string }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [file]);

  if (!url) {
    return null;
  }

  return (
    <img
      src={url}
      alt=""
      className="pointer-events-none h-10 w-10 shrink-0 rounded-full object-cover"
      title={name}
    />
  );
}

function entrySummary(collaborator: ReportFormCollaboratorDraft) {
  const parts: string[] = [];

  if (collaborator.payments.length > 0) {
    parts.push(
      collaborator.payments.length === 1
        ? "1 método de pago"
        : `${collaborator.payments.length} métodos de pago`,
    );
  }

  if (collaborator.contacts.length > 0) {
    parts.push(
      collaborator.contacts.length === 1
        ? "1 contacto"
        : `${collaborator.contacts.length} contactos`,
    );
  }

  return parts.join(" · ");
}

function ReportCollaboratorsSection({
  collaborators,
  onChange,
}: ReportCollaboratorsSectionProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollaboratorId, setEditingCollaboratorId] = useState<
    string | null
  >(null);
  const editingCollaborator =
    collaborators.find(
      (collaborator) => collaborator.id === editingCollaboratorId,
    ) ?? null;

  function addCollaborator(
    collaborator: Omit<ReportFormCollaboratorDraft, "id">,
  ) {
    onChange([
      ...collaborators,
      { ...collaborator, id: createCollaboratorId() },
    ]);
    setIsModalOpen(false);
  }

  function saveCollaborator(
    collaborator: Omit<ReportFormCollaboratorDraft, "id">,
  ) {
    if (editingCollaboratorId === null) {
      return;
    }

    onChange(
      collaborators.map((item) =>
        item.id === editingCollaboratorId
          ? { ...collaborator, id: item.id }
          : item,
      ),
    );
    setEditingCollaboratorId(null);
  }

  function removeCollaborator(id: string) {
    onChange(collaborators.filter((collaborator) => collaborator.id !== id));
    if (editingCollaboratorId === id) {
      setEditingCollaboratorId(null);
    }
  }

  return (
    <div className="pt-1">
      <h3 className="font-extrabold text-gray-900">
        Colaborador <span className="uppercase">(Opcional)</span>
      </h3>
      <p className="mt-1 text-sm text-gray-600">
        Personas que hayan colaborado con la empresa
      </p>
      <div className="mt-4 flex flex-wrap gap-4">
        {collaborators.map((collaborator) => {
          const summary = entrySummary(collaborator);

          return (
            <article
              key={collaborator.id}
              className="relative flex h-20 min-w-40 max-w-64 items-center gap-3 border border-gray-300 bg-white px-3 pr-8 transition-colors hover:border-orange-400 hover:bg-orange-50"
            >
              <button
                type="button"
                aria-label={`Editar colaborador ${collaborator.name}`}
                title={summary || collaborator.name}
                onClick={() => setEditingCollaboratorId(collaborator.id)}
                className="absolute inset-0 cursor-pointer border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
              />
              <button
                type="button"
                onClick={() => removeCollaborator(collaborator.id)}
                aria-label={`Eliminar colaborador ${collaborator.name}`}
                className="absolute top-1 right-1 z-10 cursor-pointer px-1 text-lg leading-none text-gray-500 hover:text-gray-900"
              >
                ×
              </button>
              {collaborator.avatarFile ? (
                <CollaboratorAvatar
                  file={collaborator.avatarFile}
                  name={collaborator.name}
                />
              ) : null}
              <div className="min-w-0">
                <p className="pointer-events-none truncate text-sm font-bold text-gray-900">
                  {collaborator.name}
                </p>
                {summary ? (
                  <p className="pointer-events-none mt-1 truncate text-xs text-gray-500">
                    {summary}
                  </p>
                ) : null}
              </div>
            </article>
          );
        })}
        <ReportAddTile
          label="Agregar colaborador"
          onClick={() => setIsModalOpen(true)}
        />
      </div>
      {isModalOpen ? (
        <AddCollaboratorModal
          onClose={() => setIsModalOpen(false)}
          onCreate={addCollaborator}
        />
      ) : null}
      {editingCollaborator ? (
        <EditCollaboratorModal
          collaborator={editingCollaborator}
          onClose={() => setEditingCollaboratorId(null)}
          onSave={saveCollaborator}
        />
      ) : null}
    </div>
  );
}

export default ReportCollaboratorsSection;
