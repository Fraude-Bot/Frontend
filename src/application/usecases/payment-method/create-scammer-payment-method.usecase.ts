import ApiCallerInterface from "@/core/base/api-caller.interface";
import type PaymentMethodSummaryEntity from "@/core/domain/payment-method/entities/payment-method-summary.entity";
import type { CreateScammerPaymentMethodRequest } from "@/core/domain/payment-method/models/create-scammer-payment-method.request";
import type { PublicApiMethod } from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class CreateScammerPaymentMethodUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"createScammerPaymentMethod">,
  ) {}

  public async execute(
    id: string,
    request: CreateScammerPaymentMethodRequest,
  ): Promise<PaymentMethodSummaryEntity> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.createScammerPaymentMethod(id, request, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default CreateScammerPaymentMethodUsecase;
