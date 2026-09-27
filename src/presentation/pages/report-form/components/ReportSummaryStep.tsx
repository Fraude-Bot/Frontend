import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "@/common/app-routes";
import ImageLightbox from "@/presentation/pages/report/components/ImageLightbox";
import {
  getPlatformLabel,
  SOCIAL_FILTERS,
} from "@/presentation/pages/report/components/contact-platform";
import { getPlatformIconSrc } from "@/presentation/pages/report/components/platform-icons";
import { PlatformIcon } from "@/presentation/pages/report/components/PlatformIcon";
import { getPaymentLabel } from "@/presentation/pages/report/components/payment-method.util";
import { getPaymentIconSrc } from "@/presentation/pages/report/components/payment-icons";
import type { ReportFormStepProps } from "@/presentation/pages/report-form/components/types";
import "@/presentation/pages/report-form/components/report-tags.css";

const FIELD_CLASS =
  "h-11 w-full border border-gray-300 px-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500";

const CHECKBOX_CLASS =
  "peer h-4 w-4 appearance-none rounded-sm border border-gray-400 bg-white checked:border-orange-600 checked:bg-orange-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600";

const SUMMARY_PAYMENT_LABELS: Record<string, string> = {
  "1": "Número de tarjeta",
  card_number: "Número de tarjeta",
};

function platformName(platform: string) {
  return (
    SOCIAL_FILTERS.find((filter) => filter.platform === platform)?.label ??
    getPlatformLabel(platform)
  );
}

function paymentTypeName(type: string) {
  const key = type.trim().toLowerCase();
  return (
    SUMMARY_PAYMENT_LABELS[key] ??
    getPaymentLabel(type, Number(type))
  );
}

function maskReference(reference: string) {
  const value = reference.trim();
  if (value.length <= 2) {
    return value;
  }

  return `****${value.slice(-2)}`;
}

function FileImage({
  file,
  className,
  label,
}: {
  file: File;
  className: string;
  label: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const closePreview = useCallback(() => {
    setIsPreviewOpen(false);
  }, []);

  useEffect(() => {
    const nextUrl = URL.createObjectURL(file);
    setUrl(nextUrl);

    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [file]);

  if (!url) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsPreviewOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isPreviewOpen}
        aria-label={label}
        className={`${className} cursor-pointer p-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600`}
      >
        <img src={url} alt="" className="h-full w-full object-cover" />
      </button>
      {isPreviewOpen ? (
        <ImageLightbox src={url} alt={label} onClose={closePreview} />
      ) : null}
    </>
  );
}

