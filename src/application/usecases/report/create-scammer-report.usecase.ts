import ApiCallerInterface from "@/core/base/api-caller.interface";
import type { CreateScammerReportRequest } from "@/core/domain/report/models/create-report.request";
import type {
  CreatedScammerReport,
  PublicApiMethod,
} from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

export type { CreatedScammerReport };

class CreateScammerReportUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"createScammerReport">,
  ) {}

  public async execute(
    request: CreateScammerReportRequest,
  ): Promise<CreatedScammerReport> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.createScammerReport(request, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default CreateScammerReportUsecase;
