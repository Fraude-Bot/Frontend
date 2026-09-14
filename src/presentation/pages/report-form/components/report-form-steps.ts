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

export function getReportFormStepCount(
  stepCount = REPORT_FORM_STEPS.length,
  plannedStepCount = REPORT_FORM_PLANNED_STEPS,
) {
  return Math.max(plannedStepCount, stepCount);
}
