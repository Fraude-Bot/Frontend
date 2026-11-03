import { getHttpStatus } from "@/common/utils/http-error.util";

export const MAX_PROFILE_PICTURE_BYTES = 5 * 1024 * 1024;

function isJpegOrPng(file: File) {
  if (file.type === "image/jpeg" || file.type === "image/png") {
    return true;
  }

  return /\.(jpe?g|png)$/i.test(file.name);
}

export function validateProfilePicture(file: File) {
  if (!isJpegOrPng(file)) {
    return "Usa una imagen JPG o PNG.";
  }

  if (file.size > MAX_PROFILE_PICTURE_BYTES) {
    return "La imagen no puede superar 5 MB.";
  }

  return null;
}

export function profilePictureUploadErrorMessage(error: unknown) {
  if (getHttpStatus(error) === 422) {
    return "Usa una imagen JPG o PNG de hasta 5 MB.";
  }

  return "No se pudo subir la foto. Inténtalo de nuevo.";
}
