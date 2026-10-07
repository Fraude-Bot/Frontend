import FindMonthlyReportCountsUsecase from "@/application/usecases/report/find-monthly-report-counts.usecase";
import Http from "@/infrastructure/http/http";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { API_ROUTES } from "@/infrastructure/config/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

const calendarResponse = {
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "5": 0,
  "6": 0,
  "7": 0,
  "8": 5,
  "9": 0,
  "10": 0,
  "11": 0,
  "12": 0,
};

describe("FindMonthlyReportCountsUsecase", () => {
  let useCase: FindMonthlyReportCountsUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new FindMonthlyReportCountsUsecase(new PublicApiAdapter());
  });

  it("maps a scammer calendar response into twelve monthly counts", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: calendarResponse,
    } as never);

    const result = await useCase.execute("20", "scammer", 2026);

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.scammers.calendar
        .replace("{id}", "20")
        .replace("{year}", "2026"),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.year).toBe(2026);
    expect(result.counts).toEqual([0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0, 0]);
  });

  it("maps an organization calendar response into twelve monthly counts", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: { "1": 4, "5": 12, "12": 7 },
    } as never);

    const result = await useCase.execute("1", "organization", 2026);

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.organizations.calendar
        .replace("{id}", "1")
        .replace("{year}", "2026"),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.year).toBe(2026);
    expect(result.counts).toEqual([4, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 7]);
  });

  it("rejects when the request fails", async () => {
    const error = new Error("Request failed with status code 404");

    mockedHttp.get.mockRejectedValue(error);

    await expect(useCase.execute("1", "organization")).rejects.toThrow(error);
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
