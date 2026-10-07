import type { Edge, Node } from "@xyflow/react";
import type {
  FindRelationshipMapResult,
  RelationshipMapEdge,
  RelationshipMapNode,
} from "@/core/domain/map/models/find-relationship-map.model";

export type PartyKind = "scammer" | "organization";
export type SatelliteKind = "contact" | "payment_method";

export type PartyNodeData = {
  partyId: string;
  name: string;
  kind: PartyKind;
  isCurrent: boolean;
};

export type ContactSatelliteNodeData = {
  kind: "contact";
  label: string;
  detail: string;
  platform: string;
};

export type PaymentSatelliteNodeData = {
  kind: "payment_method";
  label: string;
  detail: string;
  paymentType?: number;
};

export type SatelliteNodeData =
  | ContactSatelliteNodeData
  | PaymentSatelliteNodeData;

export type MapPartyNode = Node<PartyNodeData, "party">;
export type MapSatelliteNode = Node<SatelliteNodeData, "satellite">;
export type MapNode = MapPartyNode | MapSatelliteNode;

const nodeStyle = {
  padding: 0,
  border: "none",
  background: "transparent",
  width: "auto",
} as const;

const NODE_WIDTH = 208;
const NODE_HEIGHT = 88;
const MIN_NODE_GAP = 24;
const LAYOUT_CENTER_X = 400;
const LAYOUT_CENTER_Y = 300;
const MAX_NODES_PER_ARC = 4;

const NEIGHBOR_RADIUS = 230;
const NEIGHBOR_OUTER_RADIUS = 310;
const CONTACT_RADIUS = 210;
const PAYMENT_RADIUS = 300;

// Upper semicircle (neighbors above center).
const NEIGHBOR_ARC = { start: Math.PI * 1.1, end: Math.PI * 1.9 };
// Lower semicircle (contacts and payments below center).
const LOWER_ARC = { start: Math.PI * 0.1, end: Math.PI * 0.9 };
const PAYMENT_ARC = { start: Math.PI * 0.35, end: Math.PI * 0.65 };

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function hashString(value: string): number {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
}

function createSeededRandom(seed: number): () => number {
  let state = seed || 1;

  return () => {
    state = (state * 1664525 + 1013904223) | 0;
    return (state >>> 0) / 4294967296;
  };
}

function toRect(position: { x: number; y: number }): Rect {
  return {
    x: position.x,
    y: position.y,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
  };
}

function rectsOverlap(a: Rect, b: Rect, gap: number): boolean {
  return (
    a.x < b.x + b.width + gap &&
    a.x + a.width + gap > b.x &&
    a.y < b.y + b.height + gap &&
    a.y + a.height + gap > b.y
  );
}

function overlapsAny(rect: Rect, others: Rect[], gap: number): boolean {
  return others.some((other) => rectsOverlap(rect, other, gap));
}

function splitForArcs(ids: string[], maxPerArc: number = MAX_NODES_PER_ARC): string[][] {
  if (ids.length <= maxPerArc) {
    return [ids];
  }

  const midpoint = Math.ceil(ids.length / 2);
  return [ids.slice(0, midpoint), ids.slice(midpoint)];
}

function placeOnArc(
  ids: string[],
  centerX: number,
  centerY: number,
  baseRadius: number,
  angleStart: number,
  angleEnd: number,
  occupied: Rect[],
  reserved: Rect[],
): Map<string, { x: number; y: number }> {
  const positions = new Map<string, { x: number; y: number }>();

  if (ids.length === 0) {
    return positions;
  }

  const angleStep =
    ids.length === 1 ? 0 : (angleEnd - angleStart) / (ids.length - 1);

  ids.forEach((id, index) => {
    const random = createSeededRandom(hashString(id));
    const angle = angleStart + angleStep * index;

    for (let radiusOffset = 0; radiusOffset <= 140; radiusOffset += 14) {
      const radius = baseRadius + radiusOffset + (random() - 0.5) * 12;
      const position = {
        x: centerX + radius * Math.cos(angle) - NODE_WIDTH / 2,
        y: centerY + radius * Math.sin(angle) - NODE_HEIGHT / 2,
      };
      const rect = toRect(position);

      if (
        !overlapsAny(rect, reserved, MIN_NODE_GAP) &&
        !overlapsAny(rect, occupied, MIN_NODE_GAP)
      ) {
        positions.set(id, position);
        occupied.push(rect);
        break;
      }
    }
  });

  return positions;
}

function applyPositions(
  positions: Map<string, { x: number; y: number }>,
  next: Map<string, { x: number; y: number }>,
) {
  next.forEach((position, id) => {
    positions.set(id, position);
  });
}

function layoutArcGroup(
  ids: string[],
  centerX: number,
  centerY: number,
  innerRadius: number,
  outerRadius: number,
  arc: { start: number; end: number },
  occupied: Rect[],
  reserved: Rect[],
): Map<string, { x: number; y: number }> {
  const arcs = splitForArcs(ids);
  const result = new Map<string, { x: number; y: number }>();

  arcs.forEach((arcIds, index) => {
    const radius = index === 0 ? innerRadius : outerRadius;
    applyPositions(
      result,
      placeOnArc(
        arcIds,
        centerX,
        centerY,
        radius,
        arc.start,
        arc.end,
        occupied,
        reserved,
      ),
    );
  });

  return result;
}

