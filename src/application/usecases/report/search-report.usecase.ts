import ApiCallerInterface from "@/core/base/api-caller.interface";
import type SearchReportResult from "@/core/domain/report/models/search-report.model";
import type { PublicApiMethod } from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class SearchReportUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"searchReports">,
  ) {}

  public async execute(query: string, page = 1): Promise<SearchReportResult> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.searchReports(query, page, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default SearchReportUsecase;
