import FindReportsByPartyUsecase from "@/application/usecases/report/find-reports-by-party.usecase";
import Http from "@/infrastructure/http/http";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { API_ROUTES } from "@/infrastructure/config/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

const apiReport = {
  id: 1354,
  title: "¡Me estafó $2,000 MXN y estoy enojada!",
  short_description:
    "Estoy super enojada, me ofreció un lote de ropa por $2,000 MXN.",
  created_at: "2026-09-22",
};

describe("FindReportsByPartyUsecase", () => {
  let useCase: FindReportsByPartyUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new FindReportsByPartyUsecase(new PublicApiAdapter());
  });

  it("maps a scammer reports response to domain entities", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        data: [apiReport],
        total: 4,
        page: 1,
        count: 10,
      },
    } as never);

    const result = await useCase.execute("20", "scammer", 1);

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.scammers.reports.replace("{id}", "20"),
      expect.objectContaining({
        params: { p: 1 },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("1354");
    expect(result.data[0].title).toBe("¡Me estafó $2,000 MXN y estoy enojada!");
    expect(result.data[0].description).toBe(apiReport.short_description);
    expect(result.total).toBe(4);
    expect(result.page).toBe(1);
    expect(result.count).toBe(10);
  });

  it("maps an organization reports response", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        data: [{ ...apiReport, id: 1314, title: "Estafado" }],
        total: 1,
        page: 2,
        count: 10,
      },
    } as never);

    const result = await useCase.execute("7", "organization", 2);

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.organizations.reports.replace("{id}", "7"),
      expect.objectContaining({
        params: { p: 2 },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.data[0].id).toBe("1314");
    expect(result.data[0].title).toBe("Estafado");
    expect(result.page).toBe(2);
  });

  it("returns empty results when the party is not found", async () => {
    mockedHttp.get.mockRejectedValue({
      response: {
        status: 404,
        data: { message: "Reports not found" },
      },
    });

    const result = await useCase.execute("999", "scammer", 1);

    expect(result).toEqual({
      data: [],
      total: 0,
      page: 1,
      count: 0,
    });
  });

  it("returns empty results for non-200 responses", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 500,
      data: {},
    } as never);

    const result = await useCase.execute("1", "scammer", 3);

    expect(result).toEqual({
      data: [],
      total: 0,
      page: 3,
      count: 0,
    });
  });

  it("rethrows unexpected request failures", async () => {
    const error = new Error("Network Error");

    mockedHttp.get.mockRejectedValue(error);

    await expect(useCase.execute("1", "scammer")).rejects.toThrow(error);
  });

  it("aborts in-flight requests when cancel is called", async () => {
    let capturedSignal: AbortSignal | undefined;

    mockedHttp.get.mockImplementation((_url, config) => {
      capturedSignal = config?.signal as AbortSignal;

      return new Promise(() => {});
    });

    useCase.execute("1", "scammer");
    useCase.cancel();

    expect(capturedSignal?.aborted).toBe(true);
  });
});
