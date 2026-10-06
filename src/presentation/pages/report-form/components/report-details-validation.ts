import { useState } from "react";
import type { ReportFormDraft } from "@/presentation/pages/report-form/components/types";

export const REPORT_DETAILS_FIELDS = [
  "name",
  "products",
  "title",
  "description",
  "contacts",
  "payments",
] as const;

export type ReportDetailsField = (typeof REPORT_DETAILS_FIELDS)[number];

export type ReportDetailsErrors = Partial<Record<ReportDetailsField, string>>;

const EMPTY_ERRORS: ReportDetailsErrors = {};

export function getReportDetailsErrors(
  draft: ReportFormDraft,
): ReportDetailsErrors {
  const errors: ReportDetailsErrors = {};
  const isCompany = draft.partyType === "company";
  const name = isCompany ? draft.companyName : draft.individualName;

  if (name.trim() === "") {
    errors.name = isCompany
      ? "Escribe el nombre de la empresa."
      : "Escribe el nombre del individuo.";
  }

  if (draft.products.length === 0) {
    errors.products = "Agrega al menos un producto.";
  }

  if (draft.reportTitle.trim() === "") {
    errors.title = "Escribe el título de tu reporte.";
  } else if (draft.reportTitle.trim().length > 50) {
    errors.title = "El título no puede superar 50 caracteres.";
  }

  if (draft.reportDescription.trim() === "") {
    errors.description = "Escribe la descripción de tu reporte.";
  }

  if (draft.contacts.length === 0 && draft.payments.length === 0) {
    const message = "Agrega al menos un contacto o un método de pago.";
    errors.contacts = message;
    errors.payments = message;
  }

  return errors;
}

export function focusReportDetailsField(field: ReportDetailsField) {
  const root = document.querySelector(`[data-report-field="${field}"]`);
  if (!(root instanceof HTMLElement)) {
    return;
  }

  root.scrollIntoView({ block: "center", behavior: "smooth" });
  const control = root.querySelector("input, textarea, button");
  if (control instanceof HTMLElement) {
    control.focus();
  }
}

export function useReportDetailsAttempt(draft: ReportFormDraft) {
  const [attempted, setAttempted] = useState(false);
  const errors = attempted ? getReportDetailsErrors(draft) : EMPTY_ERRORS;

  function continueIfValid(goNext: () => void) {
    const nextErrors = getReportDetailsErrors(draft);
    const firstField = REPORT_DETAILS_FIELDS.find((field) => nextErrors[field]);

    if (firstField) {
      setAttempted(true);
      window.requestAnimationFrame(() => {
        focusReportDetailsField(firstField);
      });
      return;
    }

    goNext();
  }

  return { errors, continueIfValid };
}
