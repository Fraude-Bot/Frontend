import ApiCallerInterface from "@/core/base/api-caller.interface";
import type OrganizationSummaryEntity from "@/core/domain/organization/entities/organization-summary.entity";
import type { PublicApiMethod } from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class FindOrganizationSummaryByIdUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"findOrganizationSummary">,
  ) {}

  public async execute(id: string): Promise<OrganizationSummaryEntity> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.findOrganizationSummary(id, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default FindOrganizationSummaryByIdUsecase;
