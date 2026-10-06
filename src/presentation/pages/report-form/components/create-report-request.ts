import type {
  CreateOrganizationReportRequest,
  CreateScammerReportRequest,
  ReportContactPayload,
  ReportLinkedPartyPayload,
  ReportPaymentMethodPayload,
} from "@/core/domain/report/models/create-report.request";
import type {
  ReportFormCollaboratorDraft,
  ReportFormContactDraft,
  ReportFormDraft,
  ReportFormPaymentDraft,
} from "@/presentation/pages/report-form/components/types";

const CONTACT_PLATFORMS: Record<string, string> = {
  whatsapp: "whatsapp",
  facebook: "facebook",
  youtube: "youtube",
  tiktok: "tiktok",
  email: "email",
  cellphone: "cellphone",
  telegram: "telegram",
  instagram: "instagram",
  webpage: "url",
  url: "url",
  other: "other",
};

const PAYMENT_TYPES: Record<string, number | string> = {
  "1": 1,
  "2": 2,
  "3": 3,
  "4": 4,
  "5": 5,
  card_number: "card_number",
  clabe: "clabe",
  account_number: "account_number",
  wallet: "wallet",
  other: "other",
};

function toPlatform(platform: string) {
  return CONTACT_PLATFORMS[platform.trim().toLowerCase()] ?? "other";
}

function toPaymentType(type: string) {
  return PAYMENT_TYPES[type.trim().toLowerCase()] ?? "other";
}

function toContact(contact: ReportFormContactDraft): ReportContactPayload {
  return {
    platform: toPlatform(contact.platform),
    reference: contact.url.trim(),
  };
}

function toPaymentMethod(
  payment: ReportFormPaymentDraft | ReportFormCollaboratorDraft["payments"][number],
): ReportPaymentMethodPayload {
  return {
    type: toPaymentType(payment.type),
    reference: payment.reference.trim(),
  };
}

function toLinkedParty(
  party: ReportFormCollaboratorDraft,
): ReportLinkedPartyPayload {
  const payload: ReportLinkedPartyPayload = {
    name: party.name.trim(),
  };

  if (party.avatarPath) {
    payload.profile_picture_path = party.avatarPath;
  }

  if (party.contacts.length > 0) {
    payload.contacts = party.contacts.map(toContact);
  }

  if (party.payments.length > 0) {
    payload.payment_methods = party.payments.map(toPaymentMethod);
  }

  return payload;
}

function sharedReportFields(draft: ReportFormDraft) {
  const request: {
    title: string;
    description: string;
    profile_picture?: string;
    proofs?: string[];
    contacts: ReportContactPayload[];
    payment_methods: ReportPaymentMethodPayload[];
    products: string[];
  } = {
    title: draft.reportTitle.trim(),
    description: draft.reportDescription.trim(),
    contacts: draft.contacts.map(toContact),
    payment_methods: draft.payments.map(toPaymentMethod),
    products: draft.products.map((product) => product.trim()).filter(Boolean),
  };

  if (draft.avatarPath) {
    request.profile_picture = draft.avatarPath;
  }

  if (draft.evidencePaths.length > 0) {
    request.proofs = draft.evidencePaths;
  }

  return request;
}

export function toOrganizationReportRequest(
  draft: ReportFormDraft,
): CreateOrganizationReportRequest {
  const request: CreateOrganizationReportRequest = {
    ...sharedReportFields(draft),
    organization: {
      name: draft.companyName.trim(),
    },
  };

  if (draft.collaborators.length > 0) {
    request.scammers = draft.collaborators.map(toLinkedParty);
  }

  return request;
}

export function toScammerReportRequest(
  draft: ReportFormDraft,
): CreateScammerReportRequest {
  const request: CreateScammerReportRequest = {
    ...sharedReportFields(draft),
    scammer: {
      name: draft.individualName.trim(),
    },
  };

  if (draft.organizations.length > 0) {
    request.organizations = draft.organizations.map(toLinkedParty);
  }

  return request;
}
