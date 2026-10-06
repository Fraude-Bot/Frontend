export type ReportContactPayload = {
  platform: string;
  reference: string;
};

export type ReportPaymentMethodPayload = {
  type: number | string;
  reference: string;
};

export type ReportLinkedPartyPayload = {
  name: string;
  profile_picture_path?: string;
  contacts?: ReportContactPayload[];
  payment_methods?: ReportPaymentMethodPayload[];
};

export type CreateOrganizationReportRequest = {
  title: string;
  description: string;
  profile_picture?: string;
  proofs?: string[];
  organization: {
    name: string;
  };
  contacts: ReportContactPayload[];
  payment_methods: ReportPaymentMethodPayload[];
  products: string[];
  scammers?: ReportLinkedPartyPayload[];
};

export type CreateScammerReportRequest = {
  title: string;
  description: string;
  profile_picture?: string;
  proofs?: string[];
  scammer: {
    name: string;
  };
  contacts: ReportContactPayload[];
  payment_methods: ReportPaymentMethodPayload[];
  products: string[];
  organizations?: ReportLinkedPartyPayload[];
};
