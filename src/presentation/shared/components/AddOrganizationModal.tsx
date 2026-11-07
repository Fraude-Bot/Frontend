import CollaboratorFormModal from "@/presentation/pages/report-form/components/CollaboratorFormModal";
import type { ReportFormCollaboratorDraft } from "@/presentation/pages/report-form/components/types";

type AddOrganizationModalProps = {
  onClose: () => void;
  onCreate: (
    organization: Omit<ReportFormCollaboratorDraft, "id">,
  ) => void | Promise<void>;
  errorMessage?: string | null;
  isSubmitting?: boolean;
  title?: string;
};

function AddOrganizationModal({
  onClose,
  onCreate,
  errorMessage = null,
  isSubmitting = false,
  title = "Agregar Empresa",
}: AddOrganizationModalProps) {
  return (
    <CollaboratorFormModal
      title={title}
      submitLabel="Crear"
      variant="organization"
      initialName=""
      initialAvatarFile={null}
      initialAvatarPath={null}
      initialPayments={[]}
      initialContacts={[]}
      onClose={onClose}
      onSubmit={onCreate}
      errorMessage={errorMessage}
      isSubmitting={isSubmitting}
    />
  );
}

export default AddOrganizationModal;
