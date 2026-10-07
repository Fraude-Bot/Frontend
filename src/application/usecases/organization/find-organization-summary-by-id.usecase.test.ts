import FindOrganizationSummaryByIdUsecase from "./find-organization-summary-by-id.usecase";
import Http from "@/infrastructure/http/http";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { API_ROUTES, CDN_URL } from "@/infrastructure/config/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

describe("FindOrganizationSummaryByIdUsecase", () => {
  let useCase: FindOrganizationSummaryByIdUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new FindOrganizationSummaryByIdUsecase(new PublicApiAdapter());
  });

  it("maps a successful API response to an organization summary entity", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        id: 1,
        name: "Only Traders",
        country: "Côte d'Ivoire",
        reports: 3,
        profile_picture: null,
        products: ["Stocks", "Venture", "Recovery"],
        status: true,
        created_at: "2026-08-10",
      },
    } as never);

    const result = await useCase.execute("1");

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.organizations.findById.replace("{id}", "1"),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.id).toBe("1");
    expect(result.name).toBe("Only Traders");
    expect(result.country).toBe("Côte d'Ivoire");
    expect(result.reports).toBe(3);
    expect(result.profilePicture).toBeNull();
    expect(result.categories).toEqual(["Stocks", "Venture", "Recovery"]);
    expect(result.isActive).toBe(true);
    expect(result.createdAt).toEqual(new Date("2026-08-10"));
    expect(result.updatedAt).toEqual(new Date("2026-08-10"));
  });

  it("maps profile_picture and an inactive status", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        id: 2,
        name: "Ecohuertas",
        country: "Mexico",
        reports: 10,
        profile_picture: "reports/organizations/profiles/8f3c1a.jpg",
        products: ["Criptomonedas"],
        status: false,
        created_at: "2026-01-01",
      },
    } as never);

    const result = await useCase.execute("2");

    expect(result.profilePicture).toBe(
      `${CDN_URL}reports/organizations/profiles/8f3c1a.jpg`,
    );
    expect(result.isActive).toBe(false);
    expect(result.categories).toEqual(["Criptomonedas"]);
  });

  it("defaults missing products to an empty list", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        id: 3,
        name: "Acme",
        country: "USA",
        reports: 1,
        profile_picture: null,
        status: false,
        created_at: "2026-02-01",
      },
    } as never);

    const result = await useCase.execute("3");

    expect(result.categories).toEqual([]);
  });

  it("rejects when the request fails", async () => {
    const error = new Error("Request failed with status code 404");

    mockedHttp.get.mockRejectedValue(error);

    await expect(useCase.execute("1")).rejects.toThrow(error);
  });

  it("aborts in-flight requests when cancel is called", async () => {
    let capturedSignal: AbortSignal | undefined;

    mockedHttp.get.mockImplementation((_url, config) => {
      capturedSignal = config?.signal as AbortSignal;

      return new Promise(() => {});
    });

    useCase.execute("1");
    useCase.cancel();

    expect(capturedSignal?.aborted).toBe(true);
  });
});
