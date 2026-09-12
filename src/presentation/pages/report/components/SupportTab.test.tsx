import { screen } from "@testing-library/react";
import SupportTab from "@presentation/pages/report/components/SupportTab";
import { APP_ROUTES } from "@/common/app-routes";
import { renderWithProviders } from "@/test/test-utils";

describe("SupportTab", () => {
  it("renders legal help, support, and reported-party content", () => {
    renderWithProviders(<SupportTab />);

    expect(
      screen.getByRole("heading", { name: "Ayuda jurídica:" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Soporte:" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "¿Eres tú el reportado?" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/estamos en contra de las calumnias/i),
    ).toBeInTheDocument();
  });

  it("links the legal help and support panels to the contact page", () => {
    renderWithProviders(<SupportTab />);

    expect(
      screen.getByRole("link", { name: /Ayuda jurídica/ }),
    ).toHaveAttribute("href", APP_ROUTES.contact);
    expect(screen.getByRole("link", { name: /Soporte:/ })).toHaveAttribute(
      "href",
      APP_ROUTES.contact,
    );
  });

  it("offers a mailto link for the reported-party email", () => {
    renderWithProviders(<SupportTab />);

    expect(
      screen.getByRole("link", { name: "reportes@fraudebot.com" }),
    ).toHaveAttribute("href", "mailto:reportes@fraudebot.com");
  });
});
