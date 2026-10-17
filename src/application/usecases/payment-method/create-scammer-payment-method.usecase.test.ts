import PaymentMethodSummaryEntity from "@/core/domain/payment-method/entities/payment-method-summary.entity";
import CreateScammerPaymentMethodUsecase from "@/application/usecases/payment-method/create-scammer-payment-method.usecase";
import Http from "@/infrastructure/http/http";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { API_ROUTES } from "@/infrastructure/config/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

describe("CreateScammerPaymentMethodUsecase", () => {
  let useCase: CreateScammerPaymentMethodUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateScammerPaymentMethodUsecase(new PublicApiAdapter());
  });

  it("posts a scammer payment method and maps the stored payment method", async () => {
    mockedHttp.post.mockResolvedValue({
      status: 201,
      data: {
        id: 5,
        reference: "012345678901234567",
        type: "Clabe",
        created_at: "2026-08-24",
        is_active: true,
      },
    } as never);

    const result = await useCase.execute("1", {
      type: "2",
      reference: " 012345678901234567 ",
    });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      API_ROUTES.public.scammers.paymentMethods.replace("{id}", "1"),
      { type: "clabe", reference: "012345678901234567" },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result).toBeInstanceOf(PaymentMethodSummaryEntity);
    expect(result.id).toBe("5");
    expect(result.reference).toBe("012345678901234567");
    expect(result.paymentType).toBe(2);
    expect(result.createdAt).toBe("2026-08-24");
    expect(result.isActive).toBe(true);
  });

  it("rejects a response that is not a created payment method", async () => {
    mockedHttp.post.mockResolvedValue({
      status: 200,
      data: { id: 5 },
    } as never);

    await expect(
      useCase.execute("1", { type: "clabe", reference: "012345678901234567" }),
    ).rejects.toThrow("The payment method was not created.");
  });

  it("aborts in-flight requests when cancel is called", async () => {
    let capturedSignal: AbortSignal | undefined;

    mockedHttp.post.mockImplementation((_url, _body, config) => {
      capturedSignal = config?.signal as AbortSignal;

      return new Promise(() => undefined);
    });

    void useCase.execute("1", { type: "clabe", reference: "012345678901234567" });
    useCase.cancel();

    expect(capturedSignal?.aborted).toBe(true);
  });
});
