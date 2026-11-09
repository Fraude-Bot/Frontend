import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { ReactFlowProvider } from "@xyflow/react";
import MapSatelliteNode from "@presentation/pages/report/components/MapSatelliteNode";
import type { MapSatelliteNode as MapSatelliteNodeType } from "@presentation/pages/report/components/map-graph";

function renderSatelliteNode(data: MapSatelliteNodeType["data"]) {
  render(
    <MemoryRouter>
      <ReactFlowProvider>
        <MapSatelliteNode
          id="satellite-1"
          type="satellite"
          selected={false}
          dragging={false}
          zIndex={0}
          draggable={false}
          selectable={false}
          deletable={false}
          positionAbsoluteX={0}
          positionAbsoluteY={0}
          isConnectable={false}
          data={data}
        />
      </ReactFlowProvider>
    </MemoryRouter>,
  );
}

describe("MapSatelliteNode", () => {
  it("renders contact satellites as external links", () => {
    renderSatelliteNode({
      kind: "contact",
      label: "Email",
      detail: "freda85@example.com",
      platform: "Email",
    });

    const link = screen.getByRole("link", { name: "Abrir Email" });
    expect(link).toHaveAttribute("href", "mailto:freda85@example.com");
    expect(screen.getByText("freda85@example.com")).toBeInTheDocument();
  });

  it("renders wallet payment satellites as external links", () => {
    renderSatelliteNode({
      kind: "payment_method",
      label: "Wallet",
      detail: "0x87e33e9e3cdd7dae27f1263993c9c99fce59c909",
      paymentType: 4,
    });

    const link = screen.getByRole("link", {
      name: "Abrir Wallet: 0x87e33e9e3cdd7dae27f1263993c9c99fce59c909",
    });
    expect(link).toHaveAttribute(
      "href",
      "https://etherscan.io/address/0x87e33e9e3cdd7dae27f1263993c9c99fce59c909",
    );
  });

  it("renders searchable payment satellites as copy controls", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderSatelliteNode({
      kind: "payment_method",
      label: "CLABE",
      detail: "3145914092",
      paymentType: 2,
    });

    const button = screen.getByRole("button", {
      name: "Copiar CLABE: 3145914092",
    });
    expect(screen.queryByRole("link", { name: /CLABE/ })).not.toBeInTheDocument();
    expect(screen.getByText("3145914092")).toBeInTheDocument();
    expect(screen.getByText("CLABE")).toBeInTheDocument();

    await userEvent.click(button);
    expect(writeText).toHaveBeenCalledWith("3145914092");

    await waitFor(() => {
      expect(within(button).getAllByText("Copiado").length).toBeGreaterThan(0);
    });
  });

  it("copies card payment satellites on click", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });

    renderSatelliteNode({
      kind: "payment_method",
      label: "Tarjeta",
      detail: "4152 3134 2132 3123",
      paymentType: 1,
    });

    const button = screen.getByRole("button", {
      name: "Copiar Tarjeta: 4152 3134 2132 3123",
    });
    await userEvent.click(button);
    expect(writeText).toHaveBeenCalledWith("4152 3134 2132 3123");
  });
});
