import ApiCallerInterface from "@/core/base/api-caller.interface";
import type PartyAssociationEntity from "@/core/domain/association/entities/party-association.entity";
import type { CreateOrganizationScammerRequest } from "@/core/domain/association/models/create-organization-scammer.request";
import type { PublicApiMethod } from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class CreateOrganizationScammerUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"createOrganizationScammer">,
  ) {}

  public async execute(
    id: string,
    request: CreateOrganizationScammerRequest,
  ): Promise<PartyAssociationEntity> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.createOrganizationScammer(id, request, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default CreateOrganizationScammerUsecase;
