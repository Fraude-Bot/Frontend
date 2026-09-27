import { getContactHref } from "@presentation/pages/report/components/contact-platform";
import { APP_ROUTES } from "@/common/app-routes";
import Formatter from "@/presentation/shared/utils/formatter";

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  "1": "Tarjeta",
  "2": "CLABE",
  "3": "Número de cuenta",
  "4": "Wallet",
  "5": "Otro",
  card_number: "Tarjeta",
  clabe: "CLABE",
  account_number: "Número de cuenta",
  wallet: "Wallet",
  other: "Otro",
};

export const PAYMENT_TYPE_OPTIONS = [
  { value: "1", label: "Tarjeta" },
  { value: "2", label: "CLABE" },
  { value: "3", label: "Número de cuenta" },
  { value: "4", label: "Wallet" },
  { value: "5", label: "Otro" },
] as const;

function normalizePaymentTypeKey(value: string | number): string {
  return String(value).trim().toLowerCase();
}

function getPaymentLabel(label: string, paymentType?: number): string {
  if (paymentType !== undefined) {
    return PAYMENT_TYPE_LABELS[String(paymentType)] ?? label;
  }

  const normalizedLabel = normalizePaymentTypeKey(label);
  if (label && !/^\d+$/.test(label)) {
    return PAYMENT_TYPE_LABELS[normalizedLabel] ?? label;
  }

  return PAYMENT_TYPE_LABELS[normalizedLabel] ?? label;
}

function isNumericPaymentInput(value: string): boolean {
  return value.length > 0 && !/[^\d\s+]/.test(value);
}

function isWalletReference(value: string): boolean {
  return /\d/.test(value) && /[a-z]/i.test(value);
}

/**
 * Maps a payment reference to a `PAYMENT_TYPE_OPTIONS` value.
 * Digit length follows `Formatter`: 16 tarjeta, 18 CLABE, 10 cuenta.
 * A non-numeric value with letters and digits is a wallet. Anything else
 * non-empty is "Otro". Empty input has no type.
 */
export function detectPaymentType(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (isNumericPaymentInput(trimmed)) {
    const length = trimmed.replace(/\D/g, "").length;

    if (length === 16) {
      return "1";
    }

    if (length === 18) {
      return "2";
    }

    if (length === 10) {
      return "3";
    }

    return "5";
  }

  if (isWalletReference(trimmed)) {
    return "4";
  }

  return "5";
}

function buildPaymentSearchHref(reference: string): string {
  const value = reference.trim();
  if (!value) {
    return "#";
  }

  return `${APP_ROUTES.search}?${Formatter.buildSearchQueryString(value)}`;
}

function getPaymentHref(reference: string, _paymentType?: number): string {
  const value = reference.trim();
  if (!value) {
    return "#";
  }

  if (/^0x[a-fA-F0-9]{40}$/.test(value)) {
    return `https://etherscan.io/address/${value}`;
  }

  const genericHref = getContactHref(value);
  if (genericHref !== "#") {
    return genericHref;
  }

  return buildPaymentSearchHref(value);
}

function isExternalPaymentHref(href: string): boolean {
  return (
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

export { buildPaymentSearchHref, getPaymentHref, getPaymentLabel, isExternalPaymentHref };
