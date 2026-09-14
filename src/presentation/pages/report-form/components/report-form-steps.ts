import PartyTypeStep from "@/presentation/pages/report-form/components/PartyTypeStep";
import CompanyDetailsStep from "@/presentation/pages/report-form/components/CompanyDetailsStep";
import type { ReportFormStep } from "@/presentation/pages/report-form/components/types";

/**
 * Append new steps here as designs land. The stepper shows at least
 * `REPORT_FORM_PLANNED_STEPS` circles so upcoming steps stay visible.
 */
export const REPORT_FORM_STEPS: ReportFormStep[] = [
  {
    id: "party-type",
    title: "¿Quién te estafó?",
    Component: PartyTypeStep,
  },
  {
    id: "company-details",
    title: "Información del reporte",
    Component: CompanyDetailsStep,
  },
];

export const REPORT_FORM_PLANNED_STEPS = 3;
export const REPORT_FORM_STEP_PARAM = "paso";

export function getReportFormStepCount(
  stepCount = REPORT_FORM_STEPS.length,
  plannedStepCount = REPORT_FORM_PLANNED_STEPS,
) {
  return Math.max(plannedStepCount, stepCount);
}

export function getReportFormStepIndex(
  param: string | null,
  stepCount = REPORT_FORM_STEPS.length,
) {
  if (param === null || param === "") {
    return 0;
  }

  const parsed = Number(param);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return 0;
  }

  return Math.min(parsed, stepCount) - 1;
}

export function getReportFormStepSearchParams(
  stepIndex: number,
  current: URLSearchParams,
) {
  const next = new URLSearchParams(current);

  if (stepIndex <= 0) {
    next.delete(REPORT_FORM_STEP_PARAM);
  } else {
    next.set(REPORT_FORM_STEP_PARAM, String(stepIndex + 1));
  }

  return next;
}
