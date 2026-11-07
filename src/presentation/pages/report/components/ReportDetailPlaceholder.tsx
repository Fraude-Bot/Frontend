import { useEffect, useState } from "react";
import ReportDetailEntity from "@/core/domain/report/entities/report-detail.entity";
import { getHttpStatus, isCanceledError } from "@/common/utils/http-error.util";
import ImageLightbox from "@/presentation/pages/report/components/ImageLightbox";
import { formatContactDate } from "@/presentation/pages/report/components/contact-date.util";
import { useDependencies } from "@/presentation/providers/useDependencies";
import "@/presentation/shared/styles/report-tags.css";

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="h-4 w-4 shrink-0"
    >
      <path
        d="M19 12H5M12 19l-7-7 7-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="h-4 w-4 shrink-0 text-gray-400"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 10h18M8 3v4M16 3v4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

const DESCRIPTION_PREVIEW_CHARS = 220;

function descriptionParagraphs(description: string) {
  const normalized = description.trim();

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function descriptionPreview(paragraphs: readonly string[]) {
  const fullText = paragraphs.join(" ");
  if (fullText.length <= DESCRIPTION_PREVIEW_CHARS) {
    return fullText;
  }

  return `${fullText.slice(0, DESCRIPTION_PREVIEW_CHARS).trimEnd()}…`;
}

function reportDetailErrorMessage(error: unknown) {
  const status = getHttpStatus(error);

  if (status === 404) {
    return "No encontramos este reporte.";
  }

  if (status === 429) {
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  }

  return "No pudimos cargar el reporte. Revisa tu conexión e inténtalo de nuevo.";
}

type ReportDetailContentProps = {
  report: ReportDetailEntity;
};

function ReportDetailContent({ report }: ReportDetailContentProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const paragraphs = descriptionParagraphs(report.description);
  const fullDescription = paragraphs.join(" ");
  const canExpandDescription =
    fullDescription.length > DESCRIPTION_PREVIEW_CHARS;
  const lightboxSrc =
    lightboxIndex !== null ? report.proofs[lightboxIndex] : null;

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h2 className="max-w-3xl text-xl font-extrabold leading-snug text-gray-900 sm:text-2xl">
          {report.title}
        </h2>
        <div className="flex shrink-0 items-center gap-1.5 text-sm text-gray-500">
          <CalendarIcon />
          <time dateTime={report.createdAt}>
            {formatContactDate(report.createdAt)}
          </time>
        </div>
      </div>

      {report.products.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {report.products.map((product) => (
            <li
              key={product}
              className="report-product-tags__tag report-product-tags__tag--readonly"
            >
              {product}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-6 text-sm leading-relaxed text-gray-800">
        {paragraphs.length === 0 ? (
          <p className="text-gray-500">Sin descripción.</p>
        ) : isDescriptionExpanded ? (
          paragraphs.map((paragraph) => (
            <p key={paragraph} className="mb-4 whitespace-pre-line last:mb-0">
              {paragraph}
            </p>
          ))
        ) : (
          <p className="whitespace-pre-line">
            {descriptionPreview(paragraphs)}
            {canExpandDescription ? (
              <>
                {" "}
                <button
                  type="button"
                  onClick={() => setIsDescriptionExpanded(true)}
                  className="cursor-pointer font-extrabold text-red-600 underline decoration-1 underline-offset-2 hover:text-red-700"
                >
                  Ver más
                </button>
              </>
            ) : null}
          </p>
        )}
        {isDescriptionExpanded && canExpandDescription ? (
          <button
            type="button"
            onClick={() => setIsDescriptionExpanded(false)}
            className="mt-2 cursor-pointer text-sm font-extrabold text-red-600 underline decoration-1 underline-offset-2 hover:text-red-700"
          >
            Ver menos
          </button>
        ) : null}
      </div>

      {report.proofs.length > 0 ? (
        <ul className="mt-8 flex flex-wrap gap-3">
          {report.proofs.map((proofUrl, index) => (
            <li key={`${proofUrl}-${index}`}>
              <button
                type="button"
                onClick={() => setLightboxIndex(index)}
                aria-haspopup="dialog"
                aria-label={`Ver prueba ${index + 1}`}
                className="h-20 w-20 cursor-pointer overflow-hidden border-2 border-gray-300 p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600 sm:h-24 sm:w-24"
              >
                <img
                  src={proofUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {lightboxSrc ? (
        <ImageLightbox
          src={lightboxSrc}
          alt={`Prueba ${(lightboxIndex ?? 0) + 1}`}
          onClose={() => setLightboxIndex(null)}
        />
      ) : null}
    </>
  );
}

type ReportDetailPlaceholderProps = {
  reportId: string;
  onBack: () => void;
};

function ReportDetailPlaceholder({
  reportId,
  onBack,
}: ReportDetailPlaceholderProps) {
  const { findReportByIdUseCase } = useDependencies();
  const [report, setReport] = useState<ReportDetailEntity | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [requestVersion, setRequestVersion] = useState(0);
  const [loadedRequestKey, setLoadedRequestKey] = useState<string | null>(null);

  const requestKey = `${reportId}:${requestVersion}`;
  const isLoading = loadedRequestKey !== requestKey;

  useEffect(() => {
    let ignore = false;

    findReportByIdUseCase
      .execute(reportId)
      .then((result) => {
        if (ignore) {
          return;
        }

        setReport(result);
        setErrorMessage(null);
        setLoadedRequestKey(requestKey);
      })
      .catch((error: unknown) => {
        if (ignore || isCanceledError(error)) {
          return;
        }

        setReport(null);
        setErrorMessage(reportDetailErrorMessage(error));
        setLoadedRequestKey(requestKey);
      });

    return () => {
      ignore = true;
      findReportByIdUseCase.cancel();
    };
  }, [findReportByIdUseCase, reportId, requestKey]);

  return (
    <section className="border border-gray-200 bg-white p-6 sm:p-8">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-sm font-extrabold text-gray-700 hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      >
        <BackIcon />
        Volver al listado
      </button>

      {isLoading ? (
        <p className="py-16 text-center text-sm text-gray-400">
          Cargando reporte...
        </p>
      ) : null}

      {!isLoading && errorMessage ? (
        <div role="alert" className="py-16 text-center">
          <p className="text-sm font-semibold text-red-800">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setRequestVersion((version) => version + 1)}
            className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {!isLoading && report ? (
        <ReportDetailContent key={reportId} report={report} />
      ) : null}
    </section>
  );
}

export default ReportDetailPlaceholder;
