import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import LookupForm from "@/presentation/pages/home/components/LookupForm";
import ReportSummaryEntity from "@/core/domain/report/entities/report-summary.entity";
import Search from "@/presentation/pages/search/Search";
import { renderWithProviders } from "@/test/test-utils";
import Formatter from "@/presentation/shared/utils/formatter";
import { APP_ROUTES } from "@/common/app-routes";
import { DependencyProvider } from "@/presentation/providers/DependencyProvider";
import { createDependencies } from "@/infrastructure/di/container";

function createMockSearchResult(page = 1, total = 25) {
  return {
    data: [
      new ReportSummaryEntity(
        "1",
        "Cached Result",
        ["fraud"],
        3,
        "scammer",
        null,
        ["card"],
        "active",
      ),
    ],
    total,
    page,
    count: 10,
  };
}

describe("Home LookupForm", () => {
  it("formats numeric input while typing", async () => {
    const user = userEvent.setup();

    renderWithProviders(<LookupForm />, { route: "/" });

    const input = screen.getByRole("textbox", { name: /buscar por/i });

    await user.type(input, "4111111111111111");

    expect(input).toHaveValue("4111 1111 1111 1111");
  });

  it("navigates to search page on submit", async () => {
    const user = userEvent.setup();
    const router = createMemoryRouter(
      [
        { path: APP_ROUTES.home, element: <LookupForm /> },
        { path: APP_ROUTES.search, element: <div>Search Page</div> },
      ],
      { initialEntries: ["/"] },
    );

    render(<RouterProvider router={router} />);

    const input = screen.getByRole("textbox", { name: /buscar por/i });

    await user.type(input, "john doe");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(router.state.location.pathname).toBe(APP_ROUTES.search);
    expect(router.state.location.search).toBe("?q=john+doe");
  });
});

describe("Search page", () => {
  it("renders results from the search use case", async () => {
    const execute = vi.fn().mockResolvedValue(createMockSearchResult());

    renderWithProviders(<Search />, {
      route: `${APP_ROUTES.search}?q=test`,
      overrides: {
        searchReportUseCase: {
          execute,
          cancel: vi.fn(),
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText("Cached Result")).toBeInTheDocument();
    });

    expect(execute).toHaveBeenCalledWith("test", 1);
  });

  it("removes formatting spaces before searching a numeric query", async () => {
    const execute = vi.fn().mockResolvedValue(createMockSearchResult());

    renderWithProviders(<Search />, {
      route: `${APP_ROUTES.search}?q=4111+1111+1111+1111`,
      overrides: {
        searchReportUseCase: {
          execute,
          cancel: vi.fn(),
        },
      },
    });

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith("4111111111111111", 1);
    });
  });

  it("uses cached results without calling the use case", async () => {
    const execute = vi.fn();
    const cachedResult = createMockSearchResult();
    const formattedQuery = Formatter.FormatInput("cached");

    sessionStorage.setItem(
      `fraudebot:search:${formattedQuery}:1`,
      JSON.stringify({
        data: [
          {
            id: "1",
            name: "Cached Result",
            tags: ["fraud"],
            reports: 3,
            type: "scammer",
            organizations: null,
            products: ["card"],
            status: "active",
          },
        ],
        total: cachedResult.total,
        page: cachedResult.page,
        count: cachedResult.count,
        cachedAt: Date.now(),
      }),
    );

    renderWithProviders(<Search />, {
      route: `${APP_ROUTES.search}?q=cached`,
      overrides: {
        searchReportUseCase: {
          execute,
          cancel: vi.fn(),
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText("Cached Result")).toBeInTheDocument();
    });

    expect(execute).not.toHaveBeenCalled();
  });

  it("shows pagination controls for multi-page results", async () => {
    const execute = vi
      .fn()
      .mockResolvedValueOnce(createMockSearchResult(1, 25))
      .mockResolvedValueOnce(createMockSearchResult(2, 25));

    const user = userEvent.setup();

    renderWithProviders(<Search />, {
      route: `${APP_ROUTES.search}?q=test`,
      overrides: {
        searchReportUseCase: {
          execute,
          cancel: vi.fn(),
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText("Cached Result")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Página 2" }));

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith("test", 2);
    });
  });

  it("shows an actionable error instead of an empty result", async () => {
    const execute = vi.fn().mockRejectedValue(new Error("offline"));

    renderWithProviders(<Search />, {
      route: `${APP_ROUTES.search}?q=test`,
      overrides: {
        searchReportUseCase: {
          execute,
          cancel: vi.fn(),
        },
      },
    });

    expect(
      await screen.findByRole("heading", { name: "La búsqueda falló" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("No se encontraron resultados"),
    ).not.toBeInTheDocument();
  });

  it("reacts to browser navigation changes in the query string", async () => {
    const execute = vi.fn().mockResolvedValue(createMockSearchResult());
    const router = createMemoryRouter(
      [{ path: APP_ROUTES.search, element: <Search /> }],
      { initialEntries: [`${APP_ROUTES.search}?q=first`] },
    );

    render(
      <DependencyProvider
        dependencies={createDependencies()}
        overrides={{
          searchReportUseCase: { execute, cancel: vi.fn() },
        }}
      >
        <RouterProvider router={router} />
      </DependencyProvider>,
    );

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith("first", 1);
    });

    await router.navigate(`${APP_ROUTES.search}?q=second&p=2`);

    await waitFor(() => {
      expect(execute).toHaveBeenCalledWith("second", 2);
    });
  });
});
