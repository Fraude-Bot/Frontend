import ApiCallerInterface from "@/core/base/api-caller.interface";
import type FindContactsByPartyResult from "@/core/domain/contact/models/find-contacts-by-party.model";
import type {
  PartyType,
  PublicApiMethod,
} from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class FindContactsByPartyUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"findContactsByParty">,
  ) {}

  public async execute(
    id: string,
    type: PartyType,
    page = 1,
    platform?: string,
  ): Promise<FindContactsByPartyResult> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.findContactsByParty(
      id,
      type,
      page,
      platform,
      signal,
    );
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default FindContactsByPartyUsecase;
