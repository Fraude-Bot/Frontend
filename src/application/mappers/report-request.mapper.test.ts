import {
  toOrganizationReportRequest,
  toScammerReportRequest,
  type ReportCommandDraft,
} from "@/application/mappers/report-request.mapper";

function createDraft(): ReportCommandDraft {
  return {
    companyName: "  Acme  ",
    individualName: "  Alice  ",
    reportTitle: "  Reporte  ",
    reportDescription: "  Descripción  ",
    avatarPath: "profiles/a.png",
    evidencePaths: ["proofs/a.png"],
    contacts: [
      { platform: "Webpage", url: "  https://example.com  " },
      { platform: "Unknown", url: " value " },
    ],
    payments: [
      { type: "1", reference: " 4111111111111111 " },
      { type: "unknown", reference: " wallet " },
    ],
    products: [" Crypto ", "", " Stocks "],
    collaborators: [
      {
        name: "  Bob  ",
        avatarPath: "profiles/bob.png",
        contacts: [{ platform: "Email", url: " bob@example.com " }],
        payments: [],
      },
    ],
    organizations: [
      {
        name: "  Example Corp  ",
        avatarPath: "profiles/org.png",
        contacts: [],
        payments: [{ type: "wallet", reference: " 0x123 " }],
      },
    ],
    contactEmail: "  reporter@example.com  ",
  };
}

describe("report request mapper", () => {
  it("normalizes an organization report command", () => {
    expect(toOrganizationReportRequest(createDraft())).toEqual({
      email: "reporter@example.com",
      title: "Reporte",
      description: "Descripción",
      profile_picture: "profiles/a.png",
      proofs: ["proofs/a.png"],
      organization: { name: "Acme" },
      contacts: [
        { platform: "url", reference: "https://example.com" },
        { platform: "other", reference: "value" },
      ],
      payment_methods: [
        { type: 1, reference: "4111111111111111" },
        { type: "other", reference: "wallet" },
      ],
      products: ["Crypto", "Stocks"],
      scammers: [
        {
          name: "Bob",
          profile_picture: "profiles/bob.png",
          contacts: [{ platform: "email", reference: "bob@example.com" }],
        },
      ],
    });
  });

  it("normalizes a scammer report command", () => {
    const result = toScammerReportRequest(createDraft());

    expect(result.email).toBe("reporter@example.com");
    expect(result.scammer).toEqual({ name: "Alice" });
    expect(result.organizations).toEqual([
      {
        name: "Example Corp",
        profile_picture: "profiles/org.png",
        payment_methods: [{ type: "wallet", reference: "0x123" }],
      },
    ]);
  });

  it("omits optional media and linked parties when absent", () => {
    const draft = createDraft();
    draft.avatarPath = null;
    draft.evidencePaths = [];
    draft.collaborators = [];

    const result = toOrganizationReportRequest(draft);

    expect(result).not.toHaveProperty("profile_picture");
    expect(result).not.toHaveProperty("proofs");
    expect(result).not.toHaveProperty("scammers");
  });
});
