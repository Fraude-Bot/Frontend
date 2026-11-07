import ApiCallerInterface from "@/core/base/api-caller.interface";
import type ReportDetailEntity from "@/core/domain/report/entities/report-detail.entity";
import type { PublicApiMethod } from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class FindReportByIdUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"findReportById">,
  ) {}

  public async execute(id: string): Promise<ReportDetailEntity> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.findReportById(id, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default FindReportByIdUsecase;
