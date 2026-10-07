import type FindContactsByPartyUsecase from "@/application/usecases/contact/find-contacts-by-party.usecase";
import type FindRelationshipMapByPartyUsecase from "@/application/usecases/map/find-relationship-map-by-party.usecase";
import type FindOrganizationSummaryByIdUsecase from "@/application/usecases/organization/find-organization-summary-by-id.usecase";
import type SuggestOrganizationNamesUsecase from "@/application/usecases/organization/suggest-organization-names.usecase";
import type CreateOrganizationReportUsecase from "@/application/usecases/report/create-organization-report.usecase";
import type CreateScammerReportUsecase from "@/application/usecases/report/create-scammer-report.usecase";
import type FindMonthlyReportCountsUsecase from "@/application/usecases/report/find-monthly-report-counts.usecase";
import type FindReportsByPartyUsecase from "@/application/usecases/report/find-reports-by-party.usecase";
import type SearchReportUsecase from "@/application/usecases/report/search-report.usecase";
import type SearchReportStubUsecase from "@/application/usecases/report/stub/search-report.stub";
import type StoreTemporaryProfilePictureUsecase from "@/application/usecases/report/store-temporary-profile-picture.usecase";
import type StoreTemporaryProofsUsecase from "@/application/usecases/report/store-temporary-proofs.usecase";
import type FindScammerSummaryByIdUsecase from "@/application/usecases/scammer/find-scammer-summary-by-id.usecase";
import type SuggestScammerNamesUsecase from "@/application/usecases/scammer/suggest-scammer-names.usecase";
import type { SearchReportCachePort } from "@/application/ports/search-report-cache.port";

type PublicInterface<T> = Pick<T, keyof T>;

export type Dependencies = {
  searchReportUseCase: PublicInterface<SearchReportUsecase>;
  findScammerSummaryByIdUseCase: PublicInterface<FindScammerSummaryByIdUsecase>;
  suggestScammerNamesUseCase: PublicInterface<SuggestScammerNamesUsecase>;
  findOrganizationSummaryByIdUseCase: PublicInterface<FindOrganizationSummaryByIdUsecase>;
  suggestOrganizationNamesUseCase: PublicInterface<SuggestOrganizationNamesUsecase>;
  searchReportStubUseCase: PublicInterface<SearchReportStubUsecase>;
  findMonthlyReportCountsUseCase: PublicInterface<FindMonthlyReportCountsUsecase>;
  findContactsByPartyUseCase: PublicInterface<FindContactsByPartyUsecase>;
  findReportsByPartyUseCase: PublicInterface<FindReportsByPartyUsecase>;
  findRelationshipMapByPartyUseCase: PublicInterface<FindRelationshipMapByPartyUsecase>;
  storeTemporaryProfilePictureUseCase: PublicInterface<StoreTemporaryProfilePictureUsecase>;
  storeTemporaryProofsUseCase: PublicInterface<StoreTemporaryProofsUsecase>;
  createOrganizationReportUseCase: PublicInterface<CreateOrganizationReportUsecase>;
  createScammerReportUseCase: PublicInterface<CreateScammerReportUsecase>;
  searchReportCache: SearchReportCachePort;
};
