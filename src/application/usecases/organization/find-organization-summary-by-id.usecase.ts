import ApiCallerInterface from "@/core/base/api-caller.interface";
import OrganizationSummaryEntity from "@/core/domain/organization/entities/organization-summary.entity";
import FindOrganizationSummaryByIdResponse from "@/core/domain/organization/models/find-organization-summary-by-id.response";
import Http from "@/infrastructure/http/http";
import RequestCanceler from "@/infrastructure/http/request-canceler";
import { API_ROUTES, resolveCdnUrl } from "@/common/environment";

class FindOrganizationSummaryByIdUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public async execute(id: string): Promise<OrganizationSummaryEntity> {
    const signal = this.requestCanceller.prepareSignal();
    const url = API_ROUTES.public.organizations.findById.replace(
      "{id}",
      encodeURIComponent(id),
    );

    const { data } = await Http.get<FindOrganizationSummaryByIdResponse>(url, {
      signal,
    });

    const createdAt = new Date(data.created_at);

    return new OrganizationSummaryEntity(
      String(data.id),
      data.name,
      data.country,
      resolveCdnUrl(data.profile_picture),
      data.reports,
      data.products || [],
      Boolean(data.status),
      createdAt,
      createdAt,
    );
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default FindOrganizationSummaryByIdUsecase;
