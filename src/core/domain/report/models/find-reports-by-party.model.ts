import PartyReportEntity from "@/core/domain/report/entities/party-report.entity";

type FindReportsByPartyModel<T> = {
  data: T[];
  total: number;
  page: number;
  count: number;
};

type FindReportsByPartyResult = FindReportsByPartyModel<PartyReportEntity>;

export type { FindReportsByPartyModel };
export default FindReportsByPartyResult;