function partitionSatellitesByKind(
  flowIds: string[],
  satelliteNodes: RelationshipMapNode[],
  getFlowNodeId: (node: RelationshipMapNode) => string,
): { contacts: string[]; payments: string[] } {
  const contacts: string[] = [];
  const payments: string[] = [];
  const remainingIds = new Set(flowIds);

  for (const node of satelliteNodes) {
    const flowId = getFlowNodeId(node);
    if (!remainingIds.has(flowId)) {
      continue;
    }

    if (node.type === "contact") {
      contacts.push(flowId);
      continue;
    }

    payments.push(flowId);
  }

  return { contacts, payments };
}

function partyNode(
  id: string,
  position: { x: number; y: number },
  data: PartyNodeData,
): MapPartyNode {
  return {
    id,
    type: "party",
    position,
    data,
    className: "nopan",
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    style: {
      ...nodeStyle,
      ...(data.isCurrent ? {} : { pointerEvents: "auto" }),
    },
  };
}

function satelliteNode(
  id: string,
  position: { x: number; y: number },
  data: SatelliteNodeData,
): MapSatelliteNode {
  return {
    id,
    type: "satellite",
    position,
    data,
    className: "nopan",
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    style: {
      ...nodeStyle,
      pointerEvents: "auto",
    },
  };
}

function findDuplicateApiIds(nodes: RelationshipMapNode[]): Set<string> {
  const counts = new Map<string, number>();

  for (const node of nodes) {
    counts.set(node.id, (counts.get(node.id) ?? 0) + 1);
  }

  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([id]) => id),
  );
}

function createNodeIdResolver(nodes: RelationshipMapNode[]) {
  const duplicateApiIds = findDuplicateApiIds(nodes);

  const getFlowNodeId = (node: RelationshipMapNode): string => {
    if (duplicateApiIds.has(node.id) && isPartyNode(node)) {
      return `party:${node.kind}:${node.partyId}`;
    }

    return node.id;
  };

  const apiIdToFlowId = new Map<string, string>();

  for (const node of nodes) {
    if (!duplicateApiIds.has(node.id)) {
      apiIdToFlowId.set(node.id, getFlowNodeId(node));
    }
  }

  return { getFlowNodeId, apiIdToFlowId };
}

function toFlowEdge(
  edge: RelationshipMapEdge,
  apiIdToFlowId: Map<string, string>,
  centerFlowId?: string,
): Edge | null {
  const apiSource = apiIdToFlowId.get(edge.source) ?? edge.source;
  const apiTarget = apiIdToFlowId.get(edge.target) ?? edge.target;

  if (!apiSource || !apiTarget) {
    return null;
  }

  const isSatelliteEdge =
    edge.kind === "contact" || edge.kind === "payment";
  const isCenterLinkedEdge =
    edge.kind === "linked" &&
    centerFlowId !== undefined &&
    apiSource === centerFlowId;

  let source = apiSource;
  let target = apiTarget;

  if (isSatelliteEdge) {
    // API stores satellite -> party; render party -> satellite so lines connect
    // from the party bottom handle to the satellite top handle.
    source = apiTarget;
    target = apiSource;
  } else if (isCenterLinkedEdge) {
    // API stores center -> neighbor; render neighbor -> center so lines connect
    // from the neighbor bottom handle to the center top handle.
    source = apiTarget;
    target = apiSource;
  }

  return {
    id: edge.id,
    source,
    target,
    style: { stroke: "#d1d5db" },
  };
}

function isPartyNode(
  node: RelationshipMapNode,
): node is Extract<RelationshipMapNode, { type: "party" }> {
  return node.type === "party";
}

function isSatelliteNode(
  node: RelationshipMapNode,
): node is Extract<
  RelationshipMapNode,
  { type: "contact" | "payment_method" }
> {
  return node.type === "contact" || node.type === "payment_method";
}

