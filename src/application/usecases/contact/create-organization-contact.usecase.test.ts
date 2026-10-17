import ContactSummaryEntity from "@/core/domain/contact/entities/contact-summary.entity";
import CreateOrganizationContactUsecase from "@/application/usecases/contact/create-organization-contact.usecase";
import Http from "@/infrastructure/http/http";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { API_ROUTES } from "@/infrastructure/config/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

describe("CreateOrganizationContactUsecase", () => {
  let useCase: CreateOrganizationContactUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateOrganizationContactUsecase(new PublicApiAdapter());
  });

  it("posts an organization contact and maps the stored contact", async () => {
    mockedHttp.post.mockResolvedValue({
      status: 201,
      data: {
        id: 18,
        reference: "ecohuertas",
        platform: "Instagram",
        created_at: "2026-10-16",
        is_active: true,
      },
    } as never);

    const result = await useCase.execute("4", {
      reference: " https://instagram.com/ecohuertas ",
    });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      API_ROUTES.public.organizations.contacts.replace("{id}", "4"),
      {
        reference: "https://instagram.com/ecohuertas",
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result).toBeInstanceOf(ContactSummaryEntity);
    expect(result.id).toBe("18");
    expect(result.reference).toBe("ecohuertas");
    expect(result.platform).toBe("Instagram");
    expect(result.createdAt).toBe("2026-10-16");
    expect(result.isActive).toBe(true);
  });
});
