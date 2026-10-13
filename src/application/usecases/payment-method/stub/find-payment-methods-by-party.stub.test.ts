import FindPaymentMethodsByPartyStubUsecase from "@/application/usecases/payment-method/stub/find-payment-methods-by-party.stub";

describe("FindPaymentMethodsByPartyStubUsecase", () => {
  const useCase = new FindPaymentMethodsByPartyStubUsecase();

  it("returns ten payment methods on the first page", async () => {
    const result = await useCase.execute("1", "scammer", 1);

    expect(result.data).toHaveLength(10);
    expect(result.total).toBe(19);
    expect(result.page).toBe(1);
    expect(result.count).toBe(10);
  });

  it("returns the remaining payment methods on the next page", async () => {
    const result = await useCase.execute("1", "organization", 2);

    expect(result.data).toHaveLength(9);
    expect(result.page).toBe(2);
    expect(result.total).toBe(19);
  });

  it("filters by payment type before paginating", async () => {
    const result = await useCase.execute("1", "scammer", 1, "2");

    expect(result.data.every((payment) => payment.paymentType === 2)).toBe(
      true,
    );
    expect(result.total).toBe(4);
    expect(result.page).toBe(1);
    expect(result.count).toBe(10);
  });
});
