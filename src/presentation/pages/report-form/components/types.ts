import type { ComponentType } from "react";

export type PartyType = "individual" | "company";

export type ReportFormDraft = {
  partyType: PartyType | null;
  organizationId: string | null;
  companyName: string;
  products: string[];
  reportTitle: string;
  reportDescription: string;
  evidenceFiles: File[];
};

export type ReportFormStepProps = {
  draft: ReportFormDraft;
  updateDraft: (patch: Partial<ReportFormDraft>) => void;
  goNext: () => void;
  goBack: () => void;
};

export type ReportFormStep = {
  id: string;
  title: string;
  Component: ComponentType<ReportFormStepProps>;
};

export const EMPTY_REPORT_FORM_DRAFT: ReportFormDraft = {
  partyType: null,
  organizationId: null,
  companyName: "",
  products: [],
  reportTitle: "",
  reportDescription: "",
  evidenceFiles: [],
};

export function isReportFormDraftDirty(draft: ReportFormDraft) {
  return (
    draft.companyName.trim() !== "" ||
    draft.products.length > 0 ||
    draft.reportTitle.trim() !== "" ||
    draft.reportDescription.trim() !== "" ||
    draft.evidenceFiles.length > 0
  );
}
