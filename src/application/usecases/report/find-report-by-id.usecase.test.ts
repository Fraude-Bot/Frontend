import FindReportByIdUsecase from "@/application/usecases/report/find-report-by-id.usecase";
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
  title: "Me estafó 5000 dólares esta empresa",
  description: "Hola quiero hacer un reporte.\n\nSegundo párrafo.",
  is_active: true,
  proofs: ["reports/organizations/proofs/abc.png"],
  products: ["Inversiones", "Ponzi"],
  created_at: "2026-10-07",
};

describe("FindReportByIdUsecase", () => {
  let useCase: FindReportByIdUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new FindReportByIdUsecase(new PublicApiAdapter());
  });

  it("maps a report detail response to a domain entity", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: apiReport,
    } as never);

    const result = await useCase.execute("42");

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.reports.findById.replace("{id}", "42"),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.id).toBe("42");
    expect(result.title).toBe(apiReport.title);
    expect(result.description).toBe(apiReport.description);
    expect(result.createdAt).toBe("2026-10-07");
    expect(result.products).toEqual(["Inversiones", "Ponzi"]);
    expect(result.proofs[0]).toContain("reports/organizations/proofs/abc.png");
    expect(result.isActive).toBe(true);
  });

  it("rethrows request failures", async () => {
    const error = {
      response: {
        status: 404,
        data: { message: "Report not found" },
      },
    };

    mockedHttp.get.mockRejectedValue(error);

    await expect(useCase.execute("999")).rejects.toEqual(error);
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
