import { render } from "@testing-library/react";
import ProfileSeo from "@/presentation/shared/components/ProfileSeo";

describe("ProfileSeo", () => {
  it("publishes indexable metadata and structured data for an active profile", () => {
    render(
      <ProfileSeo
        id="20"
        name="Joseph Nacchio"
        type="scammer"
        reports={3}
        categories={["Stocks", "Crypto"]}
        active
        createdAt={new Date("2026-08-10T00:00:00.000Z")}
        image="https://cdn.example/profile.png"
      />,
    );

    expect(document.title).toBe(
      "Joseph Nacchio: reportes de fraude | FraudeBot",
    );
    expect(
      document.head.querySelector('meta[name="description"]'),
    ).toHaveAttribute(
      "content",
      "Joseph Nacchio: estafador reportado con 3 reportes comunitarios en FraudeBot. Categorías: Stocks, Crypto.",
    );
    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "index,follow,max-image-preview:large",
    );
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "http://localhost:3000/estafadores/20",
    );

    const jsonLd = JSON.parse(
      document.querySelector('script[type="application/ld+json"]')
        ?.textContent ?? "{}",
    );
    expect(jsonLd).toMatchObject({
      "@type": "ProfilePage",
      mainEntity: {
        "@type": "Person",
        name: "Joseph Nacchio",
        image: "https://cdn.example/profile.png",
      },
    });
  });

  it("marks inactive organizations as noindex", () => {
    render(
      <ProfileSeo
        id="7"
        name="Acme"
        type="organization"
        reports={1}
        categories={[]}
        active={false}
        createdAt={new Date("2026-08-10T00:00:00.000Z")}
      />,
    );

    expect(document.head.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex,follow",
    );
    expect(document.head.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      "http://localhost:3000/empresas/7",
    );
    const jsonLd = JSON.parse(
      document.querySelector('script[type="application/ld+json"]')
        ?.textContent ?? "{}",
    );
    expect(jsonLd.mainEntity["@type"]).toBe("Organization");
  });
});
