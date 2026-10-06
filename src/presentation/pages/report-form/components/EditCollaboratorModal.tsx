import CollaboratorFormModal from "@/presentation/pages/report-form/components/CollaboratorFormModal";
import type { ReportFormCollaboratorDraft } from "@/presentation/pages/report-form/components/types";

type EditCollaboratorModalProps = {
  collaborator: ReportFormCollaboratorDraft;
  onClose: () => void;
  onSave: (collaborator: Omit<ReportFormCollaboratorDraft, "id">) => void;
};

function EditCollaboratorModal({
  collaborator,
  onClose,
  onSave,
}: EditCollaboratorModalProps) {
  return (
    <CollaboratorFormModal
      title="Editar Colaborador"
      submitLabel="Guardar"
      initialName={collaborator.name}
      initialAvatarFile={collaborator.avatarFile}
      initialAvatarPath={collaborator.avatarPath}
      initialPayments={collaborator.payments}
      initialContacts={collaborator.contacts}
      onClose={onClose}
      onSubmit={onSave}
    />
  );
}

export default EditCollaboratorModal;
