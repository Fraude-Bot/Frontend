import CollaboratorFormModal from "@/presentation/pages/report-form/components/CollaboratorFormModal";
import type { ReportFormCollaboratorDraft } from "@/presentation/pages/report-form/components/types";

type AddCollaboratorModalProps = {
  onClose: () => void;
  onCreate: (collaborator: Omit<ReportFormCollaboratorDraft, "id">) => void;
};

function AddCollaboratorModal({ onClose, onCreate }: AddCollaboratorModalProps) {
  return (
    <CollaboratorFormModal
      title="Agregar Colaborador"
      submitLabel="Crear"
      initialName=""
      initialAvatarFile={null}
      initialAvatarPath={null}
      initialPayments={[]}
      initialContacts={[]}
      onClose={onClose}
      onSubmit={onCreate}
    />
  );
}

export default AddCollaboratorModal;
