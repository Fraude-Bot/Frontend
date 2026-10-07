import type {
  CreatedOrganizationReport,
  CreatedScammerReport,
  PartyType,
  PublicApiPort,
} from "@/application/ports/public-api.port";
import ContactSummaryEntity from "@/core/domain/contact/entities/contact-summary.entity";
import type FindContactsByPartyResult from "@/core/domain/contact/models/find-contacts-by-party.model";
import type { FindRelationshipMapResult } from "@/core/domain/map/models/find-relationship-map.model";
import OrganizationSummaryEntity from "@/core/domain/organization/entities/organization-summary.entity";
import MonthlyReportCountsEntity from "@/core/domain/report/entities/monthly-report-counts.entity";
import PartyReportEntity from "@/core/domain/report/entities/party-report.entity";
import ReportSummaryEntity from "@/core/domain/report/entities/report-summary.entity";
import type {
  CreateOrganizationReportRequest,
  CreateScammerReportRequest,
} from "@/core/domain/report/models/create-report.request";
import type FindReportsByPartyResult from "@/core/domain/report/models/find-reports-by-party.model";
import type SearchReportResult from "@/core/domain/report/models/search-report.model";
import ScammerSummaryEntity from "@/core/domain/scammer/entities/scammer-summary.entity";
import { getHttpStatus } from "@/common/utils/http-error.util";
import {
  API_ROUTES,
  resolveCdnUrl,
} from "@/infrastructure/config/environment";
import Http from "@/infrastructure/http/http";
import type {
  ContactsDto,
  CreatedOrganizationReportDto,
  CreatedScammerReportDto,
  MonthlyReportCountsDto,
  PartyReportsDto,
  PartySummaryDto,
  RelationshipMapDto,
  SearchReportsDto,
  StoredImagePathDto,
  StoredImagePathsDto,
} from "@/infrastructure/api/dto/public-api.dto";

const emptyPage = <T>(page: number) => ({
  data: [] as T[],
  total: 0,
  page,
  count: 0,
});

function partyRoute(
  type: PartyType,
  routes: { scammer: string; organization: string },
): string {
  return type === "scammer" ? routes.scammer : routes.organization;
}

function assertStatus(actual: number, expected: number, message: string): void {
  if (actual !== expected) {
    throw new Error(message);
  }
}

class PublicApiAdapter implements PublicApiPort {
  public async searchReports(
    query: string,
    page: number,
    signal: AbortSignal,
  ): Promise<SearchReportResult> {
    const { data, status } = await Http.get<SearchReportsDto>(
      API_ROUTES.public.reports.search,
      { signal, params: { q: query, p: page } },
    );
    assertStatus(status, 200, "Reports could not be searched.");

    return {
      data: data.data.map(
        (report) =>
          new ReportSummaryEntity(
            String(report.id),
            report.name,
            report.tags ?? [],
            report.reports,
            report.type === "organization" ? "organization" : "scammer",
            report.organizations ?? null,
            report.products ?? [],
            report.status ?? (report.is_active ? "active" : "inactive"),
          ),
      ),
      total: data.total,
      page: data.page,
      count: data.count,
    };
  }

  public async findScammerSummary(
    id: string,
    signal: AbortSignal,
  ): Promise<ScammerSummaryEntity> {
    const data = await this.findPartySummary(
      API_ROUTES.public.scammers.findById,
      id,
      signal,
    );
    return new ScammerSummaryEntity(...data);
  }

  public async findOrganizationSummary(
    id: string,
    signal: AbortSignal,
  ): Promise<OrganizationSummaryEntity> {
    const data = await this.findPartySummary(
      API_ROUTES.public.organizations.findById,
      id,
      signal,
    );
    return new OrganizationSummaryEntity(...data);
  }

  public async suggestScammerNames(
    query: string,
    signal: AbortSignal,
  ): Promise<string[]> {
    return this.suggestNames(
      API_ROUTES.public.scammers.suggest,
      query,
      signal,
    );
  }

