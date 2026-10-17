import { describe, expect, it } from "vitest";
import PartyAssociationEntity from "@/core/domain/association/entities/party-association.entity";

describe("PartyAssociationEntity", () => {
  function createAssociation() {
    return new PartyAssociationEntity("7", "Ada", "2026-01-15");
  }

  it("should return the association id", () => {
    expect(createAssociation().id).toBe("7");
  });

  it("should return the association name", () => {
    expect(createAssociation().name).toBe("Ada");
  });

  it("should return the association creation date", () => {
    expect(createAssociation().createdAt).toBe("2026-01-15");
  });
});
