import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
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
  disabled?: boolean;
};

type ModalProps = {
  title: string;
  children: ReactNode;
  onClose: () => void;
  actions: ModalAction[];
  size?: "md" | "lg";
  headerDivider?: boolean;
  autoFocusAction?: boolean;
};

function actionClassName(action: ModalAction, isSingleAction: boolean) {
  if (isSingleAction || action.variant === "primary") {
    return PRIMARY_BUTTON_CLASS;
  }

  return SECONDARY_BUTTON_CLASS;
}

function Modal({
  title,
  children,
  onClose,
  actions,
  size = "md",
  headerDivider = false,
  autoFocusAction = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const actionFocusRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const isSingleAction = actions.length === 1;
  const widthClass =
    size === "lg"
      ? "w-[min(calc(100%-2rem),48rem)]"
      : "w-[min(calc(100%-2rem),42rem)]";
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

    if (autoFocusAction) {
      actionFocusRef.current?.focus();
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    function isInsideModalScrollable(target: EventTarget | null) {
      return (
        target instanceof Element &&
        Boolean(target.closest("[data-modal-panel] [role='listbox']"))
      );
    }

    function preventBackgroundScroll(event: WheelEvent | TouchEvent) {
      if (!isInsideModalScrollable(event.target)) {
        event.preventDefault();
      }
    }

    document.addEventListener("wheel", preventBackgroundScroll, {
      passive: false,
    });
    document.addEventListener("touchmove", preventBackgroundScroll, {
      passive: false,
    });

    function handleCancel(event: Event) {
      event.preventDefault();
      if (
        dialog.querySelector('[role="combobox"][aria-expanded="true"]')
      ) {
        return;
      }

      onClose();
    }

    dialog.addEventListener("cancel", handleCancel);

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("wheel", preventBackgroundScroll);
      document.removeEventListener("touchmove", preventBackgroundScroll);
      dialog.removeEventListener("cancel", handleCancel);
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [autoFocusAction, onClose]);

  function handleBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current) {
      onClose();
    }
  }

  function handleKeyDownCapture(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Escape") {
      return;
    }

    if (
      event.currentTarget.querySelector(
        '[role="combobox"][aria-expanded="true"]',
      )
    ) {
      event.preventDefault();
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
      onKeyDownCapture={handleKeyDownCapture}
      className={`m-auto ${widthClass} overflow-visible border-0 bg-transparent p-0 backdrop:bg-black/50`}
    >
      <div
        data-modal-panel
        className="flex max-h-[90vh] flex-col overflow-hidden rounded-lg bg-white font-[Nunito] shadow-lg"
      >
        <header
          className={`px-6 py-4 sm:px-8 ${
            headerDivider ? "border-b border-gray-200" : ""
          }`}
        >
          <h2
            id={titleId}
            className="text-left text-xl font-extrabold text-gray-900 sm:text-2xl"
          >
            {title}
          </h2>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden px-6 sm:px-8">
          {children}
        </div>

        {actions.length > 0 ? (
          <footer
            data-modal-footer
            className={`flex gap-3 border-t border-gray-200 px-6 py-4 sm:px-8 ${
              isSingleAction ? "justify-center" : "justify-end"
            }`}
          >
            {actions.map((action, index) => (
              <button
                key={action.label}
                type="button"
                ref={(element) => {
                  if (index === focusedActionIndex) {
                    actionFocusRef.current = element;
                  }
                }}
                disabled={action.disabled}
                onClick={action.onClick}
                className={`${actionClassName(action, isSingleAction)} disabled:cursor-not-allowed disabled:opacity-50`}
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
