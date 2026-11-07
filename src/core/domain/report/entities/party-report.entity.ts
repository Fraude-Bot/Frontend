class PartyReportEntity {
  constructor(
    private readonly _id: string,
    private readonly _title: string,
    private readonly _description: string,
    private readonly _createdAt: string,
  ) {}

  public get id(): string {
    return this._id;
  }

  public get title(): string {
    return this._title;
  }

  public get description(): string {
    return this._description;
  }

  public get createdAt(): string {
    return this._createdAt;
  }
}

export default PartyReportEntity;
