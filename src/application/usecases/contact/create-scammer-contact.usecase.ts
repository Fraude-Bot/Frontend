import ApiCallerInterface from "@/core/base/api-caller.interface";
import type ContactSummaryEntity from "@/core/domain/contact/entities/contact-summary.entity";
import type { CreateScammerContactRequest } from "@/core/domain/contact/models/create-scammer-contact.request";
import type { PublicApiMethod } from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class CreateScammerContactUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"createScammerContact">,
  ) {}

  public async execute(
    id: string,
    request: CreateScammerContactRequest,
  ): Promise<ContactSummaryEntity> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.createScammerContact(id, request, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default CreateScammerContactUsecase;
