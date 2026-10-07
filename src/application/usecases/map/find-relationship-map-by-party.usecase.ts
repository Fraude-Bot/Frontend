import ApiCallerInterface from "@/core/base/api-caller.interface";
import type { FindRelationshipMapResult } from "@/core/domain/map/models/find-relationship-map.model";
import type {
  PartyType,
  PublicApiMethod,
} from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class FindRelationshipMapByPartyUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"findRelationshipMapByParty">,
  ) {}

  public async execute(
    id: string,
    type: PartyType,
    depth = 1,
    limit = 20,
  ): Promise<FindRelationshipMapResult> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.findRelationshipMapByParty(
      id,
      type,
      depth,
      limit,
      signal,
    );
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default FindRelationshipMapByPartyUsecase;
