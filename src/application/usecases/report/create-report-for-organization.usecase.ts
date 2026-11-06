import ApiCallerInterface from "@/core/base/api-caller.interface";
import type { CreateAttachedReportRequest } from "@/core/domain/report/models/create-report.request";
import type {
  CreatedAttachedOrganizationReport,
  PublicApiMethod,
} from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

export type { CreatedAttachedOrganizationReport };

class CreateReportForOrganizationUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"createReportForOrganization">,
  ) {}

  public async execute(
    id: string,
    request: CreateAttachedReportRequest,
  ): Promise<CreatedAttachedOrganizationReport> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.createReportForOrganization(id, request, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default CreateReportForOrganizationUsecase;
