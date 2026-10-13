class PaymentMethodSummaryEntity {
  constructor(
    private readonly _id: string,
    private readonly _reference: string,
    private readonly _payment_type: number,
    private readonly _created_at: string,
    private readonly _is_active: boolean,
  ) {}

  public get id(): string {
    return this._id;
  }

  public get reference(): string {
    return this._reference;
  }

  public get paymentType(): number {
    return this._payment_type;
  }

  public get createdAt(): string {
    return this._created_at;
  }

  public get isActive(): boolean {
    return this._is_active;
  }
}

export default PaymentMethodSummaryEntity;
