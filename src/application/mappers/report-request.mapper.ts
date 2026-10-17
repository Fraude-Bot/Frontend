import type {
  CreateOrganizationReportRequest,
  CreateScammerReportRequest,
  ReportContactPayload,
  ReportLinkedPartyPayload,
  ReportPaymentMethodPayload,
} from "@/core/domain/report/models/create-report.request";

type ContactDraft = { platform: string; url: string };
type PaymentDraft = { type: string; reference: string };
type LinkedPartyDraft = {
  name: string;
  avatarPath: string | null;
  contacts: ContactDraft[];
  payments: PaymentDraft[];
};

export type ReportCommandDraft = {
  companyName: string;
  individualName: string;
  reportTitle: string;
  reportDescription: string;
  avatarPath: string | null;
  evidencePaths: string[];
  contacts: ContactDraft[];
  payments: PaymentDraft[];
  products: string[];
  collaborators: LinkedPartyDraft[];
  organizations: LinkedPartyDraft[];
  contactEmail: string;
};

function toContact(contact: ContactDraft): ReportContactPayload {
  return {
    reference: contact.url.trim(),
  };
}

function toPaymentMethod(payment: PaymentDraft): ReportPaymentMethodPayload {
  return {
    reference: payment.reference.trim(),
  };
}

function toLinkedParty(party: LinkedPartyDraft): ReportLinkedPartyPayload {
  return {
    name: party.name.trim(),
    ...(party.avatarPath ? { profile_picture: party.avatarPath } : {}),
    ...(party.contacts.length > 0
      ? { contacts: party.contacts.map(toContact) }
      : {}),
    ...(party.payments.length > 0
      ? { payment_methods: party.payments.map(toPaymentMethod) }
      : {}),
  };
}

function sharedFields(draft: ReportCommandDraft) {
  return {
    email: draft.contactEmail.trim(),
    title: draft.reportTitle.trim(),
    description: draft.reportDescription.trim(),
    ...(draft.avatarPath ? { profile_picture: draft.avatarPath } : {}),
    ...(draft.evidencePaths.length > 0
      ? { proofs: draft.evidencePaths }
      : {}),
    contacts: draft.contacts.map(toContact),
    payment_methods: draft.payments.map(toPaymentMethod),
    products: draft.products.map((product) => product.trim()).filter(Boolean),
  };
}

export function toOrganizationReportRequest(
  draft: ReportCommandDraft,
): CreateOrganizationReportRequest {
  return {
    ...sharedFields(draft),
    organization: { name: draft.companyName.trim() },
    ...(draft.collaborators.length > 0
      ? { scammers: draft.collaborators.map(toLinkedParty) }
      : {}),
  };
}

export function toScammerReportRequest(
  draft: ReportCommandDraft,
): CreateScammerReportRequest {
  return {
    ...sharedFields(draft),
    scammer: { name: draft.individualName.trim() },
    ...(draft.organizations.length > 0
      ? { organizations: draft.organizations.map(toLinkedParty) }
      : {}),
  };
}
