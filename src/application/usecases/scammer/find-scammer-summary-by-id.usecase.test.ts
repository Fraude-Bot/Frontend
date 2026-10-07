import FindScammerSummaryByIdUsecase from "./find-scammer-summary-by-id.usecase";
import Http from "@/infrastructure/http/http";
import { API_ROUTES, CDN_URL } from "@/common/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

describe("FindScammerSummaryByIdUsecase", () => {
  let useCase: FindScammerSummaryByIdUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new FindScammerSummaryByIdUsecase();
  });

  it("maps a successful API response to a scammer summary entity", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        id: 20,
        name: "Joseph Nacchio",
        country: "DM",
        reports: 3,
        profile_picture: null,
        products: ["Stocks", "Venture", "Recovery"],
        status: false,
        created_at: "2026-08-10",
      },
    } as never);

    const result = await useCase.execute("20");

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.scammers.findById.replace("{id}", "20"),
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.id).toBe("20");
    expect(result.name).toBe("Joseph Nacchio");
    expect(result.country).toBe("DM");
    expect(result.reports).toBe(3);
    expect(result.profilePicture).toBeNull();
    expect(result.categories).toEqual(["Stocks", "Venture", "Recovery"]);
    expect(result.isActive).toBe(false);
    expect(result.createdAt).toEqual(new Date("2026-08-10"));
    expect(result.updatedAt).toEqual(new Date("2026-08-10"));
  });

  it("maps profile_picture and an active status", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        id: 1,
        name: "John Doe",
        country: "USA",
        reports: 10,
        profile_picture: "reports/scammers/profiles/8f3c1a.jpg",
        products: ["Investment Scam"],
        status: true,
        created_at: "2026-01-01",
      },
    } as never);

    const result = await useCase.execute("1");

    expect(result.profilePicture).toBe(
      `${CDN_URL}reports/scammers/profiles/8f3c1a.jpg`,
    );
    expect(result.isActive).toBe(true);
    expect(result.categories).toEqual(["Investment Scam"]);
  });

  it("defaults missing products to an empty list", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        id: 2,
        name: "Jane Doe",
        country: "MX",
        reports: 1,
        profile_picture: null,
        status: false,
        created_at: "2026-02-01",
      },
    } as never);

    const result = await useCase.execute("2");

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
