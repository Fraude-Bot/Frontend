import PartyAssociationEntity from "@/core/domain/association/entities/party-association.entity";

type FindAssociationsByPartyModel<T> = {
  data: T[];
  total: number;
  page: number;
  count: number;
};

type FindAssociationsByPartyResult =
  FindAssociationsByPartyModel<PartyAssociationEntity>;

export type { FindAssociationsByPartyModel };
export default FindAssociationsByPartyResult;
