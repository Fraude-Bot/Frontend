import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
} from "react";

const PRIMARY_BUTTON_CLASS =
  "cursor-pointer rounded-md bg-orange-600 px-5 py-1.5 font-bold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600";

const SECONDARY_BUTTON_CLASS =
  "cursor-pointer rounded-md border border-orange-500 bg-white px-5 py-1.5 font-bold text-gray-900 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600";

type ModalAction = {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
};

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  actions: ModalAction[];
};

function actionClassName(action: ModalAction, isSingleAction: boolean) {
  if (isSingleAction || action.variant === "primary") {
    return PRIMARY_BUTTON_CLASS;
  }

  return SECONDARY_BUTTON_CLASS;
}

function Modal({ title, children, onClose, actions }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const isSingleAction = actions.length === 1;
  const focusedActionIndex = (() => {
    const primaryIndex = actions.findIndex(
      (action) => action.variant === "primary",
    );
    if (isSingleAction || primaryIndex < 0) {
      return Math.max(0, actions.length - 1);
    }
    return primaryIndex;
  })();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
    }

    function handleCancel(event: Event) {
      event.preventDefault();
      onClose();
    }

    dialog.addEventListener("cancel", handleCancel);

    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [onClose]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      onClose();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
      className="m-auto w-[min(calc(100%-2rem),42rem)] border-0 bg-transparent p-0 backdrop:bg-black/50"
    >
      <div className="flex max-h-[90vh] flex-col overflow-hidden rounded-lg bg-white font-[Nunito] shadow-lg">
        <header className="px-6 py-4 sm:px-8">
          <h2
            id={titleId}
            className="text-left text-xl font-extrabold text-gray-900 sm:text-2xl"
          >
            {title}
          </h2>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 sm:px-8">
          {children}
        </div>

        {actions.length > 0 ? (
          <footer
            className={`flex gap-3 border-t border-gray-200 px-6 py-4 sm:px-8 ${
              isSingleAction ? "justify-center" : "justify-end"
            }`}
          >
            {actions.map((action, index) => (
              <button
                key={action.label}
                type="button"
                autoFocus={index === focusedActionIndex}
                onClick={action.onClick}
                className={actionClassName(action, isSingleAction)}
              >
                {action.label}
              </button>
            ))}
          </footer>
        ) : null}
      </div>
    </dialog>
  );
}

export default Modal;
export type { ModalAction, ModalProps };
