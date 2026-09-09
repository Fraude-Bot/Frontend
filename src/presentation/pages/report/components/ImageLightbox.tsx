import { useEffect, useRef } from "react";

type ImageLightboxProps = {
  src: string;
  alt: string;
  onClose: () => void;
};

function ImageLightbox({ src, alt, onClose }: ImageLightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
      if (event.key === "Tab") {
        event.preventDefault();
        dialogRef.current?.focus();
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
  }, [onClose]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Vista ampliada: ${alt}`}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 focus:outline-none"
    >
      <button
        type="button"
        aria-label="Cerrar vista ampliada"
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />
      <img
        src={src}
        alt={alt}
        className="relative z-10 max-h-[85vh] max-w-[90vw] object-contain"
      />
    </div>
  );
}

export default ImageLightbox;
