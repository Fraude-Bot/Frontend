import FindAssociationsByPartyUsecase from "@/application/usecases/association/find-associations-by-party.usecase";
import Http from "@/infrastructure/http/http";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { API_ROUTES } from "@/infrastructure/config/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

describe("FindAssociationsByPartyUsecase", () => {
  let useCase: FindAssociationsByPartyUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new FindAssociationsByPartyUsecase(new PublicApiAdapter());
  });

  it("maps a scammer's organizations to domain entities", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        data: [
          { id: 7, name: "Ada", created_at: "2026-01-15" },
          { id: 9, name: "Zed", created_at: "2026-03-02" },
        ],
        total: 2,
        page: 1,
        count: 10,
      },
    } as never);

    const result = await useCase.execute("20", "scammer", 1);

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.scammers.organizations.replace("{id}", "20"),
      expect.objectContaining({
        params: { p: 1 },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe("7");
    expect(result.data[0].name).toBe("Ada");
    expect(result.data[0].createdAt).toBe("2026-01-15");
    expect(result.data[1].name).toBe("Zed");
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.count).toBe(10);
  });

  it("maps an organization's scammers", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        data: [{ id: 4, name: "Jane Doe", created_at: "2026-08-24" }],
        total: 15,
        page: 2,
        count: 10,
      },
    } as never);

    const result = await useCase.execute("3", "organization", 2);

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.organizations.scammers.replace("{id}", "3"),
      expect.objectContaining({
        params: { p: 2 },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.data[0].id).toBe("4");
    expect(result.data[0].name).toBe("Jane Doe");
    expect(result.page).toBe(2);
    expect(result.total).toBe(15);
  });

  it("returns empty results when the party is not found", async () => {
    mockedHttp.get.mockRejectedValue({
      response: {
        status: 404,
        data: { message: "Scammer organizations not found" },
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

    const result = await useCase.execute("1", "organization", 3);

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

    useCase.execute("1", "organization");
    useCase.cancel();

    expect(capturedSignal?.aborted).toBe(true);
  });
});
