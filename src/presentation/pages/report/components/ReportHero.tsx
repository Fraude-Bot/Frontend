import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { isCanceledError } from "@/common/utils/http-error.util";
import {
  organizationPath,
  reportPartyPath,
  scammerPath,
} from "@/common/app-routes";
import defaultAvatar from "@presentation/assets/default-avatar.png";
import heroRedBackground from "@presentation/assets/hero-red.webp";
import ImageLightbox from "@presentation/pages/report/components/ImageLightbox";
import SummaryItem from "@presentation/pages/report/components/SummaryItem";
import { formatReportDate } from "@presentation/pages/report/components/contact-date.util";
import reportIcons from "@presentation/pages/report/components/icons";
import { ReportHeroProps } from "@presentation/pages/report/components/types";
import DropdownButton from "@presentation/shared/components/DropdownButton";
import { DropdownOption } from "@presentation/shared/components/types";
import { useDependencies } from "@/presentation/providers/useDependencies";
import {
  profilePictureUploadErrorMessage,
  validateProfilePicture,
} from "@/presentation/shared/utils/profile-picture-file.util";

async function copyTextToClipboard(text: string) {
  if (!navigator.clipboard?.writeText) {
    throw new Error("Clipboard unavailable");
  }

  await navigator.clipboard.writeText(text);
}

function getProfilePath(id: string, partyType: ReportHeroProps["partyType"]) {
  return partyType === "scammer" ? scammerPath(id) : organizationPath(id);
}

function SkeletonBar({ className }: { className: string }) {
  return <div className={`motion-safe:animate-pulse rounded bg-gray-200 ${className}`} />;
}

