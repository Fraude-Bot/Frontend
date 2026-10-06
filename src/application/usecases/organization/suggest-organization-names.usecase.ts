import SuggestOrganizationNamesResponse from "@/core/domain/organization/models/suggest-organization-names.response";
import ApiCallerInterface from "@/core/base/api-caller.interface";
import Http from "@/infrastructure/http/http";
import RequestCanceler from "@/infrastructure/http/request-canceler";
import { API_ROUTES } from "@/common/environment";

class SuggestOrganizationNamesUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public async execute(query: string): Promise<string[]> {
    const signal = this.requestCanceller.prepareSignal();

    const { data, status } = await Http.get<SuggestOrganizationNamesResponse>(
      API_ROUTES.public.organizations.suggest,
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

export default SuggestOrganizationNamesUsecase;
