import SearchReportUsecase from "@/application/usecases/report/search-report.usecase";
import Http from "@/infrastructure/http/http";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { API_ROUTES } from "@/infrastructure/config/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

describe("SearchReportUsecase", () => {
  let useCase: SearchReportUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new SearchReportUsecase(new PublicApiAdapter());
  });

  it("maps a successful API response to domain entities", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        data: [
          {
            id: 42,
            name: "Test Scammer",
            products: ["card"],
            tags: ["phishing"],
            reports: 3,
            type: "scammer",
            organizations: ["Acme"],
            status: "active",
          },
        ],
        total: 1,
        page: 1,
        count: 10,
      },
    } as never);

    const result = await useCase.execute("test", 1);

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.reports.search,
      expect.objectContaining({
        params: { q: "test", p: 1 },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("42");
    expect(result.data[0].name).toBe("Test Scammer");
    expect(result.data[0].type).toBe("scammer");
    expect(result.data[0].tags).toEqual(["phishing"]);
    expect(result.data[0].products).toEqual(["card"]);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.count).toBe(10);
  });

  it("maps organization type from API response", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        data: [
          {
            id: 7,
            name: "Test Org",
            products: [],
            reports: 1,
            type: "organization",
            organizations: null,
            is_active: true,
          },
        ],
        total: 1,
        page: 1,
        count: 10,
      },
    } as never);

    const result = await useCase.execute("org", 1);

    expect(result.data[0].type).toBe("organization");
    expect(result.data[0].status).toBe("active");
  });

  it("surfaces non-200 responses as errors", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 500,
      data: {},
    } as never);

    await expect(useCase.execute("test", 2)).rejects.toThrow(
      "Reports could not be searched.",
    );
  });

  it("aborts in-flight requests when cancel is called", async () => {
    let capturedSignal: AbortSignal | undefined;

    mockedHttp.get.mockImplementation((_url, config) => {
      capturedSignal = config?.signal as AbortSignal;

      return new Promise(() => {});
    });

    useCase.execute("test", 1);
    useCase.cancel();

    expect(capturedSignal?.aborted).toBe(true);
  });
});