function buildMapGraphFromApi(
  map: FindRelationshipMapResult,
  centerPartyId: string,
  centerPartyKind: PartyKind,
): { nodes: MapNode[]; edges: Edge[] } {
  const partyNodes = map.nodes.filter(isPartyNode);
  const satelliteNodes = map.nodes.filter(isSatelliteNode);
  const { getFlowNodeId, apiIdToFlowId } = createNodeIdResolver(map.nodes);

  const centerParty =
    partyNodes.find((node) => node.isCenter) ??
    partyNodes.find(
      (node) =>
        node.partyId === centerPartyId && node.kind === centerPartyKind,
    ) ??
    partyNodes[0];

  const centerFlowId = centerParty ? getFlowNodeId(centerParty) : undefined;

  const neighborParties = centerParty
    ? partyNodes.filter((node) => getFlowNodeId(node) !== centerFlowId)
    : partyNodes;

  const positions = new Map<string, { x: number; y: number }>();
  const occupied: Rect[] = [];

  const centerPosition = {
    x: LAYOUT_CENTER_X - NODE_WIDTH / 2,
    y: LAYOUT_CENTER_Y - NODE_HEIGHT / 2,
  };
  const centerRect = toRect(centerPosition);
  const reserved: Rect[] = [
    {
      x: centerRect.x - MIN_NODE_GAP * 2,
      y: centerRect.y - MIN_NODE_GAP * 2,
      width: centerRect.width + MIN_NODE_GAP * 4,
      height: centerRect.height + MIN_NODE_GAP * 4,
    },
  ];

  if (centerParty && centerFlowId) {
    positions.set(centerFlowId, centerPosition);
    occupied.push(centerRect);
  }

  const neighborIds = neighborParties.map((node) => getFlowNodeId(node));
  applyPositions(
    positions,
    layoutArcGroup(
      neighborIds,
      LAYOUT_CENTER_X,
      LAYOUT_CENTER_Y,
      NEIGHBOR_RADIUS,
      NEIGHBOR_OUTER_RADIUS,
      NEIGHBOR_ARC,
      occupied,
      reserved,
    ),
  );

  const satellitesByParty = new Map<string, string[]>();

  for (const edge of map.edges) {
    if (edge.kind === "linked") {
      continue;
    }

    const satellite = satelliteNodes.find((node) => node.id === edge.source);
    const party = partyNodes.find((node) => node.id === edge.target);

    if (!satellite || !party) {
      continue;
    }

    const partyFlowId = getFlowNodeId(party);
    const satelliteFlowId = getFlowNodeId(satellite);
    const current = satellitesByParty.get(partyFlowId) ?? [];

    if (!current.includes(satelliteFlowId)) {
      satellitesByParty.set(partyFlowId, [...current, satelliteFlowId]);
    }
  }

  if (centerFlowId) {
    const linkedSatelliteIds = new Set(
      [...satellitesByParty.values()].flat(),
    );
    const orphanedSatellites = satelliteNodes
      .map((node) => getFlowNodeId(node))
      .filter((flowId) => !linkedSatelliteIds.has(flowId));

    if (orphanedSatellites.length > 0) {
      const current = satellitesByParty.get(centerFlowId) ?? [];
      satellitesByParty.set(centerFlowId, [...current, ...orphanedSatellites]);
    }
  }

  for (const [partyFlowId, satelliteFlowIds] of satellitesByParty) {
    const partyPosition = positions.get(partyFlowId);
    if (!partyPosition) {
      continue;
    }

    const isCenterParty = partyFlowId === centerFlowId;
    const { contacts, payments } = partitionSatellitesByKind(
      satelliteFlowIds,
      satelliteNodes,
      getFlowNodeId,
    );

    if (isCenterParty) {
      applyPositions(
        positions,
        layoutArcGroup(
          contacts,
          LAYOUT_CENTER_X,
          LAYOUT_CENTER_Y,
          CONTACT_RADIUS,
          CONTACT_RADIUS + 70,
          LOWER_ARC,
          occupied,
          reserved,
        ),
      );
      applyPositions(
        positions,
        layoutArcGroup(
          payments,
          LAYOUT_CENTER_X,
          LAYOUT_CENTER_Y,
          PAYMENT_RADIUS,
          PAYMENT_RADIUS + 70,
          PAYMENT_ARC,
          occupied,
          reserved,
        ),
      );
      continue;
    }

    applyPositions(
      positions,
      layoutArcGroup(
        satelliteFlowIds,
        partyPosition.x + NODE_WIDTH / 2,
        partyPosition.y + NODE_HEIGHT / 2,
        150,
        220,
        LOWER_ARC,
        occupied,
        [toRect(partyPosition)],
      ),
    );
  }

  const flowNodes: MapNode[] = map.nodes.flatMap((node) => {
    const flowId = getFlowNodeId(node);
    const position = positions.get(flowId);
    if (!position) {
      return [];
    }

    if (isPartyNode(node)) {
      return [
        partyNode(flowId, position, {
          partyId: node.partyId,
          name: node.name,
          kind: node.kind,
          isCurrent:
            node.isCenter ||
            (node.partyId === centerPartyId && node.kind === centerPartyKind),
        }),
      ];
    }

    return [
      node.type === "contact"
        ? satelliteNode(flowId, position, {
            kind: "contact",
            label: node.label,
            detail: node.detail,
            platform: node.platform,
          })
        : satelliteNode(flowId, position, {
            kind: "payment_method",
            label: node.label,
            detail: node.detail,
            paymentType: node.paymentType,
          }),
    ];
  });

  return {
    nodes: flowNodes,
    edges: map.edges
      .map((edge) => toFlowEdge(edge, apiIdToFlowId, centerFlowId))
      .filter((edge): edge is Edge => edge !== null),
  };
}

export { buildMapGraphFromApi };