  public async suggestOrganizationNames(
    query: string,
    signal: AbortSignal,
  ): Promise<string[]> {
    return this.suggestNames(
      API_ROUTES.public.organizations.suggest,
      query,
      signal,
    );
  }

  public async findMonthlyReportCounts(
    id: string,
    type: PartyType,
    year: number,
    signal: AbortSignal,
  ): Promise<MonthlyReportCountsEntity> {
    const route = partyRoute(type, {
      scammer: API_ROUTES.public.scammers.calendar,
      organization: API_ROUTES.public.organizations.calendar,
    });
    const url = route
      .replace("{id}", encodeURIComponent(id))
      .replace("{year}", encodeURIComponent(String(year)));
    const { data } = await Http.get<MonthlyReportCountsDto>(url, { signal });
    const counts = Array.from({ length: 12 }, (_, index) => {
      const count = data[String(index + 1)];
      return typeof count === "number" && Number.isFinite(count) ? count : 0;
    });

    return new MonthlyReportCountsEntity(year, counts);
  }

  public async findContactsByParty(
    id: string,
    type: PartyType,
    page: number,
    platform: string | undefined,
    signal: AbortSignal,
  ): Promise<FindContactsByPartyResult> {
    const route = partyRoute(type, {
      scammer: API_ROUTES.public.scammers.contacts,
      organization: API_ROUTES.public.organizations.contacts,
    });
    const url = route.replace("{id}", encodeURIComponent(id));
    const platformQuery =
      platform?.toLowerCase() === "webpage"
        ? "url"
        : platform?.toLowerCase();

    try {
      const { data, status } = await Http.get<ContactsDto>(url, {
        signal,
        params: {
          p: page,
          ...(platformQuery ? { platform: platformQuery } : {}),
        },
      });
      if (status !== 200) {
        return emptyPage<ContactSummaryEntity>(page);
      }

      return {
        data: data.data.map(
          (contact) =>
            new ContactSummaryEntity(
              String(contact.id),
              contact.name ?? contact.reference,
              contact.reference,
              contact.platform,
              contact.created_at,
              Boolean(contact.is_active),
            ),
        ),
        total: data.total,
        page: data.page,
        count: data.count,
      };
    } catch (error) {
      if (getHttpStatus(error) === 404) {
        return emptyPage<ContactSummaryEntity>(page);
      }
      throw error;
    }
  }

  public async findReportsByParty(
    id: string,
    type: PartyType,
    page: number,
    signal: AbortSignal,
  ): Promise<FindReportsByPartyResult> {
    const route = partyRoute(type, {
      scammer: API_ROUTES.public.scammers.reports,
      organization: API_ROUTES.public.organizations.reports,
    });
    const url = route.replace("{id}", encodeURIComponent(id));

    try {
      const { data, status } = await Http.get<PartyReportsDto>(url, {
        signal,
        params: { p: page },
      });
      if (status !== 200) {
        return emptyPage<PartyReportEntity>(page);
      }

      return {
        data: data.data.map(
          (report) =>
            new PartyReportEntity(
              String(report.id),
              report.title,
              report.short_description,
            ),
        ),
        total: data.total,
        page: data.page,
        count: data.count,
      };
    } catch (error) {
      if (getHttpStatus(error) === 404) {
        return emptyPage<PartyReportEntity>(page);
      }
      throw error;
    }
  }

