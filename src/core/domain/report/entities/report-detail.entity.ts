class ReportDetailEntity {
  constructor(
    private readonly _id: string,
    private readonly _title: string,
    private readonly _description: string,
    private readonly _createdAt: string,
    private readonly _products: string[],
    private readonly _proofs: string[],
    private readonly _isActive: boolean,
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

  public get products(): string[] {
    return this._products;
  }

  public get proofs(): string[] {
    return this._proofs;
  }

  public get isActive(): boolean {
    return this._isActive;
  }
}

export default ReportDetailEntity;
