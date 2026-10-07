import FindContactsByPartyUsecase from "@/application/usecases/contact/find-contacts-by-party.usecase";
import Http from "@/infrastructure/http/http";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { API_ROUTES } from "@/infrastructure/config/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

const apiContact = {
  id: 5,
  name: "Roxane",
  reference: "fritz.rice@example.com",
  platform: "Other",
  created_at: "2026-08-23",
  is_active: true,
};

describe("FindContactsByPartyUsecase", () => {
  let useCase: FindContactsByPartyUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new FindContactsByPartyUsecase(new PublicApiAdapter());
  });

  it("maps a scammer contacts response to domain entities", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        data: [apiContact],
        total: 4,
        page: 1,
        count: 10,
      },
    } as never);

    const result = await useCase.execute("20", "scammer", 1);

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.scammers.contacts.replace("{id}", "20"),
      expect.objectContaining({
        params: { p: 1 },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("5");
    expect(result.data[0].name).toBe("Roxane");
    expect(result.data[0].reference).toBe("fritz.rice@example.com");
    expect(result.data[0].platform).toBe("Other");
    expect(result.data[0].createdAt).toBe("2026-08-23");
    expect(result.data[0].isActive).toBe(true);
    expect(result.total).toBe(4);
    expect(result.page).toBe(1);
    expect(result.count).toBe(10);
  });

  it("maps an organization contacts response and forwards the platform filter", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        data: [{ ...apiContact, platform: "Instagram" }],
        total: 1,
        page: 2,
        count: 10,
      },
    } as never);

    const result = await useCase.execute("7", "organization", 2, "Instagram");

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.organizations.contacts.replace("{id}", "7"),
      expect.objectContaining({
        params: { p: 2, platform: "instagram" },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.data[0].platform).toBe("Instagram");
    expect(result.page).toBe(2);
  });

  it("sends webpage filters as the lowercase url query value", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        data: [{ ...apiContact, platform: "Url" }],
        total: 1,
        page: 1,
        count: 10,
      },
    } as never);

    await useCase.execute("20", "scammer", 1, "Webpage");

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.scammers.contacts.replace("{id}", "20"),
      expect.objectContaining({
        params: { p: 1, platform: "url" },
      }),
    );
  });

  it("returns empty results when the party is not found", async () => {
    mockedHttp.get.mockRejectedValue({
      response: {
        status: 404,
        data: { message: "Contacts not found" },
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
