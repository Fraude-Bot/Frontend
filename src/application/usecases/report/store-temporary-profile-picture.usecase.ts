import ApiCallerInterface from "@/core/base/api-caller.interface";
import type { PublicApiMethod } from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class StoreTemporaryProfilePictureUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"storeTemporaryProfilePicture">,
  ) {}

  public async execute(file: File): Promise<string> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.storeTemporaryProfilePicture(file, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default StoreTemporaryProfilePictureUsecase;
