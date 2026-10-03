import SuggestScammerNamesResponse from "@/core/domain/scammer/models/suggest-scammer-names.response";
import ApiCallerInterface from "@/core/base/api-caller.interface";
import Http from "@/infrastructure/http/http";
import RequestCanceler from "@/infrastructure/http/request-canceler";
import { API_ROUTES } from "@/common/environment";

class SuggestScammerNamesUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public async execute(query: string): Promise<string[]> {
    const signal = this.requestCanceller.prepareSignal();

    const { data, status } = await Http.get<SuggestScammerNamesResponse>(
      API_ROUTES.public.scammers.suggest,
      {
        signal,
        params: {
          q: query,
        },
      },
    );

    if (status !== 200 || !Array.isArray(data)) {
      return [];
    }

    return data.filter((name) => name.trim() !== "");
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default SuggestScammerNamesUsecase;
