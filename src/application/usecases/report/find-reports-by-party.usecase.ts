import ApiCallerInterface from "@/core/base/api-caller.interface";
import type FindReportsByPartyResult from "@/core/domain/report/models/find-reports-by-party.model";
import type {
  PartyType,
  PublicApiMethod,
} from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class FindReportsByPartyUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"findReportsByParty">,
  ) {}

  public async execute(
    id: string,
    type: PartyType,
    page = 1,
  ): Promise<FindReportsByPartyResult> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.findReportsByParty(id, type, page, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default FindReportsByPartyUsecase;
