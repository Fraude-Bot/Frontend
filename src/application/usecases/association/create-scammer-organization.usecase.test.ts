import PartyAssociationEntity from "@/core/domain/association/entities/party-association.entity";
import CreateScammerOrganizationUsecase from "@/application/usecases/association/create-scammer-organization.usecase";
import Http from "@/infrastructure/http/http";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { API_ROUTES } from "@/infrastructure/config/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

describe("CreateScammerOrganizationUsecase", () => {
  let useCase: CreateScammerOrganizationUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateScammerOrganizationUsecase(new PublicApiAdapter());
  });

  it("posts the name, picture path, contacts, and payment methods", async () => {
    mockedHttp.post.mockResolvedValue({
      status: 201,
      data: {
        id: 18,
        name: "Acme Payments",
        created_at: "2026-08-24",
      },
    } as never);

    const result = await useCase.execute("20", {
      name: "  Acme Payments  ",
      profile_picture_path: " /storage/tmp/reports/profiles/8f3c1a.jpg ",
      contacts: [
        { reference: " +52 55 1111 2222 " },
        { reference: "   " },
      ],
      payment_methods: [{ reference: " 032180000118359719 " }],
    });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      API_ROUTES.public.scammers.organizations.replace("{id}", "20"),
      {
        name: "Acme Payments",
        profile_picture_path: "/storage/tmp/reports/profiles/8f3c1a.jpg",
        contacts: [{ reference: "+52 55 1111 2222" }],
        payment_methods: [{ reference: "032180000118359719" }],
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result).toBeInstanceOf(PartyAssociationEntity);
    expect(result.id).toBe("18");
    expect(result.name).toBe("Acme Payments");
    expect(result.createdAt).toBe("2026-08-24");
  });
});
