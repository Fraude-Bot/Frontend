import Modal from "@/presentation/shared/components/Modal";

type DiscardChangesModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

function DiscardChangesModal({ onCancel, onConfirm }: DiscardChangesModalProps) {
  return (
    <Modal
      title="¿Estás seguro que quieres salir?"
      onClose={onCancel}
      actions={[
        { label: "Regresar", variant: "secondary", onClick: onConfirm },
        { label: "Continuar", variant: "primary", onClick: onCancel },
      ]}
    >
      <div className="flex min-h-48 items-center justify-center py-8">
        <p className="max-w-lg text-center text-base leading-relaxed text-gray-800">
          Si vuelves al primer paso se borrarán los datos que hayas ingresado.
        </p>
      </div>
    </Modal>
  );
}

export default DiscardChangesModal;
