import PaymentMethodSummaryEntity from "@/core/domain/payment-method/entities/payment-method-summary.entity";
import CreateOrganizationPaymentMethodUsecase from "@/application/usecases/payment-method/create-organization-payment-method.usecase";
import Http from "@/infrastructure/http/http";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { API_ROUTES } from "@/infrastructure/config/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

describe("CreateOrganizationPaymentMethodUsecase", () => {
  let useCase: CreateOrganizationPaymentMethodUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateOrganizationPaymentMethodUsecase(new PublicApiAdapter());
  });

  it("posts an organization payment method and maps the stored payment method", async () => {
    mockedHttp.post.mockResolvedValue({
      status: 201,
      data: {
        id: 8,
        reference: "4111111111111111",
        type: "Card_number",
        created_at: "2026-10-16",
        is_active: true,
      },
    } as never);

    const result = await useCase.execute("4", {
      reference: " 4111111111111111 ",
    });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      API_ROUTES.public.organizations.paymentMethods.replace("{id}", "4"),
      { reference: "4111111111111111" },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result).toBeInstanceOf(PaymentMethodSummaryEntity);
    expect(result.id).toBe("8");
    expect(result.reference).toBe("4111111111111111");
    expect(result.paymentType).toBe(1);
    expect(result.createdAt).toBe("2026-10-16");
    expect(result.isActive).toBe(true);
  });
});
