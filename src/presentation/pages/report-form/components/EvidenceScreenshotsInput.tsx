import { useCallback, useEffect, useRef, useState } from "react";
import { getHttpStatus, isCanceledError } from "@/common/utils/http-error.util";
import ImageLightbox from "@/presentation/pages/report/components/ImageLightbox";
import { useDependencies } from "@/presentation/providers/useDependencies";

const MAX_PROOF_BYTES = 5 * 1024 * 1024;

const TILE_CLASS = "h-16 w-16 overflow-hidden border-2 border-gray-300";

const DELETE_BUTTON_CLASS =
  "absolute -right-1 -top-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-lg leading-none text-gray-600 hover:border-orange-400 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600";

type EvidenceScreenshotsInputProps = {
  id: string;
  files: File[];
  paths: string[];
  onChange: (files: File[], paths: string[]) => void;
};

function isJpegOrPng(file: File) {
  if (file.type === "image/jpeg" || file.type === "image/png") {
    return true;
  }

  return /\.(jpe?g|png)$/i.test(file.name);
}

function isValidProof(file: File) {
  return isJpegOrPng(file) && file.size <= MAX_PROOF_BYTES;
}

function uploadErrorMessage(error: unknown) {
  if (getHttpStatus(error) === 422) {
    return "Usa imágenes JPG o PNG de hasta 5 MB.";
  }

  return "No se pudieron subir las capturas. Inténtalo de nuevo.";
}

function EvidenceShot({
  file,
  viewLabel,
  removeLabel,
  onRemove,
  busy = false,
}: {
  file: File;
  viewLabel: string;
  removeLabel: string;
  onRemove: () => void;
  busy?: boolean;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  useEffect(() => {
    const nextUrl = URL.createObjectURL(file);
    setPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [file]);

  function remove() {
    setIsPreviewOpen(false);
    onRemove();
  }

  return (
    <div className="relative h-16 w-16">
      <button
        type="button"
        onClick={() => setIsPreviewOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isPreviewOpen}
        aria-label={viewLabel}
        aria-busy={busy}
        className={`${TILE_CLASS} relative cursor-pointer p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600`}
      >
        {previewUrl ? (
          <img src={previewUrl} alt="" className="h-full w-full object-cover" />
        ) : null}
        {busy ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/45 px-1 text-center text-[10px] font-bold leading-tight text-white">
            Subiendo…
          </span>
        ) : null}
      </button>
      <button
        type="button"
        onClick={remove}
        aria-label={removeLabel}
        className={DELETE_BUTTON_CLASS}
      >
        ×
      </button>
      {isPreviewOpen && previewUrl ? (
        <ImageLightbox
          src={previewUrl}
          alt={viewLabel}
          onClose={closePreview}
        />
      ) : null}
    </div>
  );
}

function EvidenceScreenshotsInput({
  id,
  files,
  paths,
  onChange,
}: EvidenceScreenshotsInputProps) {
  const { storeTemporaryProofsUseCase } = useDependencies();
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const requestId = useRef(0);
  const isMounted = useRef(true);
  const filesRef = useRef(files);
  const pathsRef = useRef(paths);

  useEffect(() => {
    filesRef.current = files;
    pathsRef.current = paths;
  }, [files, paths]);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  function finishUpload(currentRequestId: number) {
    if (!isMounted.current || currentRequestId !== requestId.current) {
      return;
    }

    setPendingFiles([]);
  }

  function upload(selected: File[]) {
    const accepted = selected.filter(isValidProof);
    const rejectedCount = selected.length - accepted.length;

    if (rejectedCount > 0) {
      setErrorMessage("Usa imágenes JPG o PNG de hasta 5 MB.");
    } else {
      setErrorMessage(null);
    }

    if (accepted.length === 0) {
      return;
    }

    const currentRequestId = ++requestId.current;
    setPendingFiles(accepted);

    void storeTemporaryProofsUseCase
      .execute(accepted)
      .then((storedPaths) => {
        if (currentRequestId !== requestId.current) {
          return;
        }

        onChange(
          [...filesRef.current, ...accepted],
          [...pathsRef.current, ...storedPaths],
        );
        finishUpload(currentRequestId);
      })
      .catch((error: unknown) => {
        if (
          currentRequestId !== requestId.current ||
          isCanceledError(error)
        ) {
          return;
        }

        if (isMounted.current) {
          setErrorMessage(uploadErrorMessage(error));
        }

        finishUpload(currentRequestId);
      });
  }

  function cancelUpload() {
    requestId.current += 1;
    storeTemporaryProofsUseCase.cancel();
    setPendingFiles([]);
  }

  function removeShot(index: number) {
    onChange(
      files.filter((_, fileIndex) => fileIndex !== index),
      paths.filter((_, pathIndex) => pathIndex !== index),
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-start gap-3">
        {files.map((file, index) => (
          <EvidenceShot
            key={`${file.name}-${file.lastModified}-${index}`}
            file={file}
            viewLabel={`Ver captura de pantalla ${index + 1}`}
            removeLabel={`Eliminar captura de pantalla ${index + 1}`}
            onRemove={() => removeShot(index)}
          />
        ))}
        {pendingFiles.map((file, index) => (
          <EvidenceShot
            key={`pending-${file.name}-${file.lastModified}-${index}`}
            file={file}
            viewLabel={`Ver captura de pantalla ${files.length + index + 1}`}
            removeLabel="Cancelar subida"
            onRemove={cancelUpload}
            busy
          />
        ))}
        <label
          htmlFor={id}
          className="flex h-16 w-16 cursor-pointer items-center justify-center border-2 border-dashed border-gray-500 text-4xl font-light text-gray-900 hover:border-orange-500 hover:bg-orange-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange-600"
        >
          <span aria-hidden="true">+</span>
          <span className="sr-only">Agregar capturas de pantalla</span>
          <input
            id={id}
            type="file"
            accept="image/jpeg,image/png"
            multiple
            aria-label="Agregar capturas de pantalla"
            className="sr-only"
            onChange={(event) => {
              const selected = Array.from(event.currentTarget.files ?? []);
              event.currentTarget.value = "";
              if (selected.length > 0) {
                upload(selected);
              }
            }}
          />
        </label>
      </div>
      {errorMessage ? (
        <p role="alert" className="mt-3 text-sm text-orange-800">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export default EvidenceScreenshotsInput;
