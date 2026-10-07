import ApiCallerInterface from "@/core/base/api-caller.interface";
import ScammerSummaryEntity from "@/core/domain/scammer/entities/scammer-summary.entity";
import FindScammerSummaryByIdResponse from "@/core/domain/scammer/models/find-scammer-summary-by-id.response";
import Http from "@/infrastructure/http/http";
import RequestCanceler from "@/infrastructure/http/request-canceler";
import { API_ROUTES, resolveCdnUrl } from "@/common/environment";

class FindScammerSummaryByIdUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public async execute(id: string): Promise<ScammerSummaryEntity> {
    const signal = this.requestCanceller.prepareSignal();
    const url = API_ROUTES.public.scammers.findById.replace(
      "{id}",
      encodeURIComponent(id),
    );

    const { data } = await Http.get<FindScammerSummaryByIdResponse>(url, {
      signal,
    });

    const createdAt = new Date(data.created_at);

    return new ScammerSummaryEntity(
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

export default FindScammerSummaryByIdUsecase;
