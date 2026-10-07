import {
  getContactHref,
  getPlatformLabel,
} from "@presentation/pages/report/components/contact-platform";

describe("getPlatformLabel", () => {
  it("maps known platforms to display labels", () => {
    expect(getPlatformLabel("Whatsapp")).toBe("WhatsApp");
    expect(getPlatformLabel("Youtube")).toBe("YouTube");
    expect(getPlatformLabel("Webpage")).toBe("Webpage");
    expect(getPlatformLabel("Url")).toBe("Webpage");
    expect(getPlatformLabel("Email")).toBe("Email");
    expect(getPlatformLabel("Cellphone")).toBe("Cellphone");
    expect(getPlatformLabel("Other")).toBe("Otro");
  });

  it("returns the original platform when it is unknown", () => {
    expect(getPlatformLabel("Signal")).toBe("Signal");
  });
});

describe("getContactHref", () => {
  it("builds an https link for bare domains", () => {
    expect(getContactHref("www.facebook.com/profile.php?id=1")).toBe(
      "https://www.facebook.com/profile.php?id=1",
    );
  });

  it("keeps an existing protocol", () => {
    expect(getContactHref("https://nomad-store.example/checkout")).toBe(
      "https://nomad-store.example/checkout",
    );
  });

  it("builds mailto, tel, and WhatsApp links", () => {
    expect(getContactHref("fritz.rice@example.com", "Email")).toBe(
      "mailto:fritz.rice@example.com",
    );
    expect(getContactHref("+52 666 123 1234", "Cellphone")).toBe(
      "tel:+526661231234",
    );
    expect(getContactHref("+52 666 123 1234", "Whatsapp")).toBe(
      "https://wa.me/526661231234",
    );
    expect(getContactHref("+52 669 123 1234", "Whatsapp")).toBe(
      "https://wa.me/526691231234",
    );
  });

  it("builds social profile links from usernames", () => {
    expect(getContactHref("kyliejenner", "Instagram")).toBe(
      "https://www.instagram.com/kyliejenner",
    );
    expect(getContactHref("@kyliejenner", "Instagram")).toBe(
      "https://www.instagram.com/kyliejenner",
    );
    expect(getContactHref("cedano", "Telegram")).toBe("https://t.me/cedano");
    expect(getContactHref("+526691231234", "Telegram")).toBe(
      "https://t.me/+526691231234",
    );
    expect(getContactHref("creatorhandle", "TikTok")).toBe(
      "https://www.tiktok.com/@creatorhandle",
    );
    expect(getContactHref("@creatorhandle", "Youtube")).toBe(
      "https://www.youtube.com/@creatorhandle",
    );
    expect(getContactHref("john.doe", "Facebook")).toBe(
      "https://www.facebook.com/john.doe",
    );
  });

  it("keeps full URLs for social platforms", () => {
    expect(
      getContactHref("https://www.instagram.com/kyliejenner", "Instagram"),
    ).toBe("https://www.instagram.com/kyliejenner");
    expect(getContactHref("https://t.me/cedano", "Telegram")).toBe(
      "https://t.me/cedano",
    );
  });

  it("returns a fallback href for empty references", () => {
    expect(getContactHref("   ")).toBe("#");
  });
});
