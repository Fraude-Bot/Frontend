import type ScammerSummaryEntity from "@/core/domain/scammer/entities/scammer-summary.entity";
import type OrganizationSummaryEntity from "@/core/domain/organization/entities/organization-summary.entity";
import type MonthlyReportCountsEntity from "@/core/domain/report/entities/monthly-report-counts.entity";
import type SearchReportResult from "@/core/domain/report/models/search-report.model";
import type FindContactsByPartyResult from "@/core/domain/contact/models/find-contacts-by-party.model";
import type FindReportsByPartyResult from "@/core/domain/report/models/find-reports-by-party.model";
import type { FindRelationshipMapResult } from "@/core/domain/map/models/find-relationship-map.model";
import type {
  CreateOrganizationReportRequest,
  CreateScammerReportRequest,
} from "@/core/domain/report/models/create-report.request";

export type PartyType = "scammer" | "organization";

export type CreatedScammerReport = {
  reportId: number;
  scammerId: number;
};

export type CreatedOrganizationReport = {
  reportId: number;
  organizationId: number;
};

export interface PublicApiPort {
  searchReports(
    query: string,
    page: number,
    signal: AbortSignal,
  ): Promise<SearchReportResult>;
  findScammerSummary(
    id: string,
    signal: AbortSignal,
  ): Promise<ScammerSummaryEntity>;
  findOrganizationSummary(
    id: string,
    signal: AbortSignal,
  ): Promise<OrganizationSummaryEntity>;
  suggestScammerNames(
    query: string,
    signal: AbortSignal,
  ): Promise<string[]>;
  suggestOrganizationNames(
    query: string,
    signal: AbortSignal,
  ): Promise<string[]>;
  findMonthlyReportCounts(
    id: string,
    type: PartyType,
    year: number,
    signal: AbortSignal,
  ): Promise<MonthlyReportCountsEntity>;
  findContactsByParty(
    id: string,
    type: PartyType,
    page: number,
    platform: string | undefined,
    signal: AbortSignal,
  ): Promise<FindContactsByPartyResult>;
  findReportsByParty(
    id: string,
    type: PartyType,
    page: number,
    signal: AbortSignal,
  ): Promise<FindReportsByPartyResult>;
  findRelationshipMapByParty(
    id: string,
    type: PartyType,
    depth: number,
    limit: number,
    signal: AbortSignal,
  ): Promise<FindRelationshipMapResult>;
  storeTemporaryProfilePicture(
    file: File,
    signal: AbortSignal,
  ): Promise<string>;
  storeTemporaryProofs(
    files: File[],
    signal: AbortSignal,
  ): Promise<string[]>;
  createOrganizationReport(
    request: CreateOrganizationReportRequest,
    signal: AbortSignal,
  ): Promise<CreatedOrganizationReport>;
  createScammerReport(
    request: CreateScammerReportRequest,
    signal: AbortSignal,
  ): Promise<CreatedScammerReport>;
}

export type PublicApiMethod<K extends keyof PublicApiPort> = Pick<
  PublicApiPort,
  K
>;
