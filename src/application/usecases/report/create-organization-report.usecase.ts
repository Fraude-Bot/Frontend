import ApiCallerInterface from "@/core/base/api-caller.interface";
import type { CreateOrganizationReportRequest } from "@/core/domain/report/models/create-report.request";
import type {
  CreatedOrganizationReport,
  PublicApiMethod,
} from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

export type { CreatedOrganizationReport };

class CreateOrganizationReportUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"createOrganizationReport">,
  ) {}

  public async execute(
    request: CreateOrganizationReportRequest,
  ): Promise<CreatedOrganizationReport> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.createOrganizationReport(request, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default CreateOrganizationReportUsecase;
