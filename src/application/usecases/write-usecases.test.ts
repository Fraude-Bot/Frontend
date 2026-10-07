import SuggestScammerNamesUsecase from "@/application/usecases/scammer/suggest-scammer-names.usecase";
import SuggestOrganizationNamesUsecase from "@/application/usecases/organization/suggest-organization-names.usecase";
import StoreTemporaryProfilePictureUsecase from "@/application/usecases/report/store-temporary-profile-picture.usecase";
import StoreTemporaryProofsUsecase from "@/application/usecases/report/store-temporary-proofs.usecase";
import CreateScammerReportUsecase from "@/application/usecases/report/create-scammer-report.usecase";
import CreateOrganizationReportUsecase from "@/application/usecases/report/create-organization-report.usecase";
import type {
  CreateOrganizationReportRequest,
  CreateScammerReportRequest,
} from "@/core/domain/report/models/create-report.request";

describe("write and suggestion use cases", () => {
  it("delegates scammer and organization suggestions", async () => {
    const scammerApi = {
      suggestScammerNames: vi.fn().mockResolvedValue(["Alice"]),
    };
    const organizationApi = {
      suggestOrganizationNames: vi.fn().mockResolvedValue(["Acme"]),
    };

    await expect(
      new SuggestScammerNamesUsecase(scammerApi).execute("ali"),
    ).resolves.toEqual(["Alice"]);
    await expect(
      new SuggestOrganizationNamesUsecase(organizationApi).execute("acm"),
    ).resolves.toEqual(["Acme"]);
    expect(scammerApi.suggestScammerNames).toHaveBeenCalledWith(
      "ali",
      expect.any(AbortSignal),
    );
    expect(organizationApi.suggestOrganizationNames).toHaveBeenCalledWith(
      "acm",
      expect.any(AbortSignal),
    );
  });

  it("delegates profile and proof uploads", async () => {
    const file = new File(["image"], "proof.png", { type: "image/png" });
    const profileApi = {
      storeTemporaryProfilePicture: vi.fn().mockResolvedValue("profiles/a.png"),
    };
    const proofsApi = {
      storeTemporaryProofs: vi.fn().mockResolvedValue(["proofs/a.png"]),
    };

    await expect(
      new StoreTemporaryProfilePictureUsecase(profileApi).execute(file),
    ).resolves.toBe("profiles/a.png");
    await expect(
      new StoreTemporaryProofsUsecase(proofsApi).execute([file]),
    ).resolves.toEqual(["proofs/a.png"]);
  });

  it("delegates scammer and organization report creation", async () => {
    const scammerRequest: CreateScammerReportRequest = {
      title: "Reporte",
      description: "Descripción",
      scammer: { name: "Alice" },
      contacts: [],
      payment_methods: [],
      products: [],
    };
    const organizationRequest: CreateOrganizationReportRequest = {
      title: "Reporte",
      description: "Descripción",
      organization: { name: "Acme" },
      contacts: [],
      payment_methods: [],
      products: [],
    };
    const scammerApi = {
      createScammerReport: vi
        .fn()
        .mockResolvedValue({ reportId: 1, scammerId: 2 }),
    };
    const organizationApi = {
      createOrganizationReport: vi
        .fn()
        .mockResolvedValue({ reportId: 3, organizationId: 4 }),
    };

    await expect(
      new CreateScammerReportUsecase(scammerApi).execute(scammerRequest),
    ).resolves.toEqual({ reportId: 1, scammerId: 2 });
    await expect(
      new CreateOrganizationReportUsecase(organizationApi).execute(
        organizationRequest,
      ),
    ).resolves.toEqual({ reportId: 3, organizationId: 4 });
  });

  it("aborts the delegated request when cancelled", async () => {
    let signal: AbortSignal | undefined;
    const api = {
      suggestScammerNames: vi.fn(
        (_query: string, requestSignal: AbortSignal) => {
          signal = requestSignal;
          return new Promise<string[]>(() => undefined);
        },
      ),
    };
    const useCase = new SuggestScammerNamesUsecase(api);

    void useCase.execute("alice");
    useCase.cancel();

    expect(signal?.aborted).toBe(true);
  });
});
