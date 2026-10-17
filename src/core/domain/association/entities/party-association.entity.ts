class PartyAssociationEntity {
  constructor(
    private readonly _id: string,
    private readonly _name: string,
    private readonly _created_at: string,
  ) {}

  public get id(): string {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get createdAt(): string {
    return this._created_at;
  }
}

export default PartyAssociationEntity;
