import ContactSummaryEntity from "@/core/domain/contact/entities/contact-summary.entity";
import CreateScammerContactUsecase from "@/application/usecases/contact/create-scammer-contact.usecase";
import Http from "@/infrastructure/http/http";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { API_ROUTES } from "@/infrastructure/config/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

describe("CreateScammerContactUsecase", () => {
  let useCase: CreateScammerContactUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new CreateScammerContactUsecase(new PublicApiAdapter());
  });

  it("posts a scammer contact and maps the stored contact", async () => {
    mockedHttp.post.mockResolvedValue({
      status: 201,
      data: {
        id: 12,
        reference: "ruja",
        platform: "Facebook",
        created_at: "2026-10-16",
        is_active: true,
      },
    } as never);

    const result = await useCase.execute("1", {
      reference: " https://facebook.com/ruja ",
    });

    expect(mockedHttp.post).toHaveBeenCalledWith(
      API_ROUTES.public.scammers.contacts.replace("{id}", "1"),
      { reference: "https://facebook.com/ruja" },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
    expect(result).toBeInstanceOf(ContactSummaryEntity);
    expect(result.id).toBe("12");
    expect(result.name).toBe("ruja");
    expect(result.reference).toBe("ruja");
    expect(result.platform).toBe("Facebook");
    expect(result.createdAt).toBe("2026-10-16");
    expect(result.isActive).toBe(true);
  });

  it("rejects a response that is not a created contact", async () => {
    mockedHttp.post.mockResolvedValue({
      status: 200,
      data: { id: 12 },
    } as never);

    await expect(
      useCase.execute("1", { reference: "ruja" }),
    ).rejects.toThrow("The contact was not created.");
  });

  it("aborts in-flight requests when cancel is called", async () => {
    let capturedSignal: AbortSignal | undefined;

    mockedHttp.post.mockImplementation((_url, _body, config) => {
      capturedSignal = config?.signal as AbortSignal;

      return new Promise(() => undefined);
    });

    void useCase.execute("1", { reference: "ruja" });
    useCase.cancel();

    expect(capturedSignal?.aborted).toBe(true);
  });
});
