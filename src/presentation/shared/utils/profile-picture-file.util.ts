import { getHttpStatus } from "@/common/utils/http-error.util";

export const MAX_PROFILE_PICTURE_BYTES = 5 * 1024 * 1024;

function isAllowedProfilePictureFormat(file: File) {
  if (
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "image/webp"
  ) {
    return true;
  }

  return /\.(jpe?g|png|webp)$/i.test(file.name);
}

export function validateProfilePicture(file: File) {
  if (!isAllowedProfilePictureFormat(file)) {
    return "Usa una imagen JPG, PNG o WEBP.";
  }

  if (file.size > MAX_PROFILE_PICTURE_BYTES) {
    return "La imagen no puede superar 5 MB.";
  }

  return null;
}

export function profilePictureUploadErrorMessage(error: unknown) {
  if (getHttpStatus(error) === 422) {
    return "Usa una imagen JPG, PNG o WEBP de hasta 5 MB.";
  }

  return "No se pudo subir la foto. Inténtalo de nuevo.";
}
