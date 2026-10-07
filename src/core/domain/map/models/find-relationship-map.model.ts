type PartyKind = "scammer" | "organization";
type MapEdgeKind = "contact" | "payment" | "linked";

type RelationshipMapPartyNode = {
  id: string;
  type: "party";
  partyId: string;
  name: string;
  kind: PartyKind;
  isCenter: boolean;
};

type RelationshipMapContactNode = {
  id: string;
  type: "contact";
  contactId: string;
  label: string;
  detail: string;
  platform: string;
};

type RelationshipMapPaymentNode = {
  id: string;
  type: "payment_method";
  paymentMethodId: string;
  label: string;
  detail: string;
  paymentType?: number;
};

type RelationshipMapNode =
  | RelationshipMapPartyNode
  | RelationshipMapContactNode
  | RelationshipMapPaymentNode;

type RelationshipMapEdge = {
  id: string;
  source: string;
  target: string;
  kind: MapEdgeKind;
};

type FindRelationshipMapResult = {
  nodes: RelationshipMapNode[];
  edges: RelationshipMapEdge[];
};

export type {
  PartyKind,
  MapEdgeKind,
  RelationshipMapPartyNode,
  RelationshipMapContactNode,
  RelationshipMapPaymentNode,
  RelationshipMapNode,
  RelationshipMapEdge,
  FindRelationshipMapResult,
};
