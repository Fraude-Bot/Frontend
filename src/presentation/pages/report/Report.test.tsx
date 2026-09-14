import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { APP_ROUTES } from "@/common/app-routes";
import MonthlyReportCountsEntity from "@/core/domain/report/entities/monthly-report-counts.entity";
import ScammerSummaryEntity from "@/core/domain/scammer/entities/scammer-summary.entity";
import Report from "@/presentation/pages/report/Report";
import { DependencyProvider } from "@/presentation/providers/DependencyProvider";
import type { Dependencies } from "@/infrastructure/di/container";

function renderScammerReport(
  execute: Dependencies["findScammerSummaryByIdUseCase"]["execute"],
  cancel = vi.fn(),
) {
  render(
    <DependencyProvider
      overrides={{
        findScammerSummaryByIdUseCase: { execute, cancel },
        findMonthlyReportCountsUseCase: {
          execute: vi
            .fn()
            .mockResolvedValue(
              new MonthlyReportCountsEntity(2026, Array(12).fill(0)),
            ),
          cancel: vi.fn(),
        },
      }}
    >
      <MemoryRouter initialEntries={["/estafadores/404"]}>
        <Routes>
          <Route
            path={APP_ROUTES.scammer}
            element={<Report type="scammer" />}
          />
        </Routes>
      </MemoryRouter>
    </DependencyProvider>,
  );

  return { cancel };
}

describe("Report page", () => {
  beforeEach(() => {
    document.title = "FraudeBot";
  });

  it("keeps the generic title while the profile is loading", () => {
    renderScammerReport(vi.fn().mockReturnValue(new Promise(() => {})));

    expect(document.title).toBe("FraudeBot");
  });

  it("sets the document title to the party name when loaded", async () => {
    renderScammerReport(
      vi.fn().mockResolvedValue(
        new ScammerSummaryEntity(
          "20",
          "Joseph Nacchio",
          "DM",
          null,
          3,
          ["Stocks"],
          false,
          new Date("2026-08-10"),
          new Date("2026-08-10"),
        ),
      ),
    );

    expect(
      await screen.findByRole("heading", { name: "Joseph Nacchio" }),
    ).toBeInTheDocument();
    expect(document.title).toBe("FraudeBot - Joseph Nacchio");
  });

  it("shows the report date as day-spanish-month-year", async () => {
    const createdAt = new Date("2026-08-10");

    renderScammerReport(
      vi.fn().mockResolvedValue(
        new ScammerSummaryEntity(
          "20",
          "Joseph Nacchio",
          "DM",
          null,
          3,
          ["Stocks"],
          false,
          createdAt,
          createdAt,
        ),
      ),
    );

    expect(await screen.findByText("Fecha del Reporte")).toBeInTheDocument();
    expect(screen.getByText("10-ago-2026")).toBeInTheDocument();
    expect(
      screen
        .getAllByRole("link", { name: "Reportar" })
        .find(
          (link) =>
            link.getAttribute("href") === "/reportar/estafadores/20",
        ),
    ).toBeDefined(
    );
  });

  it("shows a not-found state when the API returns 404", async () => {
    renderScammerReport(
      vi.fn().mockRejectedValue({ response: { status: 404 } }),
    );

    expect(
      await screen.findByRole("heading", { name: "Perfil no encontrado" }),
    ).toBeInTheDocument();
    expect(document.title).toBe("FraudeBot - Perfil no encontrado");
    expect(screen.queryByText(/cargando/i)).not.toBeInTheDocument();
  });

  it("copies the profile URL from the Compartir menu", async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderScammerReport(
      vi.fn().mockResolvedValue(
        new ScammerSummaryEntity(
          "20",
          "Joseph Nacchio",
          "DM",
          null,
          3,
          ["Stocks"],
          false,
          new Date("2026-08-10"),
          new Date("2026-08-10"),
        ),
      ),
    );

    await user.click(await screen.findByRole("button", { name: "Compartir" }));

    expect(
      screen.getByRole("menuitem", { name: "Copiar enlace" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("menuitem", { name: "Descargar PDF (próximamente)" }),
    ).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: /Exportar/ }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("menuitem", { name: "Copiar enlace" }));

    expect(writeText).toHaveBeenCalledWith(
      `${window.location.origin}/estafadores/20`,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Enlace copiado");
  });

  it("shows a retry action for transient failures", async () => {
    const user = userEvent.setup();
    const execute = vi.fn().mockRejectedValue(new Error("offline"));

    renderScammerReport(execute);

    expect(
      await screen.findByRole("button", { name: "Reintentar" }),
    ).toBeInTheDocument();
    expect(document.title).toBe("FraudeBot - Error");

    await user.click(screen.getByRole("button", { name: "Reintentar" }));

    expect(execute).toHaveBeenCalledTimes(2);
  });

  it("opens the Soporte tab from the profile navigation", async () => {
    const user = userEvent.setup();

    renderScammerReport(
      vi.fn().mockResolvedValue(
        new ScammerSummaryEntity(
          "20",
          "Joseph Nacchio",
          "DM",
          null,
          3,
          ["Stocks"],
          false,
          new Date("2026-08-10"),
          new Date("2026-08-10"),
        ),
      ),
    );

    await user.click(await screen.findByRole("tab", { name: "Soporte" }));

    expect(
      screen.getByRole("heading", { name: "¿Eres tú el reportado?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "reportes@fraudebot.com" }),
    ).toBeInTheDocument();
  });

  it("opens Soporte from the General tab shortcut panel", async () => {
    const user = userEvent.setup();

    renderScammerReport(
      vi.fn().mockResolvedValue(
        new ScammerSummaryEntity(
          "20",
          "Joseph Nacchio",
          "DM",
          null,
          3,
          ["Stocks"],
          false,
          new Date("2026-08-10"),
          new Date("2026-08-10"),
        ),
      ),
    );

    await user.click(
      await screen.findByRole("button", { name: /Soporte:/ }),
    );

    expect(
      screen.getByRole("heading", { name: "¿Eres tú el reportado?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Soporte" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
