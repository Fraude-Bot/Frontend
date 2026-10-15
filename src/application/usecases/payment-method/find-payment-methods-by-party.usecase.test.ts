import FindPaymentMethodsByPartyUsecase from "@/application/usecases/payment-method/find-payment-methods-by-party.usecase";
import Http from "@/infrastructure/http/http";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { API_ROUTES } from "@/infrastructure/config/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

const apiPaymentMethod = {
  id: 5,
  reference: "012345678901234567",
  type: "Clabe",
  created_at: "2026-08-24",
  is_active: true,
};

describe("FindPaymentMethodsByPartyUsecase", () => {
  let useCase: FindPaymentMethodsByPartyUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new FindPaymentMethodsByPartyUsecase(new PublicApiAdapter());
  });

  it("maps a scammer payment methods response to domain entities", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        data: [apiPaymentMethod],
        total: 15,
        page: 1,
        count: 10,
      },
    } as never);

    const result = await useCase.execute("1", "scammer", 1);

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.scammers.paymentMethods.replace("{id}", "1"),
      expect.objectContaining({
        params: { p: 1 },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.data).toHaveLength(1);
    expect(result.data[0].id).toBe("5");
    expect(result.data[0].reference).toBe("012345678901234567");
    expect(result.data[0].paymentType).toBe(2);
    expect(result.data[0].createdAt).toBe("2026-08-24");
    expect(result.data[0].isActive).toBe(true);
    expect(result.total).toBe(15);
    expect(result.page).toBe(1);
    expect(result.count).toBe(10);
  });

  it("maps an organization response and forwards the type filter", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        data: [{ ...apiPaymentMethod, type: "Card_number" }],
        total: 1,
        page: 2,
        count: 10,
      },
    } as never);

    const result = await useCase.execute("7", "organization", 2, "1");

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.organizations.paymentMethods.replace("{id}", "7"),
      expect.objectContaining({
        params: { p: 2, type: "card_number" },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.data[0].paymentType).toBe(1);
    expect(result.page).toBe(2);
  });

  it("sends each payment type filter as the lowercase API enum", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        data: [],
        total: 0,
        page: 1,
        count: 10,
      },
    } as never);

    await useCase.execute("1", "scammer", 1, "3");
    await useCase.execute("1", "scammer", 1, "4");
    await useCase.execute("1", "scammer", 1, "5");

    expect(mockedHttp.get).toHaveBeenNthCalledWith(
      1,
      API_ROUTES.public.scammers.paymentMethods.replace("{id}", "1"),
      expect.objectContaining({ params: { p: 1, type: "account_number" } }),
    );
    expect(mockedHttp.get).toHaveBeenNthCalledWith(
      2,
      API_ROUTES.public.scammers.paymentMethods.replace("{id}", "1"),
      expect.objectContaining({ params: { p: 1, type: "wallet" } }),
    );
    expect(mockedHttp.get).toHaveBeenNthCalledWith(
      3,
      API_ROUTES.public.scammers.paymentMethods.replace("{id}", "1"),
      expect.objectContaining({ params: { p: 1, type: "other" } }),
    );
  });

  it("returns empty results when the party is not found", async () => {
    mockedHttp.get.mockRejectedValue({
      response: {
        status: 404,
        data: { message: "Scammer payment methods not found" },
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

    useCase.execute("1", "scammer");
    useCase.cancel();

    expect(capturedSignal?.aborted).toBe(true);
  });
});
