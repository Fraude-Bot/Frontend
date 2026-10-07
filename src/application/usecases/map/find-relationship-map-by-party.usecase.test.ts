import FindRelationshipMapByPartyUsecase from "@/application/usecases/map/find-relationship-map-by-party.usecase";
import Http from "@/infrastructure/http/http";
import PublicApiAdapter from "@/infrastructure/api/public-api.adapter";
import { API_ROUTES } from "@/infrastructure/config/environment";

vi.mock("@/infrastructure/http/http", () => ({
  default: {
    get: vi.fn(),
  },
}));

const mockedHttp = vi.mocked(Http);

describe("FindRelationshipMapByPartyUsecase", () => {
  let useCase: FindRelationshipMapByPartyUsecase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new FindRelationshipMapByPartyUsecase(new PublicApiAdapter());
  });

  it("maps a scammer map response", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        nodes: [
          {
            id: "10",
            type: "party",
            party_id: "10",
            name: "Juan Pérez",
            kind: "scammer",
            is_center: true,
          },
        ],
        edges: [],
      },
    } as never);

    const result = await useCase.execute("10", "scammer");

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.scammers.map.replace("{id}", "10"),
      expect.objectContaining({
        params: { depth: 1, limit: 20 },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.nodes).toHaveLength(1);
    expect(result.nodes[0]).toMatchObject({
      partyId: "10",
      kind: "scammer",
    });
    expect(result.edges).toEqual([]);
  });

  it("maps an organization map response and forwards depth and limit", async () => {
    mockedHttp.get.mockResolvedValue({
      status: 200,
      data: {
        nodes: [],
        edges: [],
      },
    } as never);

    await useCase.execute("7", "organization", 2, 50);

    expect(mockedHttp.get).toHaveBeenCalledWith(
      API_ROUTES.public.organizations.map.replace("{id}", "7"),
      expect.objectContaining({
        params: { depth: 2, limit: 50 },
      }),
    );
  });

  it("returns an empty graph on 404", async () => {
    mockedHttp.get.mockRejectedValue({
      response: { status: 404 },
    });

    const result = await useCase.execute("999", "scammer");

    expect(result).toEqual({ nodes: [], edges: [] });
  });

  it("rethrows non-404 errors", async () => {
    const error = new Error("Network error");
    mockedHttp.get.mockRejectedValue(error);

    await expect(useCase.execute("1", "scammer")).rejects.toThrow(error);
  });
});
