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
import StoreTemporaryProfilePictureUsecase from "@/application/usecases/report/store-temporary-profile-picture.usecase";
import StoreTemporaryProofsUsecase from "@/application/usecases/report/store-temporary-proofs.usecase";

export const createSearchReportUseCase = () => new SearchReportUsecase();
export const createFindScammerSummaryByIdUseCase = () => new FindScammerSummaryByIdUsecase();
export const createSuggestScammerNamesUseCase = () =>
  new SuggestScammerNamesUsecase();
export const createFindOrganizationSummaryByIdUseCase = () => new FindOrganizationSummaryByIdUsecase();
export const createSuggestOrganizationNamesUseCase = () =>
  new SuggestOrganizationNamesUsecase();
export const createSearchReportStubUseCase = () => new SearchReportStubUsecase();
export const createFindMonthlyReportCountsUseCase = () => new FindMonthlyReportCountsUsecase();
export const createFindContactsByPartyUseCase = () => new FindContactsByPartyUsecase();
export const createFindReportsByPartyUseCase = () =>
  new FindReportsByPartyUsecase();
export const createFindRelationshipMapByPartyUseCase = () =>
  new FindRelationshipMapByPartyUsecase();
export const createStoreTemporaryProfilePictureUseCase = () =>
  new StoreTemporaryProfilePictureUsecase();
export const createStoreTemporaryProofsUseCase = () =>
  new StoreTemporaryProofsUsecase();
export const dependencies = {
  searchReportUseCase: createSearchReportUseCase,
  findScammerSummaryByIdUseCase: createFindScammerSummaryByIdUseCase,
  suggestScammerNamesUseCase: createSuggestScammerNamesUseCase,
  findOrganizationSummaryByIdUseCase: createFindOrganizationSummaryByIdUseCase,
  suggestOrganizationNamesUseCase: createSuggestOrganizationNamesUseCase,
  searchReportStubUseCase: createSearchReportStubUseCase,
  findMonthlyReportCountsUseCase: createFindMonthlyReportCountsUseCase,
  findContactsByPartyUseCase: createFindContactsByPartyUseCase,
  findReportsByPartyUseCase: createFindReportsByPartyUseCase,
  findRelationshipMapByPartyUseCase: createFindRelationshipMapByPartyUseCase,
  storeTemporaryProfilePictureUseCase:
    createStoreTemporaryProfilePictureUseCase,
  storeTemporaryProofsUseCase: createStoreTemporaryProofsUseCase,
};

type PublicInterface<T> = Pick<T, keyof T>;

export type Dependencies = {
  [K in keyof typeof dependencies]: PublicInterface<
    ReturnType<(typeof dependencies)[K]>
  >;
};

export const createDependencies = (): Dependencies => ({
  searchReportUseCase: dependencies.searchReportUseCase(),
  findScammerSummaryByIdUseCase: dependencies.findScammerSummaryByIdUseCase(),
  suggestScammerNamesUseCase: dependencies.suggestScammerNamesUseCase(),
  findOrganizationSummaryByIdUseCase:
    dependencies.findOrganizationSummaryByIdUseCase(),
  suggestOrganizationNamesUseCase:
    dependencies.suggestOrganizationNamesUseCase(),
  searchReportStubUseCase: dependencies.searchReportStubUseCase(),
  findMonthlyReportCountsUseCase: dependencies.findMonthlyReportCountsUseCase(),
  findContactsByPartyUseCase: dependencies.findContactsByPartyUseCase(),
  findReportsByPartyUseCase: dependencies.findReportsByPartyUseCase(),
  findRelationshipMapByPartyUseCase:
    dependencies.findRelationshipMapByPartyUseCase(),
  storeTemporaryProfilePictureUseCase:
    dependencies.storeTemporaryProfilePictureUseCase(),
  storeTemporaryProofsUseCase: dependencies.storeTemporaryProofsUseCase(),
});
