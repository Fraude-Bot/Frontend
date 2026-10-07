import ApiCallerInterface from "@/core/base/api-caller.interface";
import type { PublicApiMethod } from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class StoreTemporaryProofsUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"storeTemporaryProofs">,
  ) {}

  public async execute(files: File[]): Promise<string[]> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.storeTemporaryProofs(files, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default StoreTemporaryProofsUsecase;
