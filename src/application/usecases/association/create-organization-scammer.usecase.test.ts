import PartyAssociationEntity from "@/core/domain/association/entities/party-association.entity";
import CreateOrganizationScammerUsecase from "@/application/usecases/association/create-organization-scammer.usecase";
import Http from "@/infrastructure/http/http";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { API_ROUTES } from "@/infrastructure/config/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

describe("CreateOrganizationScammerUsecase", () => {
  let useCase: CreateOrganizationScammerUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateOrganizationScammerUsecase(new PublicApiAdapter());
  });

  it("posts the name, picture path, contacts, and payment methods", async () => {
    mockedHttp.post.mockResolvedValue({
      status: 201,
      data: {
        id: 18,
        name: "Jane Doe",
        created_at: "2026-08-24",
      },
    } as never);

    const result = await useCase.execute("4", {
      name: "  Jane Doe  ",
      profile_picture_path: " /storage/tmp/reports/profiles/8f3c1a.jpg ",
      contacts: [
        { reference: " +52 55 1111 2222 " },
        { reference: "   " },
      ],
      payment_methods: [{ reference: " 032180000118359719 " }],
    });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      API_ROUTES.public.organizations.scammers.replace("{id}", "4"),
      {
        name: "Jane Doe",
        profile_picture_path: "/storage/tmp/reports/profiles/8f3c1a.jpg",
        contacts: [{ reference: "+52 55 1111 2222" }],
        payment_methods: [{ reference: "032180000118359719" }],
      },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result).toBeInstanceOf(PartyAssociationEntity);
    expect(result.id).toBe("18");
    expect(result.name).toBe("Jane Doe");
    expect(result.createdAt).toBe("2026-08-24");
  });
});
