import type SearchReportResult from "@/core/domain/report/models/search-report.model";

export interface SearchReportCachePort {
  get(query: string, page: number): SearchReportResult | null;
  set(query: string, result: SearchReportResult): void;
}
