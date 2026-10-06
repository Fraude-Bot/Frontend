import ApiCallerInterface from "@/core/base/api-caller.interface";
import type { CreateScammerReportRequest } from "@/core/domain/report/models/create-report.request";
import CreateScammerReportResponse from "@/core/domain/report/models/create-scammer-report.response";
import Http from "@/infrastructure/http/http";
import RequestCanceler from "@/infrastructure/http/request-canceler";
import { API_ROUTES } from "@/common/environment";

export type CreatedScammerReport = {
  reportId: number;
  scammerId: number;
};

class CreateScammerReportUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public async execute(
    request: CreateScammerReportRequest,
  ): Promise<CreatedScammerReport> {
    const signal = this.requestCanceller.prepareSignal();

    const { data, status } = await Http.post<CreateScammerReportResponse>(
      API_ROUTES.public.reports.createScammer,
      request,
      { signal },
    );

    if (
      status !== 201 ||
      !Number.isInteger(data.id) ||
      data.id < 1 ||
      !Number.isInteger(data.scammer_id) ||
      data.scammer_id < 1
    ) {
      throw new Error("The scammer report was not created.");
    }

    return {
      reportId: data.id,
      scammerId: data.scammer_id,
    };
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default CreateScammerReportUsecase;
