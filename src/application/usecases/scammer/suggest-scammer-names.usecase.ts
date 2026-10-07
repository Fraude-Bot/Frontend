import ApiCallerInterface from "@/core/base/api-caller.interface";
import type { PublicApiMethod } from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class SuggestScammerNamesUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"suggestScammerNames">,
  ) {}

  public async execute(query: string): Promise<string[]> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.suggestScammerNames(query, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default SuggestScammerNamesUsecase;
