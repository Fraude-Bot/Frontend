import ApiCallerInterface from "@/core/base/api-caller.interface";
import type { CreateAttachedReportRequest } from "@/core/domain/report/models/create-report.request";
import type {
  CreatedAttachedScammerReport,
  PublicApiMethod,
} from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

export type { CreatedAttachedScammerReport };

class CreateReportForScammerUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"createReportForScammer">,
  ) {}

  public async execute(
    id: string,
    request: CreateAttachedReportRequest,
  ): Promise<CreatedAttachedScammerReport> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.createReportForScammer(id, request, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default CreateReportForScammerUsecase;
