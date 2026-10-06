import ApiCallerInterface from "@/core/base/api-caller.interface";
import type { CreateOrganizationReportRequest } from "@/core/domain/report/models/create-report.request";
import CreateOrganizationReportResponse from "@/core/domain/report/models/create-organization-report.response";
import Http from "@/infrastructure/http/http";
import RequestCanceler from "@/infrastructure/http/request-canceler";
import { API_ROUTES } from "@/common/environment";

export type CreatedOrganizationReport = {
  reportId: number;
  organizationId: number;
};

class CreateOrganizationReportUsecase implements ApiCallerInterface {
  private requestCanceller = new RequestCanceler();

  public async execute(
    request: CreateOrganizationReportRequest,
  ): Promise<CreatedOrganizationReport> {
    const signal = this.requestCanceller.prepareSignal();

    const { data, status } = await Http.post<CreateOrganizationReportResponse>(
      API_ROUTES.public.reports.createOrganization,
      request,
      { signal },
    );

    if (
      status !== 201 ||
      !Number.isInteger(data.id) ||
      data.id < 1 ||
      !Number.isInteger(data.organization_id) ||
      data.organization_id < 1
    ) {
      throw new Error("The organization report was not created.");
    }

    return {
      reportId: data.id,
      organizationId: data.organization_id,
    };
  }

  public cancel(): void {
    this.requestCanceller.cancel();
  }
}

export default CreateOrganizationReportUsecase;
