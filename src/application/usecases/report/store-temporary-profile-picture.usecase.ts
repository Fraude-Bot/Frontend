import ApiCallerInterface from "@/core/base/api-caller.interface";
import StoreTemporaryProfilePictureResponse from "@/core/domain/report/models/store-temporary-profile-picture.response";
import Http from "@/infrastructure/http/http";
import RequestCanceler from "@/infrastructure/http/request-canceler";
import { API_ROUTES } from "@/common/environment";

class StoreTemporaryProfilePictureUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public async execute(file: File): Promise<string> {
    const signal = this.requestCanceller.prepareSignal();
    const body = new FormData();
    body.append("image", file);

    const { data, status } = await Http.post<StoreTemporaryProfilePictureResponse>(
      API_ROUTES.public.reports.profilePicture,
      body,
      {
        signal,
        headers: {
          // The shared client defaults to JSON, which would stringify this body.
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (status !== 201 || typeof data.path !== "string" || data.path === "") {
      throw new Error("The profile picture was not stored.");
    }

    return data.path;
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default StoreTemporaryProfilePictureUsecase;
