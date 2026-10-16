import ApiCallerInterface from "@/core/base/api-caller.interface";
import type ContactSummaryEntity from "@/core/domain/contact/entities/contact-summary.entity";
import type { CreateOrganizationContactRequest } from "@/core/domain/contact/models/create-organization-contact.request";
import type { PublicApiMethod } from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class CreateOrganizationContactUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"createOrganizationContact">,
  ) {}

  public async execute(
    id: string,
    request: CreateOrganizationContactRequest,
  ): Promise<ContactSummaryEntity> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.createOrganizationContact(id, request, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default CreateOrganizationContactUsecase;
