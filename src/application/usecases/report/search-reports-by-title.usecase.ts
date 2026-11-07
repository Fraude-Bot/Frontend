import ApiCallerInterface from "@/core/base/api-caller.interface";
import type FindReportsByPartyResult from "@/core/domain/report/models/find-reports-by-party.model";
import type { PublicApiMethod } from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class SearchReportsByTitleUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"searchReportsByTitle">,
  ) {}

  public async execute(
    query: string,
    page = 1,
  ): Promise<FindReportsByPartyResult> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.searchReportsByTitle(query, page, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default SearchReportsByTitleUsecase;
