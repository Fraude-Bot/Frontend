import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MapTab from "@presentation/pages/report/components/MapTab";
import { exportRelationshipMap } from "@presentation/pages/report/components/map-export";
import { renderWithProviders } from "@/test/test-utils";
import type { FindRelationshipMapResult } from "@/core/domain/map/models/find-relationship-map.model";

vi.mock("@presentation/pages/report/components/map-export", async () => {
  const actual = await vi.importActual<
    typeof import("@presentation/pages/report/components/map-export")
  >("@presentation/pages/report/components/map-export");

  return {
    ...actual,
    exportRelationshipMap: vi.fn().mockResolvedValue(undefined),
  };
});

const mockedExport = vi.mocked(exportRelationshipMap);

const mapWithNodes: FindRelationshipMapResult = {
  nodes: [
    {
      id: "party:100",
      type: "party",
      partyId: "100",
      name: "Centro",
      kind: "scammer",
      isCenter: true,
    },
    {
      id: "contact:501",
      type: "contact",
      contactId: "501",
      label: "WhatsApp",
      detail: "555 123 4567",
      platform: "whatsapp",
    },
  ],
  edges: [
    {
      id: "e1",
      source: "contact:501",
      target: "party:100",
      kind: "contact",
    },
  ],
};

function renderMapTab(result: FindRelationshipMapResult) {
  const execute = vi.fn().mockResolvedValue(result);

  renderWithProviders(<MapTab partyId="100" partyType="scammer" />, {
    overrides: {
      findRelationshipMapByPartyUseCase: {
        execute,
        cancel: vi.fn(),
      },
    },
  });

  return { execute };
}

describe("MapTab export", () => {
  beforeEach(() => {
    mockedExport.mockReset();
    mockedExport.mockResolvedValue(undefined);

    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }

    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps export disabled when the map is empty", async () => {
    renderMapTab({ nodes: [], edges: [] });

    await waitFor(() => {
      expect(
        screen.getByText("No hay relaciones registradas para mostrar en el mapa."),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Exportar" })).toBeDisabled();
  });

  it("exports a PNG when the diagram is loaded", async () => {
    const user = userEvent.setup();
    renderMapTab(mapWithNodes);

    const exportButton = await screen.findByRole("button", { name: "Exportar" });
    await waitFor(() => {
      expect(exportButton).toBeEnabled();
    });

    await user.click(exportButton);

    await waitFor(() => {
      expect(mockedExport).toHaveBeenCalledWith(
        expect.objectContaining({
          fileName: "mapa-relaciones",
        }),
      );
    });
    expect(screen.queryByRole("menuitem", { name: "Exportar PDF" })).not.toBeInTheDocument();
  });
});