  public async findRelationshipMapByParty(
    id: string,
    type: PartyType,
    depth: number,
    limit: number,
    signal: AbortSignal,
  ): Promise<FindRelationshipMapResult> {
    const route = partyRoute(type, {
      scammer: API_ROUTES.public.scammers.map,
      organization: API_ROUTES.public.organizations.map,
    });
    const url = route.replace("{id}", encodeURIComponent(id));

    try {
      const { data, status } = await Http.get<RelationshipMapDto>(url, {
        signal,
        params: { depth, limit },
      });
      assertStatus(status, 200, "Relationship map could not be loaded.");
      return {
        nodes: data.nodes.map((node) => {
          if (node.type === "party") {
            return {
              id: node.id,
              type: node.type,
              partyId: node.party_id,
              name: node.name,
              kind: node.kind,
              isCenter: node.is_center,
            };
          }
          if (node.type === "contact") {
            return {
              id: node.id,
              type: node.type,
              contactId: node.contact_id,
              label: node.label,
              detail: node.detail,
              platform: node.platform,
            };
          }
          return {
            id: node.id,
            type: node.type,
            paymentMethodId: node.payment_method_id,
            label: node.label,
            detail: node.detail,
            paymentType: node.payment_type,
          };
        }),
        edges: data.edges,
      };
    } catch (error) {
      if (getHttpStatus(error) === 404) {
        return { nodes: [], edges: [] };
      }
      throw error;
    }
  }

  public async storeTemporaryProfilePicture(
    file: File,
    signal: AbortSignal,
  ): Promise<string> {
    const body = new FormData();
    body.append("image", file);
    const { data, status } = await Http.post<StoredImagePathDto>(
      API_ROUTES.public.reports.profilePicture,
      body,
      { signal, headers: { "Content-Type": "multipart/form-data" } },
    );
    if (status !== 201 || typeof data.path !== "string" || !data.path) {
      throw new Error("The profile picture was not stored.");
    }
    return data.path;
  }

  public async storeTemporaryProofs(
    files: File[],
    signal: AbortSignal,
  ): Promise<string[]> {
    const body = new FormData();
    files.forEach((file) => body.append("images[]", file));
    const { data, status } = await Http.post<StoredImagePathsDto>(
      API_ROUTES.public.reports.proofs,
      body,
      { signal, headers: { "Content-Type": "multipart/form-data" } },
    );
    if (
      status !== 201 ||
      !Array.isArray(data.paths) ||
      data.paths.length !== files.length ||
      data.paths.some((path) => typeof path !== "string" || !path)
    ) {
      throw new Error("The proof images were not stored.");
    }
    return data.paths;
  }

  public async createOrganizationReport(
    request: CreateOrganizationReportRequest,
    signal: AbortSignal,
  ): Promise<CreatedOrganizationReport> {
    const { data, status } = await Http.post<CreatedOrganizationReportDto>(
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
    return { reportId: data.id, organizationId: data.organization_id };
  }

  public async createScammerReport(
    request: CreateScammerReportRequest,
    signal: AbortSignal,
  ): Promise<CreatedScammerReport> {
    const { data, status } = await Http.post<CreatedScammerReportDto>(
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
    return { reportId: data.id, scammerId: data.scammer_id };
  }

  private async findPartySummary(
    route: string,
    id: string,
    signal: AbortSignal,
  ): Promise<
    [
      string,
      string,
      string,
      string | null,
      number,
      string[],
      boolean,
      Date,
      Date,
    ]
  > {
    const url = route.replace("{id}", encodeURIComponent(id));
    const { data } = await Http.get<PartySummaryDto>(url, { signal });
    const createdAt = new Date(data.created_at);

    return [
      String(data.id),
      data.name,
      data.country ?? "",
      resolveCdnUrl(data.profile_picture),
      data.reports,
      data.products ?? [],
      data.status === true || data.status === "active",
      createdAt,
      createdAt,
    ];
  }

  private async suggestNames(
    route: string,
    query: string,
    signal: AbortSignal,
  ): Promise<string[]> {
    const { data, status } = await Http.get<string[]>(route, {
      signal,
      params: { q: query },
    });
    assertStatus(status, 200, "Suggestions could not be loaded.");
    return Array.isArray(data) ? data.filter((name) => name.trim() !== "") : [];
  }
}

export default PublicApiAdapter;
