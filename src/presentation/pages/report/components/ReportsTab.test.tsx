import { useState } from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PartyReportEntity from "@/core/domain/report/entities/party-report.entity";
import ReportDetailEntity from "@/core/domain/report/entities/report-detail.entity";
import ReportsTab from "@presentation/pages/report/components/ReportsTab";
import { renderWithProviders } from "@/test/test-utils";

function createReport(
  id: string,
  title: string,
  description: string,
): PartyReportEntity {
  return new PartyReportEntity(id, title, description, "2026-11-01");
}

function createReportDetail(
  id: string,
  title = "Me estafó 5000 dólares esta empresa",
): ReportDetailEntity {
  return new ReportDetailEntity(
    id,
    title,
    "Hola quiero hacer un reporte de esta empresa que me estafó.",
    "2026-10-07",
    ["Inversiones", "Ponzi"],
    ["https://example.com/proof.png"],
    true,
  );
}

function createPage(page: number) {
  const reports = Array.from({ length: page === 3 ? 5 : 10 }, (_, index) =>
    createReport(
      String((page - 1) * 10 + index + 1),
      `Título del reporte ${page}-${index}`,
      `Descripción del reporte ${page}-${index} con suficiente texto para truncar.`,
    ),
  );

  return {
    data: reports,
    total: 25,
    page,
    count: 10,
  };
}

