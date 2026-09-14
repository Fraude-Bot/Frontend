import { useEffect, useRef } from "react";

type DiscardChangesModalProps = {
  onCancel: () => void;
  onConfirm: () => void;
};

function DiscardChangesModal({ onCancel, onConfirm }: DiscardChangesModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = [
        ...dialogRef.current.querySelectorAll<HTMLElement>("button"),
      ];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) {
        return;
      }

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocusedRef.current?.focus();
    };
  }, [onCancel]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="discard-changes-title"
      aria-describedby="discard-changes-description"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Cerrar"
        className="absolute inset-0 cursor-pointer bg-black/50"
        onClick={onCancel}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white px-6 py-8 font-[Nunito] shadow-lg sm:px-8">
        <h2
          id="discard-changes-title"
          className="text-center text-xl font-extrabold text-gray-900 sm:text-2xl"
        >
          ¿Seguro que quieres regresar?
        </h2>
        <p
          id="discard-changes-description"
          className="mt-3 text-center text-sm leading-relaxed text-gray-600 sm:text-base"
        >
          Si vuelves al primer paso, se borrarán los datos que hayas ingresado.
        </p>
        <div className="mt-8 flex flex-col-reverse justify-center gap-4 sm:flex-row sm:gap-8">
          <button
            type="button"
            onClick={onConfirm}
            className="min-w-40 cursor-pointer rounded-md border border-orange-500 bg-white px-8 py-2 font-bold text-gray-900 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            Regresar
          </button>
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            className="min-w-40 cursor-pointer rounded-md bg-orange-600 px-8 py-2 font-bold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export default DiscardChangesModal;