export function ReportHeroSkeleton() {
  const imageSrc = defaultAvatar;

  return (
    <section
      className="bg-cover bg-center px-4 pb-10 pt-28 sm:pb-12 sm:pt-32"
      style={{ backgroundImage: `url(${heroRedBackground})` }}
      aria-busy="true"
      aria-label="Cargando perfil"
    >
      <article className="mx-auto max-w-5xl rounded-2xl bg-white p-5 shadow-xl sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="mx-auto h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-gray-100 sm:h-32 sm:w-32 lg:mx-0">
            <img
              src={imageSrc}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <SkeletonBar className="h-8 w-52 sm:h-9 sm:w-64" />
                <SkeletonBar className="mt-2 h-5 w-40" />
              </div>
              <SkeletonBar className="h-8 w-28" />
            </div>

            <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="min-w-0">
                  <SkeletonBar className="h-3 w-24" />
                  <SkeletonBar className="mt-2 h-5 w-20" />
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 pt-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <SkeletonBar className="h-3 w-24" />
                <SkeletonBar className="mt-2 h-5 w-48" />
              </div>

              <div className="flex shrink-0 gap-2 self-end">
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-md border border-gray-300 px-5 py-2 text-sm font-extrabold text-gray-500 opacity-70"
                >
                  Ayuda (próximamente)
                </button>
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-md bg-gray-200 px-5 py-2 text-sm font-extrabold text-gray-600"
                >
                  Reportar (próximamente)
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}

function ProfilePictureEditButton({
  fileInputId,
  isUploading,
  onClick,
}: {
  fileInputId: string;
  isUploading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={isUploading}
      aria-controls={fileInputId}
      aria-label="Cambiar foto de perfil"
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className="absolute -right-1 -top-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm hover:border-orange-400 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 disabled:cursor-wait disabled:opacity-70"
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    </button>
  );
}

function ReportHero({
  id,
  name,
  type,
  partyType,
  reportDate,
  status,
  reports,
  categories,
  profilePicture,
  onProfilePictureChange,
}: ReportHeroProps) {
  const { storeTemporaryProfilePictureUseCase, updatePartyProfilePictureUseCase } =
    useDependencies();
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const requestId = useRef(0);
  const isMounted = useRef(true);
  const pendingBlobRef = useRef<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string | null>(
    null,
  );
  const imageSrc = pendingPreviewUrl || profilePicture || defaultAvatar;
  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  function revokePendingPreview() {
    if (pendingBlobRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(pendingBlobRef.current);
    }

    pendingBlobRef.current = null;
    setPendingPreviewUrl(null);
  }

  function showPendingPreview(localPreviewUrl: string) {
    if (pendingBlobRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(pendingBlobRef.current);
    }

    pendingBlobRef.current = localPreviewUrl;
    setPendingPreviewUrl(localPreviewUrl);
  }

  useEffect(() => {
    isMounted.current = true;

    return () => {
      isMounted.current = false;
      storeTemporaryProfilePictureUseCase.cancel();
      updatePartyProfilePictureUseCase.cancel();
      revokePendingPreview();
    };
  }, [storeTemporaryProfilePictureUseCase, updatePartyProfilePictureUseCase]);

  function openFileSelector() {
    fileInputRef.current?.click();
  }

  function finishUpload(currentRequestId: number) {
    if (!isMounted.current || currentRequestId !== requestId.current) {
      return;
    }

    setIsUploading(false);
  }

  function upload(nextFile: File) {
    const validationMessage = validateProfilePicture(nextFile);
    if (validationMessage) {
      setUploadErrorMessage(validationMessage);
      return;
    }

    const currentRequestId = ++requestId.current;
    setUploadErrorMessage(null);
    setIsUploading(true);

    const localPreviewUrl = URL.createObjectURL(nextFile);
    showPendingPreview(localPreviewUrl);

    void storeTemporaryProfilePictureUseCase
      .execute(nextFile)
      .then(({ path }) =>
        updatePartyProfilePictureUseCase.execute(id, partyType, path),
      )
      .then(({ path, displayUrl }) => {
        if (currentRequestId !== requestId.current) {
          return;
        }

        revokePendingPreview();
        onProfilePictureChange?.({ path, displayUrl });
        finishUpload(currentRequestId);
      })
      .catch((error: unknown) => {
        if (currentRequestId !== requestId.current) {
          return;
        }

        revokePendingPreview();

        if (!isCanceledError(error) && isMounted.current) {
          setUploadErrorMessage(profilePictureUploadErrorMessage(error));
        }

        finishUpload(currentRequestId);
      });
  }

  const formattedDate = formatReportDate(reportDate);
  const shareUrl = `${window.location.origin}${getProfilePath(id, partyType)}`;
  const shareOptions: DropdownOption[] = [
    {
      id: "copy-link",
      label: "Copiar enlace",
      onClick: () => {
        void copyTextToClipboard(shareUrl)
          .then(() => setShareMessage("Enlace copiado"))
          .catch(() => setShareMessage("No pudimos copiar el enlace"));
      },
    },
    {
      id: "pdf",
      label: "Descargar PDF (próximamente)",
      disabled: true,
      onClick: () => {},
    },
  ];

  return (
    <section
      className="bg-cover bg-center px-4 pb-10 pt-28 sm:pb-12 sm:pt-32"
      style={{ backgroundImage: `url(${heroRedBackground})` }}
    >
      <article className="mx-auto max-w-5xl rounded-2xl bg-white p-5 shadow-xl sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="mx-auto flex flex-col items-center lg:mx-0">
            <div className="relative shrink-0">
              <button
              type="button"
              className="relative h-28 w-28 cursor-pointer overflow-hidden rounded-2xl border border-gray-100 p-0 sm:h-32 sm:w-32"
              aria-haspopup="dialog"
              aria-expanded={isPreviewOpen}
              aria-busy={isUploading}
              aria-label={`Ver foto de ${name}`}
              onClick={() => setIsPreviewOpen(true)}
            >
              <img
                src={imageSrc}
                alt=""
                className="h-full w-full object-cover"
              />
              {isUploading ? (
                <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-bold text-white">
                  Subiendo…
                </span>
              ) : null}
            </button>
            <ProfilePictureEditButton
              fileInputId={fileInputId}
              isUploading={isUploading}
              onClick={openFileSelector}
            />
            <input
              ref={fileInputRef}
              id={fileInputId}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              tabIndex={-1}
              disabled={isUploading}
              aria-label="Cambiar foto de perfil"
              className="sr-only"
              onChange={(event) => {
                const nextFile = event.currentTarget.files?.[0] ?? null;
                event.currentTarget.value = "";
                if (nextFile) {
                  upload(nextFile);
                }
              }}
            />
            </div>
            {uploadErrorMessage ? (
              <p
                role="alert"
                className="mt-2 max-w-xs text-center text-xs font-semibold text-orange-800"
              >
                {uploadErrorMessage}
              </p>
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">
                    {name}
                  </h1>
                  {reportIcons.warning && (
                    <img
                      src={reportIcons.warning}
                      alt=""
                      aria-hidden
                      className="h-6 w-6"
                    />
                  )}
                </div>
                <p className="mt-1 text-base text-gray-500">
                  ID: {id} | {type}
                </p>
              </div>

              <div className="flex flex-col items-end">
                <DropdownButton
                  label="Compartir"
                  options={shareOptions}
                  iconSrc={reportIcons.shareArrow}
                />
                {shareMessage && (
                  <p
                    role="status"
                    className="mt-2 text-xs font-semibold text-gray-600"
                  >
                    {shareMessage}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-gray-100 pt-5 sm:grid-cols-2 lg:grid-cols-3">
              <SummaryItem
                label="Fecha del Reporte"
                value={formattedDate}
                iconSrc={reportIcons.calendar}
              />
              <SummaryItem
                label="Estado"
                value={status}
                iconSrc={reportIcons.status}
              />
              <SummaryItem
                label="Reportes"
                value={String(reports)}
                iconSrc={reportIcons.reports}
              />
            </div>

            <div className="mt-4 flex flex-col gap-4 border-t border-gray-100 pt-4 lg:flex-row lg:items-end lg:justify-between">
              <SummaryItem
                label="Productos"
                value={categories.join(", ")}
                iconSrc={reportIcons.categories}
              />

              <div className="flex shrink-0 gap-2 self-end">
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-md border border-gray-300 px-5 py-2 text-sm font-extrabold text-gray-500"
                >
                  Ayuda (próximamente)
                </button>
                <Link
                  to={reportPartyPath(id, partyType)}
                  className="rounded-md bg-red-600 px-5 py-2 text-sm font-extrabold text-white hover:bg-red-700"
                >
                  Reportar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
      {isPreviewOpen && (
        <ImageLightbox
          src={imageSrc}
          alt={name}
          onClose={closePreview}
        />
      )}
    </section>
  );
}

export default ReportHero;
