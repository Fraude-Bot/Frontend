import type { ComponentType } from "react";

export type PartyType = "individual" | "company";

export type ReportFormContactDraft = {
  id: string;
  name: string;
  platform: string;
  url: string;
};

export type ReportFormPaymentDraft = {
  id: string;
  reference: string;
  holder: string;
  type: string;
};

export type ReportFormDraft = {
  partyType: PartyType | null;
  organizationId: string | null;
  companyName: string;
  scammerId: string | null;
  individualName: string;
  products: string[];
  reportTitle: string;
  reportDescription: string;
  avatarFile: File | null;
  evidenceFiles: File[];
  contacts: ReportFormContactDraft[];
  payments: ReportFormPaymentDraft[];
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
  scammerId: null,
  individualName: "",
  products: [],
  reportTitle: "",
  reportDescription: "",
  avatarFile: null,
  evidenceFiles: [],
  contacts: [],
  payments: [],
};

export function isReportFormDraftDirty(draft: ReportFormDraft) {
  return (
    draft.companyName.trim() !== "" ||
    draft.individualName.trim() !== "" ||
    draft.products.length > 0 ||
    draft.reportTitle.trim() !== "" ||
    draft.reportDescription.trim() !== "" ||
    draft.avatarFile !== null ||
    draft.evidenceFiles.length > 0 ||
    draft.contacts.length > 0 ||
    draft.payments.length > 0
  );
}
