type PaginatedDto<T> = {
  data: T[];
  total: number;
  page: number;
  count: number;
};

export type SearchReportItemDto = {
  id: string | number;
  type: "scammer" | "organization";
  name: string;
  reports: number;
  organizations?: string[] | null;
  products?: string[] | null;
  tags?: string[] | null;
  is_active: boolean;
  status?: "active" | "inactive";
};

export type SearchReportsDto = PaginatedDto<SearchReportItemDto>;

export type PartySummaryDto = {
  id: number | string;
  name: string;
  country?: string;
  reports: number;
  profile_picture: string | null;
  products?: string[] | null;
  status: boolean | "active" | "inactive";
  created_at: string;
};

export type ContactDto = {
  id: string | number;
  name?: string;
  reference: string;
  platform: string;
  created_at: string;
  is_active: boolean;
};

export type ContactsDto = PaginatedDto<ContactDto>;

export type PartyReportDto = {
  id: string | number;
  title: string;
  short_description: string;
  created_at: string;
};

export type PartyReportsDto = PaginatedDto<PartyReportDto>;

export type MonthlyReportCountsDto = Record<string, number | undefined>;

export type RelationshipMapNodeDto =
  | {
      id: string;
      type: "party";
      party_id: string;
      name: string;
      kind: "scammer" | "organization";
      is_center: boolean;
    }
  | {
      id: string;
      type: "contact";
      contact_id: string;
      label: string;
      detail: string;
      platform: string;
    }
  | {
      id: string;
      type: "payment_method";
      payment_method_id: string;
      label: string;
      detail: string;
      payment_type?: number;
    };

export type RelationshipMapDto = {
  nodes: RelationshipMapNodeDto[];
  edges: Array<{
    id: string;
    source: string;
    target: string;
    kind: "contact" | "payment" | "linked";
  }>;
};

export type StoredImagePathDto = { path: string };
export type StoredImagePathsDto = { paths: string[] };

export type CreatedOrganizationReportDto = {
  id: number;
  organization_id: number;
};

export type CreatedScammerReportDto = {
  id: number;
  scammer_id: number;
};
