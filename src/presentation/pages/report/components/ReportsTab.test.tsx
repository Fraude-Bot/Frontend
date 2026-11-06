import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PartyReportEntity from "@/core/domain/report/entities/party-report.entity";
import ReportsTab from "@presentation/pages/report/components/ReportsTab";
import { renderWithProviders } from "@/test/test-utils";

function createReport(
  id: string,
  title: string,
  description: string,
): PartyReportEntity {
  return new PartyReportEntity(id, title, description);
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
    expect(screen.getByRole("button", { name: "Agregar +" })).toBeInTheDocument();
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

    expect(screen.getByRole("button", { name: "Agregar +" })).toBeInTheDocument();

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
});
