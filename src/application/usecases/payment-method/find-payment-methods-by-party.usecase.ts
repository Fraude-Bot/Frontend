import ApiCallerInterface from "@/core/base/api-caller.interface";
import type FindPaymentMethodsByPartyResult from "@/core/domain/payment-method/models/find-payment-methods-by-party.model";
import type {
  PartyType,
  PublicApiMethod,
} from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class FindPaymentMethodsByPartyUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"findPaymentMethodsByParty">,
  ) {}

  public async execute(
    id: string,
    type: PartyType,
    page = 1,
    paymentType?: string,
  ): Promise<FindPaymentMethodsByPartyResult> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.findPaymentMethodsByParty(
      id,
      type,
      page,
      paymentType,
      signal,
    );
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default FindPaymentMethodsByPartyUsecase;
