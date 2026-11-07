import SearchReportsByTitleUsecase from "@/application/usecases/report/search-reports-by-title.usecase";
import Http from "@/infrastructure/http/http";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { API_ROUTES } from "@/infrastructure/config/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

describe("SearchReportsByTitleUsecase", () => {
  let useCase: SearchReportsByTitleUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new SearchReportsByTitleUsecase(new PublicApiAdapter());
  });

  it("maps a successful API response to party report entities", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        data: [
          {
            id: 1354,
            title: "¡Me estafó $2,000 MXN!",
            short_description: "Estoy super enojada...",
            created_at: "2026-09-01",
          },
        ],
        total: 1,
        page: 1,
        count: 10,
      },
    } as never);

    const result = await useCase.execute("estafó", 1);

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.reports.searchByTitle,
      expect.objectContaining({
        params: { q: "estafó", p: 1 },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("1354");
    expect(result.data[0].title).toBe("¡Me estafó $2,000 MXN!");
    expect(result.data[0].description).toBe("Estoy super enojada...");
    expect(result.total).toBe(1);
  });

  it("surfaces non-200 responses as errors", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 500,
      data: {},
    } as never);

    await expect(useCase.execute("test", 1)).rejects.toThrow(
      "Reports could not be searched by title.",
    );
  });

  it("aborts in-flight requests when cancel is called", async () => {
    let capturedSignal: AbortSignal | undefined;

    mockedHttp.get.mockImplementation((_url, config) => {
      capturedSignal = config?.signal as AbortSignal;

      return new Promise(() => {});
    });

    useCase.execute("invoice", 1);
    useCase.cancel();

    expect(capturedSignal?.aborted).toBe(true);
  });
});
