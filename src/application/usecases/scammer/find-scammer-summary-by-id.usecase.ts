import ApiCallerInterface from "@/core/base/api-caller.interface";
import type ScammerSummaryEntity from "@/core/domain/scammer/entities/scammer-summary.entity";
import type { PublicApiMethod } from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class FindScammerSummaryByIdUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"findScammerSummary">,
  ) {}

  public async execute(id: string): Promise<ScammerSummaryEntity> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.findScammerSummary(id, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default FindScammerSummaryByIdUsecase;
