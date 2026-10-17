import ApiCallerInterface from "@/core/base/api-caller.interface";
import type PaymentMethodSummaryEntity from "@/core/domain/payment-method/entities/payment-method-summary.entity";
import type { CreateOrganizationPaymentMethodRequest } from "@/core/domain/payment-method/models/create-organization-payment-method.request";
import type { PublicApiMethod } from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class CreateOrganizationPaymentMethodUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"createOrganizationPaymentMethod">,
  ) {}

  public async execute(
    id: string,
    request: CreateOrganizationPaymentMethodRequest,
  ): Promise<PaymentMethodSummaryEntity> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.createOrganizationPaymentMethod(id, request, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default CreateOrganizationPaymentMethodUsecase;
