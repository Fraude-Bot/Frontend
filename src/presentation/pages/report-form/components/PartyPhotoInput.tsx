import { useCallback, useEffect, useRef, useState } from "react";
import { getHttpStatus, isCanceledError } from "@/common/utils/http-error.util";
import ImageLightbox from "@/presentation/pages/report/components/ImageLightbox";
import { useDependencies } from "@/presentation/providers/useDependencies";

const MAX_PROFILE_PICTURE_BYTES = 5 * 1024 * 1024;

type PartyPhotoInputProps = {
  id: string;
  file: File | null;
  onChange: (file: File | null, path: string | null) => void;
  onUploadingChange?: (uploading: boolean) => void;
  addLabel: string;
  changeLabel: string;
  invalid?: boolean;
  describedBy?: string;
  required?: boolean;
};

function isJpegOrPng(file: File) {
  if (file.type === "image/jpeg" || file.type === "image/png") {
    return true;
  }

  return /\.(jpe?g|png)$/i.test(file.name);
}

function validateProfilePicture(file: File) {
  if (!isJpegOrPng(file)) {
    return "Usa una imagen JPG o PNG.";
  }

  if (file.size > MAX_PROFILE_PICTURE_BYTES) {
    return "La imagen no puede superar 5 MB.";
  }

  return null;
}

function uploadErrorMessage(error: unknown) {
  if (getHttpStatus(error) === 422) {
    return "Usa una imagen JPG o PNG de hasta 5 MB.";
  }

  return "No se pudo subir la foto. Inténtalo de nuevo.";
}

function PartyPhotoInput({
  id,
  file,
  onChange,
  onUploadingChange,
  addLabel,
  changeLabel,
  invalid = false,
  describedBy,
  required = true,
}: PartyPhotoInputProps) {
  const { storeTemporaryProfilePictureUseCase } = useDependencies();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const requestId = useRef(0);
  const isMounted = useRef(true);
  const previewFile = pendingFile ?? file;
  const label = previewFile ? changeLabel : addLabel;
  const circleBorder = invalid ? "border-red-600" : "border-gray-400";
  const viewLabel = addLabel.replace(/^Agregar /, "Ver ");
  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!previewFile) {
      setPreviewUrl(null);
      return;
    }

    const nextUrl = URL.createObjectURL(previewFile);
    setPreviewUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [previewFile]);

  function setUploading(uploading: boolean) {
    setIsUploading(uploading);
    onUploadingChange?.(uploading);
  }

  function finishUpload(currentRequestId: number) {
    if (!isMounted.current || currentRequestId !== requestId.current) {
      return;
    }

    setPendingFile(null);
    setUploading(false);
  }

  function upload(nextFile: File) {
    const validationMessage = validateProfilePicture(nextFile);
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    const currentRequestId = ++requestId.current;
    setErrorMessage(null);
    setPendingFile(nextFile);
    setUploading(true);

    void storeTemporaryProfilePictureUseCase
      .execute(nextFile)
      .then((path) => {
        if (currentRequestId !== requestId.current) {
          return;
        }

        onChange(nextFile, path);
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

  function removePhoto() {
    setIsPreviewOpen(false);

    if (isUploading) {
      requestId.current += 1;
      storeTemporaryProfilePictureUseCase.cancel();
      setPendingFile(null);
      setUploading(false);
      return;
    }

    setErrorMessage(null);
    onChange(null, null);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        {previewUrl ? (
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isPreviewOpen}
            aria-busy={isUploading}
            aria-label={viewLabel}
            className={`relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed p-0 text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 ${circleBorder}`}
          >
            <img
              src={previewUrl}
              alt=""
              className="h-full w-full object-cover"
            />
            {isUploading ? (
              <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-bold text-white">
                Subiendo…
              </span>
            ) : null}
          </button>
        ) : (
          <label
            htmlFor={id}
            className={`relative flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed text-5xl font-light text-gray-900 transition-colors hover:bg-orange-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-orange-600 ${circleBorder} ${invalid ? "" : "hover:border-orange-500"}`}
          >
            <span aria-hidden="true">+</span>
            <span className="sr-only">{label}</span>
          </label>
        )}
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png"
          aria-label={label}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          required={required}
          className="sr-only"
          onChange={(event) => {
            const nextFile = event.currentTarget.files?.[0] ?? null;
            event.currentTarget.value = "";
            if (nextFile) {
              upload(nextFile);
            }
          }}
        />
        {previewFile ? (
          <button
            type="button"
            onClick={removePhoto}
            aria-label={isUploading ? "Cancelar subida" : "Eliminar foto"}
            className="absolute -right-1 -top-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-lg leading-none text-gray-600 hover:border-orange-400 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          >
            ×
          </button>
        ) : null}
      </div>
      {isPreviewOpen && previewUrl ? (
        <ImageLightbox
          src={previewUrl}
          alt={viewLabel}
          onClose={closePreview}
        />
      ) : null}
      {errorMessage ? (
        <p role="alert" className="mt-3 text-center text-sm text-orange-800">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

export default PartyPhotoInput;
