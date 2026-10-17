import ApiCallerInterface from "@/core/base/api-caller.interface";
import type FindAssociationsByPartyResult from "@/core/domain/association/models/find-associations-by-party.model";
import type {
  PartyType,
  PublicApiMethod,
} from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class FindAssociationsByPartyUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"findAssociationsByParty">,
  ) {}

  public async execute(
    id: string,
    type: PartyType,
    page = 1,
  ): Promise<FindAssociationsByPartyResult> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.findAssociationsByParty(id, type, page, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default FindAssociationsByPartyUsecase;
