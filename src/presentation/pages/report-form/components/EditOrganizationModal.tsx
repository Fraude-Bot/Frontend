import CollaboratorFormModal from "@/presentation/pages/report-form/components/CollaboratorFormModal";
import type { ReportFormCollaboratorDraft } from "@/presentation/pages/report-form/components/types";

type EditOrganizationModalProps = {
  organization: ReportFormCollaboratorDraft;
  onClose: () => void;
  onSave: (organization: Omit<ReportFormCollaboratorDraft, "id">) => void;
};

function EditOrganizationModal({
  organization,
  onClose,
  onSave,
}: EditOrganizationModalProps) {
  return (
    <CollaboratorFormModal
      title="Editar Organización"
      submitLabel="Guardar"
      variant="organization"
      initialName={organization.name}
      initialAvatarFile={organization.avatarFile}
      initialAvatarPath={organization.avatarPath}
      initialPayments={organization.payments}
      initialContacts={organization.contacts}
      onClose={onClose}
      onSubmit={onSave}
    />
  );
}

export default EditOrganizationModal;
