import { buildMapGraphFromApi } from "@presentation/pages/report/components/map-graph";
import type { FindRelationshipMapResult } from "@/core/domain/map/models/find-relationship-map.model";

const baseMap: FindRelationshipMapResult = {
  nodes: [
    {
      id: "party:100",
      type: "party",
      partyId: "100",
      name: "Centro",
      kind: "scammer",
      isCenter: true,
    },
    {
      id: "party:200",
      type: "party",
      partyId: "200",
      name: "Vecino",
      kind: "organization",
      isCenter: false,
    },
    {
      id: "contact:501",
      type: "contact",
      contactId: "501",
      label: "WhatsApp",
      detail: "555 123 4567",
      platform: "whatsapp",
    },
    {
      id: "payment:601",
      type: "payment_method",
      paymentMethodId: "601",
      label: "CLABE",
      detail: "012345678901234567",
    },
  ],
  edges: [
    {
      id: "e1",
      source: "contact:501",
      target: "party:100",
      kind: "contact",
    },
    {
      id: "e2",
      source: "payment:601",
      target: "party:100",
      kind: "payment",
    },
    {
      id: "e3",
      source: "party:100",
      target: "party:200",
      kind: "linked",
    },
  ],
};

describe("buildMapGraphFromApi", () => {
  it("keeps API node ids when they are unique", () => {
    const { nodes, edges } = buildMapGraphFromApi(baseMap, "100", "scammer");

    expect(nodes).toHaveLength(4);
    expect(nodes.find((node) => node.id === "party:100")).toMatchObject({
      type: "party",
      data: {
        partyId: "100",
        name: "Centro",
        kind: "scammer",
        isCurrent: true,
      },
    });
    expect(nodes.find((node) => node.id === "contact:501")).toMatchObject({
      type: "satellite",
      data: {
        kind: "contact",
        label: "WhatsApp",
        detail: "555 123 4567",
        platform: "whatsapp",
      },
    });
    expect(edges).toHaveLength(3);
    expect(edges[0]).toMatchObject({
      source: "party:100",
      target: "contact:501",
    });
    expect(edges[1]).toMatchObject({
      source: "party:100",
      target: "payment:601",
    });
    expect(edges[2]).toMatchObject({
      source: "party:200",
      target: "party:100",
    });
  });

  it("derives the center party from party id when is_center is false", () => {
    const map: FindRelationshipMapResult = {
      nodes: [
        {
          id: "party:100",
          type: "party",
          partyId: "100",
          name: "Centro",
          kind: "scammer",
          isCenter: false,
        },
      ],
      edges: [],
    };

    const { nodes } = buildMapGraphFromApi(map, "100", "scammer");

    expect(nodes[0]?.data).toMatchObject({ isCurrent: true });
  });

  it("positions neighbor parties above the center node", () => {
    const { nodes } = buildMapGraphFromApi(baseMap, "100", "scammer");
    const center = nodes.find((node) => node.id === "party:100");
    const neighbor = nodes.find((node) => node.id === "party:200");

    expect(neighbor?.position.y).toBeLessThan(center?.position.y ?? 0);
  });

  it("positions satellites below their parent party", () => {
    const { nodes } = buildMapGraphFromApi(baseMap, "100", "scammer");
    const center = nodes.find((node) => node.id === "party:100");
    const contact = nodes.find((node) => node.id === "contact:501");

    expect(contact?.position.y).toBeGreaterThan(center?.position.y ?? 0);
  });

  it("places payments below contacts in separate zones", () => {
    const { nodes } = buildMapGraphFromApi(baseMap, "100", "scammer");
    const contact = nodes.find((node) => node.id === "contact:501");
    const payment = nodes.find((node) => node.id === "payment:601");

    expect(payment?.position.y).toBeGreaterThan(contact?.position.y ?? 0);
  });

  it("never overlaps the center party node", () => {
    const map: FindRelationshipMapResult = {
      nodes: [
        {
          id: "party:100",
          type: "party",
          partyId: "100",
          name: "Centro",
          kind: "scammer",
          isCenter: true,
        },
        ...Array.from({ length: 5 }, (_, index) => ({
          id: `party:org:${index + 1}`,
          type: "party" as const,
          partyId: String(index + 1),
          name: `Org ${index + 1}`,
          kind: "organization" as const,
          isCenter: false,
        })),
        ...Array.from({ length: 4 }, (_, index) => ({
          id: `contact:${index + 1}`,
          type: "contact" as const,
          contactId: String(index + 1),
          label: "Email",
          detail: `user${index + 1}@example.com`,
          platform: "email",
        })),
        ...Array.from({ length: 3 }, (_, index) => ({
          id: `payment:${index + 1}`,
          type: "payment_method" as const,
          paymentMethodId: String(index + 1),
          label: "CLABE",
          detail: `01234567890123456${index}`,
        })),
      ],
      edges: [
        ...Array.from({ length: 5 }, (_, index) => ({
          id: `link:${index + 1}`,
          source: "party:100",
          target: `party:org:${index + 1}`,
          kind: "linked" as const,
        })),
        ...Array.from({ length: 4 }, (_, index) => ({
          id: `contact-edge:${index + 1}`,
          source: `contact:${index + 1}`,
          target: "party:100",
          kind: "contact" as const,
        })),
        ...Array.from({ length: 3 }, (_, index) => ({
          id: `payment-edge:${index + 1}`,
          source: `payment:${index + 1}`,
          target: "party:100",
          kind: "payment" as const,
        })),
      ],
    };

    const { nodes } = buildMapGraphFromApi(map, "100", "scammer");
    const center = nodes.find((node) => node.id === "party:100");

    expect(center).toBeDefined();

    const centerRect = {
      x: center!.position.x - 24,
      y: center!.position.y - 24,
      width: 208 + 48,
      height: 88 + 48,
    };

    for (const node of nodes) {
      if (node.id === center!.id) {
        continue;
      }

      const nodeRect = {
        x: node.position.x,
        y: node.position.y,
        width: 208,
        height: 88,
      };

      const overlaps =
        nodeRect.x < centerRect.x + centerRect.width &&
        nodeRect.x + nodeRect.width > centerRect.x &&
        nodeRect.y < centerRect.y + centerRect.height &&
        nodeRect.y + nodeRect.height > centerRect.y;

      expect(overlaps).toBe(false);
    }
  });

  it("fans nodes around the center in distinct zones", () => {
    const map: FindRelationshipMapResult = {
      nodes: [
        {
          id: "party:100",
          type: "party",
          partyId: "100",
          name: "Centro",
          kind: "scammer",
          isCenter: true,
        },
        ...Array.from({ length: 4 }, (_, index) => ({
          id: `party:org:${index + 1}`,
          type: "party" as const,
          partyId: String(index + 1),
          name: `Org ${index + 1}`,
          kind: "organization" as const,
          isCenter: false,
        })),
        ...Array.from({ length: 5 }, (_, index) => ({
          id: `contact:${index + 1}`,
          type: "contact" as const,
          contactId: String(index + 1),
          label: "Email",
          detail: `user${index + 1}@example.com`,
          platform: "email",
        })),
      ],
      edges: [
        ...Array.from({ length: 4 }, (_, index) => ({
          id: `link:${index + 1}`,
          source: "party:100",
          target: `party:org:${index + 1}`,
          kind: "linked" as const,
        })),
        ...Array.from({ length: 5 }, (_, index) => ({
          id: `contact-edge:${index + 1}`,
          source: `contact:${index + 1}`,
          target: "party:100",
          kind: "contact" as const,
        })),
      ],
    };

    const { nodes } = buildMapGraphFromApi(map, "100", "scammer");
    const center = nodes.find((node) => node.id === "party:100");
    const neighbors = nodes.filter(
      (node) => node.type === "party" && !node.data.isCurrent,
    );
    const contacts = nodes.filter((node) => node.id.startsWith("contact:"));

    expect(new Set(neighbors.map((node) => node.position.x)).size).toBeGreaterThan(1);
    expect(new Set(contacts.map((node) => node.position.x)).size).toBeGreaterThan(1);

    for (const neighbor of neighbors) {
      expect(neighbor.position.y).toBeLessThan(center?.position.y ?? 0);
    }

    for (const contact of contacts) {
      expect(contact.position.y).toBeGreaterThan(center?.position.y ?? 0);
    }
  });

  it("keeps layout stable for the same map data", () => {
    const first = buildMapGraphFromApi(baseMap, "100", "scammer");
    const second = buildMapGraphFromApi(baseMap, "100", "scammer");

    expect(first.nodes.map((node) => node.position)).toEqual(
      second.nodes.map((node) => node.position),
    );
  });

  it("renders kind-qualified party ids from the API", () => {
    const map: FindRelationshipMapResult = {
      nodes: [
        {
          id: "party:scammer:1",
          type: "party",
          partyId: "1",
          name: "Jho Low",
          kind: "scammer",
          isCenter: true,
        },
        {
          id: "party:organization:1",
          type: "party",
          partyId: "1",
          name: "Aras Investment",
          kind: "organization",
          isCenter: false,
        },
      ],
      edges: [],
    };

    const { nodes } = buildMapGraphFromApi(map, "1", "scammer");

    expect(nodes).toHaveLength(2);
    expect(nodes.find((node) => node.id === "party:scammer:1")).toMatchObject({
      data: { name: "Jho Low", isCurrent: true },
    });
    expect(
      nodes.find((node) => node.id === "party:organization:1"),
    ).toMatchObject({
      data: { name: "Aras Investment", isCurrent: false },
    });
  });

  it("disambiguates party ids only when the API reuses the same node id", () => {
    const map: FindRelationshipMapResult = {
      nodes: [
        {
          id: "party:1",
          type: "party",
          partyId: "1",
          name: "Jho Low",
          kind: "scammer",
          isCenter: true,
        },
        {
          id: "party:1",
          type: "party",
          partyId: "1",
          name: "Aras Investment",
          kind: "organization",
          isCenter: false,
        },
      ],
      edges: [],
    };

    const { nodes } = buildMapGraphFromApi(map, "1", "scammer");

    expect(nodes).toHaveLength(2);
    expect(nodes.find((node) => node.id === "party:scammer:1")).toMatchObject({
      data: { name: "Jho Low", isCurrent: true },
    });
    expect(nodes.find((node) => node.id === "party:organization:1")).toMatchObject({
      data: { name: "Aras Investment", isCurrent: false },
    });
  });

  it("renders satellites without edges by attaching them to the center party", () => {
    const map: FindRelationshipMapResult = {
      nodes: [
        {
          id: "party:scammer:1",
          type: "party",
          partyId: "1",
          name: "Jho Low",
          kind: "scammer",
          isCenter: true,
        },
        {
          id: "contact:1",
          type: "contact",
          contactId: "1",
          label: "Email",
          detail: "freda85@example.com",
          platform: "email",
        },
        {
          id: "payment_method:1",
          type: "payment_method",
          paymentMethodId: "1",
          label: "CLABE",
          detail: "3145914092",
        },
      ],
      edges: [],
    };

    const { nodes } = buildMapGraphFromApi(map, "1", "scammer");

    expect(nodes).toHaveLength(3);
    expect(nodes.find((node) => node.id === "contact:1")).toBeDefined();
    expect(nodes.find((node) => node.id === "payment_method:1")).toBeDefined();
  });
});
