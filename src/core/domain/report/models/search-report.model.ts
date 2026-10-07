import ReportSummaryEntity from "@/core/domain/report/entities/report-summary.entity";

type SearchReportModel<T> = {
  data: T[];
  total: number;
  page: number;
  count: number;
};

type SearchReportResult = SearchReportModel<ReportSummaryEntity>;

export type { SearchReportModel };
export default SearchReportResult;