describe("ReportsTab", () => {
  it("renders ten reports from the reports use case", async () => {
    const execute = vi.fn().mockResolvedValue(createPage(1));

    renderWithProviders(
      <ReportsTab partyId="20" partyType="scammer" />,
      {
        overrides: {
          findReportsByPartyUseCase: {
            execute,
            cancel: vi.fn(),
          },
        },
      },
    );

    await waitFor(() => {
      expect(screen.getAllByRole("article")).toHaveLength(10);
    });

    expect(execute).toHaveBeenCalledWith("20", "scammer", 1);
    expect(screen.getByText("Historial de Reportes:")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Agregar Reporte +" })).toBeInTheDocument();
    expect(screen.getByText("#1 - Título del reporte 1-0")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Título del reporte 1-0/ }),
    ).toHaveAttribute("href", "/reportes/1");
    expect(screen.getByLabelText("Paginación de reportes")).toBeInTheDocument();
  });

  it("requests the next page from the use case", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce(createPage(1))
      .mockResolvedValueOnce(createPage(2));
    const user = userEvent.setup();

    renderWithProviders(
      <ReportsTab partyId="20" partyType="organization" />,
      {
        overrides: {
          findReportsByPartyUseCase: {
            execute,
            cancel: vi.fn(),
          },
        },
      },
    );

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Página 2" })).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Agregar Reporte +" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Página 2" }));

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith("20", "organization", 2);
    });
  });

  it("shows a loading state while the use case is pending", () => {
    const execute = vi.fn().mockReturnValue(new Promise(() => {}));

    renderWithProviders(<ReportsTab partyId="20" partyType="scammer" />, {
      overrides: {
        findReportsByPartyUseCase: {
          execute,
          cancel: vi.fn(),
        },
      },
    });

    expect(screen.getByText("Cargando reportes...")).toBeInTheDocument();
    expect(screen.queryByLabelText("Paginación de reportes")).not.toBeInTheDocument();
  });

  it("shows an empty state when there are no reports", async () => {
    const execute = vi.fn().mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      count: 0,
    });

    renderWithProviders(<ReportsTab partyId="20" partyType="scammer" />, {
      overrides: {
        findReportsByPartyUseCase: {
          execute,
          cancel: vi.fn(),
        },
      },
    });

    expect(await screen.findByText("No se encontraron reportes.")).toBeInTheDocument();
    expect(screen.queryByLabelText("Paginación de reportes")).not.toBeInTheDocument();
  });

  it("shows an error state and retries the request", async () => {
    const execute = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce(createPage(1));
    const user = userEvent.setup();

    renderWithProviders(<ReportsTab partyId="20" partyType="scammer" />, {
      overrides: {
        findReportsByPartyUseCase: {
          execute,
          cancel: vi.fn(),
        },
      },
    });

    expect(
      await screen.findByText(
        "No pudimos cargar los reportes. Revisa tu conexión e inténtalo de nuevo.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByLabelText("Paginación de reportes")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    await waitFor(() => {
      expect(screen.getAllByRole("article")).toHaveLength(10);
    });

    expect(execute).toHaveBeenCalledTimes(2);
  });

  it("calls onSelectReport when a report card is clicked", async () => {
    const execute = vi.fn().mockResolvedValue(createPage(1));
    const onSelectReport = vi.fn();
    const user = userEvent.setup();

    renderWithProviders(
      <ReportsTab
        partyId="20"
        partyType="scammer"
        onSelectReport={onSelectReport}
      />,
      {
        overrides: {
          findReportsByPartyUseCase: {
            execute,
            cancel: vi.fn(),
          },
        },
      },
    );

    await waitFor(() => {
      expect(screen.getAllByRole("article")).toHaveLength(10);
    });

    await user.click(
      screen.getByRole("button", { name: /Ver reporte Título del reporte 1-0/ }),
    );

    expect(onSelectReport).toHaveBeenCalledWith("1");
  });

  it("shows placeholder content when a report is selected", async () => {
    const execute = vi.fn().mockResolvedValue(createPage(1));
    const findReportById = vi.fn().mockResolvedValue(createReportDetail("1"));

    renderWithProviders(
      <ReportsTab
        partyId="20"
        partyType="scammer"
        selectedReportId="1"
        onSelectReport={vi.fn()}
        onBackFromReport={vi.fn()}
      />,
      {
        overrides: {
          findReportsByPartyUseCase: {
            execute,
            cancel: vi.fn(),
          },
          findReportByIdUseCase: {
            execute: findReportById,
            cancel: vi.fn(),
          },
        },
      },
    );

    expect(
      await screen.findByRole("heading", {
        name: "Me estafó 5000 dólares esta empresa",
      }),
    ).toBeInTheDocument();
    expect(findReportById).toHaveBeenCalledWith("1");
    expect(
      screen.getByRole("button", { name: /Volver al listado/ }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Historial de Reportes:")).not.toBeInTheDocument();
  });

  it("restores pagination and list scroll after returning from a report", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce(createPage(1))
      .mockResolvedValueOnce(createPage(2));
    const findReportById = vi
      .fn()
      .mockResolvedValue(createReportDetail("11", "Título del reporte 2-0"));
    const user = userEvent.setup();

    function ReportsTabHarness() {
      const [selectedReportId, setSelectedReportId] = useState<string | null>(
        null,
      );

      return (
        <ReportsTab
          partyId="20"
          partyType="scammer"
          selectedReportId={selectedReportId}
          onSelectReport={setSelectedReportId}
          onBackFromReport={() => setSelectedReportId(null)}
        />
      );
    }

    renderWithProviders(<ReportsTabHarness />, {
      overrides: {
        findReportsByPartyUseCase: {
          execute,
          cancel: vi.fn(),
        },
        findReportByIdUseCase: {
          execute: findReportById,
          cancel: vi.fn(),
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Página 2" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Página 2" }));

    await waitFor(() => {
      expect(screen.getByText("#11 - Título del reporte 2-0")).toBeInTheDocument();
    });

    const list = screen
      .getByText("#11 - Título del reporte 2-0")
      .closest(".overflow-y-scroll") as HTMLDivElement;
    list.scrollTop = 120;

    await user.click(
      screen.getByRole("button", { name: /Ver reporte Título del reporte 2-0/ }),
    );

    await screen.findByRole("heading", {
      name: "Título del reporte 2-0",
    });

    await user.click(screen.getByRole("button", { name: /Volver al listado/ }));

    await waitFor(() => {
      expect(screen.getByText("Historial de Reportes:")).toBeInTheDocument();
    });

    expect(screen.getByText("#11 - Título del reporte 2-0")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Página 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );

    const restoredList = screen
      .getByText("#11 - Título del reporte 2-0")
      .closest(".overflow-y-scroll") as HTMLDivElement;
    expect(restoredList.scrollTop).toBe(120);
    expect(execute).toHaveBeenCalledTimes(2);
  });
});
