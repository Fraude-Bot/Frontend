import ApiCallerInterface from "@/core/base/api-caller.interface";
import StoreTemporaryProofsResponse from "@/core/domain/report/models/store-temporary-proofs.response";
import Http from "@/infrastructure/http/http";
import RequestCanceler from "@/infrastructure/http/request-canceler";
import { API_ROUTES } from "@/common/environment";

class StoreTemporaryProofsUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public async execute(files: File[]): Promise<string[]> {
    const signal = this.requestCanceller.prepareSignal();
    const body = new FormData();

    files.forEach((file) => {
      body.append("images[]", file);
    });

    const { data, status } = await Http.post<StoreTemporaryProofsResponse>(
      API_ROUTES.public.reports.proofs,
      body,
      {
        signal,
        headers: {
          // The shared client defaults to JSON, which would stringify this body.
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (
      status !== 201 ||
      !Array.isArray(data.paths) ||
      data.paths.length !== files.length ||
      data.paths.some((path) => typeof path !== "string" || path === "")
    ) {
      throw new Error("The proof images were not stored.");
    }

    return data.paths;
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default StoreTemporaryProofsUsecase;
