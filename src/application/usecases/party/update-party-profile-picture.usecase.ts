import ApiCallerInterface from "@/core/base/api-caller.interface";
import type { StoredProfilePicture } from "@/application/models/stored-profile-picture.model";
import type { PartyType, PublicApiMethod } from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class UpdatePartyProfilePictureUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"updatePartyProfilePicture">,
  ) {}

  public async execute(
    id: string,
    type: PartyType,
    profilePicture: string,
  ): Promise<StoredProfilePicture> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.updatePartyProfilePicture(
      id,
      type,
      profilePicture,
      signal,
    );
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default UpdatePartyProfilePictureUsecase;
