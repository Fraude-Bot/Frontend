import CollaboratorFormModal from "@/presentation/pages/report-form/components/CollaboratorFormModal";
import type { ReportFormCollaboratorDraft } from "@/presentation/pages/report-form/components/types";

type AddOrganizationModalProps = {
  onClose: () => void;
  onCreate: (organization: Omit<ReportFormCollaboratorDraft, "id">) => void;
};

function AddOrganizationModal({ onClose, onCreate }: AddOrganizationModalProps) {
  return (
    <CollaboratorFormModal
      title="Agregar Organización"
      submitLabel="Crear"
      variant="organization"
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

export default AddOrganizationModal;
