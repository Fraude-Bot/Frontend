import ApiCallerInterface from "@/core/base/api-caller.interface";
import type MonthlyReportCountsEntity from "@/core/domain/report/entities/monthly-report-counts.entity";
import type {
  PartyType,
  PublicApiMethod,
} from "@/application/ports/public-api.port";
import RequestCanceler from "@/application/shared/request-canceler";

class FindMonthlyReportCountsUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public constructor(
    private readonly publicApi: PublicApiMethod<"findMonthlyReportCounts">,
  ) {}

  public async execute(
    id: string,
    type: PartyType,
    year = new Date().getFullYear(),
  ): Promise<MonthlyReportCountsEntity> {
    const signal = this.requestCanceller.prepareSignal();

    return this.publicApi.findMonthlyReportCounts(id, type, year, signal);
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default FindMonthlyReportCountsUsecase;