function ReportSummaryStep({
  draft,
  updateDraft,
  goNext,
  goBack,
}: ReportFormStepProps) {
  const partyName =
    draft.partyType === "company" ? draft.companyName : draft.individualName;
  const termsId = "report-terms";
  const emailId = "report-contact-email";

  return (
    <section className="mx-auto mt-10 w-full max-w-2xl pb-10">
      <h2 className="sr-only">Resumen del reporte</h2>

      <div className="rounded-md border border-gray-300 bg-white">
        <div className="flex">
          <p className="border-r border-b border-gray-300 bg-gray-100 px-4 py-2 text-sm font-bold text-gray-900">
            Resumen del Reporte
          </p>
        </div>

        <div className="space-y-5 px-4 py-5 sm:px-5">
          <div className="flex gap-4">
            {draft.avatarFile ? (
              <FileImage
                file={draft.avatarFile}
                label="Ver foto"
                className="h-16 w-16 shrink-0 overflow-hidden rounded-full"
              />
            ) : (
              <span
                aria-hidden="true"
                className="h-16 w-16 shrink-0 rounded-full bg-gray-100"
              />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Nombre</p>
                  <p className="truncate font-bold text-gray-900">
                    {partyName.trim() || "—"}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-500">Productos</p>
                  <ul className="mt-1 flex flex-wrap gap-2">
                    {draft.products.map((product) => (
                      <li
                        key={product}
                        className="report-product-tags__tag report-product-tags__tag--readonly"
                      >
                        {product}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-500">Título de reporte</p>
                <p className="text-gray-900">
                  {draft.reportTitle.trim() || "—"}
                </p>
              </div>
            </div>
          </div>

          {draft.evidenceFiles.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {draft.evidenceFiles.map((file, index) => (
                <li key={`${file.name}-${file.lastModified}-${index}`}>
                  <FileImage
                    file={file}
                    label={`Ver captura de pantalla ${index + 1}`}
                    className="h-16 w-16 overflow-hidden border border-gray-200"
                  />
                </li>
              ))}
            </ul>
          ) : null}

          <div>
            <p className="text-xs text-gray-500">Descripción de reporte</p>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap text-gray-800">
              {draft.reportDescription.trim() || "—"}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900">Contactos</h3>
            <ul className="mt-3 flex flex-wrap gap-3">
              {draft.contacts.map((contact) => {
                const iconSrc = getPlatformIconSrc(contact.platform);

                return (
                  <li
                    key={contact.id}
                    className="flex min-w-36 flex-col justify-center border border-gray-300 bg-white px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {iconSrc ? (
                        <img
                          src={iconSrc}
                          alt=""
                          className="h-5 w-5 shrink-0 object-contain"
                        />
                      ) : (
                        <PlatformIcon platform={contact.platform} />
                      )}
                      <p className="truncate text-sm font-bold text-gray-900">
                        {platformName(contact.platform)}
                      </p>
                    </div>
                    <p className="mt-1 truncate text-sm text-gray-700">
                      {contact.name}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-900">Métodos de pago</h3>
            <ul className="mt-3 flex flex-wrap gap-3">
              {draft.payments.map((payment) => {
                const iconSrc = getPaymentIconSrc(payment.type);

                return (
                  <li
                    key={payment.id}
                    className="flex min-w-36 flex-col justify-center border border-gray-300 bg-white px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      {iconSrc ? (
                        <img
                          src={iconSrc}
                          alt=""
                          className="h-5 w-5 shrink-0 object-contain"
                        />
                      ) : null}
                      <p className="truncate text-sm font-bold text-gray-900">
                        {paymentTypeName(payment.type)}
                      </p>
                    </div>
                    <p className="mt-1 truncate text-sm text-gray-700">
                      {maskReference(payment.reference)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 text-sm text-gray-800">
        <span className="relative mt-0.5 inline-flex shrink-0">
          <input
            id={termsId}
            type="checkbox"
            checked={draft.acceptedTerms}
            onChange={(event) =>
              updateDraft({ acceptedTerms: event.currentTarget.checked })
            }
            className={CHECKBOX_CLASS}
          />
          <svg
            viewBox="0 0 16 16"
            aria-hidden
            className="pointer-events-none absolute inset-0 hidden h-4 w-4 text-white peer-checked:block"
          >
            <path
              d="M3.5 8.5 6.5 11.5 12.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
        </span>
        <p>
          <label htmlFor={termsId} className="cursor-pointer">
            He leído y acepto los
          </label>{" "}
          <Link
            to={APP_ROUTES.terms}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 hover:underline"
          >
            términos y condiciones de uso
          </Link>.
        </p>
      </div>

      <div className="mt-6">
        <label
          htmlFor={emailId}
          className="mb-2 block font-extrabold text-gray-900"
        >
          Correo electrónico de contacto
        </label>
        <input
          id={emailId}
          type="email"
          autoComplete="email"
          value={draft.contactEmail}
          onChange={(event) =>
            updateDraft({ contactEmail: event.currentTarget.value })
          }
          placeholder="E.g. (micontacto@gmail.com)"
          className={FIELD_CLASS}
        />
      </div>

      <div className="mt-12 flex flex-col-reverse justify-center gap-4 sm:flex-row sm:gap-20">
        <button
          type="button"
          onClick={goBack}
          className="min-w-40 cursor-pointer rounded-md border border-orange-500 bg-white px-8 py-2 font-bold text-gray-900 hover:bg-orange-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        >
          Regresar
        </button>
        <button
          type="button"
          onClick={goNext}
          className="min-w-40 cursor-pointer rounded-md bg-orange-600 px-8 py-2 font-bold text-white hover:bg-orange-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
        >
          Continuar
        </button>
      </div>
    </section>
  );
}

export default ReportSummaryStep;
