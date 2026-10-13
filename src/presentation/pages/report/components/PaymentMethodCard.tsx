import { useEffect, useRef, useState } from "react";
import PaymentMethodSummaryEntity from "@/core/domain/payment-method/entities/payment-method-summary.entity";
import { formatContactDate } from "@presentation/pages/report/components/contact-date.util";
import { getPaymentIconSrc } from "@presentation/pages/report/components/payment-icons";
import { getPaymentLabel } from "@presentation/pages/report/components/payment-method.util";

const COPIED_VISIBLE_MS = 1800;

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-4 w-4">
      <path
        d="M5 12.5 9.5 17 19 7"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="h-4 w-4 shrink-0 text-gray-400"
    >
      <rect
        x="8"
        y="8"
        width="12"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M6 16H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
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

function copyWithSelection(text: string) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "0";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error("Clipboard unavailable");
  }
}

async function copyTextToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      copyWithSelection(text);
      return;
    }
  }

  copyWithSelection(text);
}

function PaymentMethodCard({
  paymentMethod,
}: {
  paymentMethod: PaymentMethodSummaryEntity;
}) {
  const [copied, setCopied] = useState(false);
  const hideTimer = useRef<number | null>(null);
  const typeKey = String(paymentMethod.paymentType);
  const typeLabel = getPaymentLabel(typeKey, paymentMethod.paymentType);
  const iconSrc = getPaymentIconSrc(typeKey);
  const formattedDate = formatContactDate(paymentMethod.createdAt);

  useEffect(() => {
    return () => {
      if (hideTimer.current !== null) {
        window.clearTimeout(hideTimer.current);
      }
    };
  }, []);

  const handleCopy = () => {
    void copyTextToClipboard(paymentMethod.reference)
      .then(() => {
        setCopied(true);
        if (hideTimer.current !== null) {
          window.clearTimeout(hideTimer.current);
        }
        hideTimer.current = window.setTimeout(() => {
          setCopied(false);
          hideTimer.current = null;
        }, COPIED_VISIBLE_MS);
      })
      .catch(() => {
        setCopied(false);
      });
  };

  return (
    <article>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copiar ${typeLabel}: ${paymentMethod.reference}`}
        className={`relative block w-full cursor-pointer rounded-md border px-4 py-3 text-left motion-safe:transition-colors motion-safe:duration-200 ${
          copied
            ? "border-emerald-300 bg-emerald-50/60"
            : "border-gray-200 hover:bg-gray-50"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex min-w-0 items-center gap-2 ${copied ? "pr-24" : ""}`}
          >
            {iconSrc ? (
              <img
                src={iconSrc}
                alt=""
                className="h-5 w-5 shrink-0 object-contain"
              />
            ) : null}
            <h3 className="truncate text-sm font-bold text-gray-900">
              {typeLabel}
            </h3>
          </div>
          <span
            aria-hidden
            className={`absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700 motion-safe:transition motion-safe:duration-200 ${
              copied
                ? "translate-y-0 scale-100 opacity-100"
                : "pointer-events-none -translate-y-1 scale-95 opacity-0"
            }`}
          >
            <CheckIcon />
            Copiado
          </span>
        </div>

        <div className="mt-3 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-1.5">
            <CopyIcon />
            <span className="truncate" title={paymentMethod.reference}>
              {paymentMethod.reference}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <CalendarIcon />
            <time dateTime={paymentMethod.createdAt}>{formattedDate}</time>
          </div>
        </div>

        <span className="sr-only" aria-live="polite">
          {copied ? "Copiado" : ""}
        </span>
      </button>
    </article>
  );
}

export default PaymentMethodCard;
