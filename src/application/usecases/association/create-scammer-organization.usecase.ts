import ApiCallerInterface from "@/core/base/api-caller.interface";
import type PartyAssociationEntity from "@/core/domain/association/entities/party-association.entity";
import type { CreateScammerOrganizationRequest } from "@/core/domain/association/models/create-scammer-organization.request";
import type { PublicApiMethod } from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class CreateScammerOrganizationUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"createScammerOrganization">,
  ) {}

  public async execute(
    id: string,
    request: CreateScammerOrganizationRequest,
  ): Promise<PartyAssociationEntity> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.createScammerOrganization(id, request, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default CreateScammerOrganizationUsecase;
