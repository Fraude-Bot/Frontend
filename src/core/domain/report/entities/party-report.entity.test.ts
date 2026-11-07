import { describe, it, expect } from "vitest";
import PartyReportEntity from "@/core/domain/report/entities/party-report.entity";

describe("PartyReportEntity.success", () => {
  function createReport() {
    return new PartyReportEntity(
      "1354",
      "¡Me estafó $2,000 MXN y estoy enojada!",
      "Estoy super enojada, me ofreció un lote de ropa por $2,000 MXN.",
      "2026-10-07",
    );
  }

  it("should create a new party report entity", () => {
    expect(createReport()).toBeDefined();
  });

  it("should return the report id", () => {
    expect(createReport().id).toBe("1354");
  });

  it("should return the report title", () => {
    expect(createReport().title).toBe("¡Me estafó $2,000 MXN y estoy enojada!");
  });

  it("should return the report description", () => {
    expect(createReport().description).toBe(
      "Estoy super enojada, me ofreció un lote de ropa por $2,000 MXN.",
    );
  });
});
