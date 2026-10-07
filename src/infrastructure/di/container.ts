import SearchReportUsecase from "@/application/usecases/report/search-report.usecase";
import FindMonthlyReportCountsUsecase from "@/application/usecases/report/find-monthly-report-counts.usecase";
import FindReportsByPartyUsecase from "@/application/usecases/report/find-reports-by-party.usecase";
import FindScammerSummaryByIdUsecase from "@/application/usecases/scammer/find-scammer-summary-by-id.usecase";
import SuggestScammerNamesUsecase from "@/application/usecases/scammer/suggest-scammer-names.usecase";
import FindOrganizationSummaryByIdUsecase from "@/application/usecases/organization/find-organization-summary-by-id.usecase";
import SuggestOrganizationNamesUsecase from "@/application/usecases/organization/suggest-organization-names.usecase";
import SearchReportStubUsecase from "@/application/usecases/report/stub/search-report.stub";
import FindContactsByPartyUsecase from "@/application/usecases/contact/find-contacts-by-party.usecase";
import FindRelationshipMapByPartyUsecase from "@/application/usecases/map/find-relationship-map-by-party.usecase";
import CreateOrganizationReportUsecase from "@/application/usecases/report/create-organization-report.usecase";
import CreateScammerReportUsecase from "@/application/usecases/report/create-scammer-report.usecase";
import StoreTemporaryProfilePictureUsecase from "@/application/usecases/report/store-temporary-profile-picture.usecase";
import StoreTemporaryProofsUsecase from "@/application/usecases/report/store-temporary-proofs.usecase";
import type { Dependencies } from "@/application/dependencies";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { BrowserSearchReportCache } from "@/infrastructure/cache/browser-search-report-cache";

export function createDependencies(): Dependencies {
  const publicApi = new PublicApiAdapter();

  return {
    searchReportUseCase: new SearchReportUsecase(publicApi),
    findScammerSummaryByIdUseCase: new FindScammerSummaryByIdUsecase(publicApi),
    suggestScammerNamesUseCase: new SuggestScammerNamesUsecase(publicApi),
    findOrganizationSummaryByIdUseCase:
      new FindOrganizationSummaryByIdUsecase(publicApi),
    suggestOrganizationNamesUseCase:
      new SuggestOrganizationNamesUsecase(publicApi),
    searchReportStubUseCase: new SearchReportStubUsecase(),
    findMonthlyReportCountsUseCase:
      new FindMonthlyReportCountsUsecase(publicApi),
    findContactsByPartyUseCase: new FindContactsByPartyUsecase(publicApi),
    findReportsByPartyUseCase: new FindReportsByPartyUsecase(publicApi),
    findRelationshipMapByPartyUseCase:
      new FindRelationshipMapByPartyUsecase(publicApi),
    storeTemporaryProfilePictureUseCase:
      new StoreTemporaryProfilePictureUsecase(publicApi),
    storeTemporaryProofsUseCase: new StoreTemporaryProofsUsecase(publicApi),
    createOrganizationReportUseCase:
      new CreateOrganizationReportUsecase(publicApi),
    createScammerReportUseCase: new CreateScammerReportUsecase(publicApi),
    searchReportCache: new BrowserSearchReportCache(),
  };
}
