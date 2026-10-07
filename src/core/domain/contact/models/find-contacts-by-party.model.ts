import ContactSummaryEntity from "@/core/domain/contact/entities/contact-summary.entity";

type FindContactsByPartyModel<T> = {
  data: T[];
  total: number;
  page: number;
  count: number;
};

type FindContactsByPartyResult = FindContactsByPartyModel<ContactSummaryEntity>;

export type { FindContactsByPartyModel };
export default FindContactsByPartyResult;
