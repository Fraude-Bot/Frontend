import ApiCallerInterface from "@/core/base/api-caller.interface";
import PaymentMethodSummaryEntity from "@/core/domain/payment-method/entities/payment-method-summary.entity";
import FindPaymentMethodsByPartyResult from "@/core/domain/payment-method/models/find-payment-methods-by-party.model";

const PAGE_SIZE = 10;

const stubRows: Array<[string, string, number, string]> = [
  ["1", "4152313412345678", 1, "2026-01-10"],
  ["2", "5200828282828210", 1, "2025-11-02"],
  ["3", "4000000000000002", 1, "2026-03-18"],
  ["4", "5555555555554444", 1, "2026-06-21"],
  ["5", "4111111111111111", 1, "2025-08-14"],
  ["6", "4012888888881881", 1, "2026-09-01"],
  ["7", "012180001234567897", 2, "2026-02-11"],
  ["8", "014027000005555558", 2, "2025-12-19"],
  ["9", "021180064312345678", 2, "2026-04-07"],
  ["10", "072580010012345678", 2, "2026-07-30"],
  ["11", "1234567890", 3, "2026-05-16"],
  ["12", "0987654321", 3, "2025-10-23"],
  ["13", "5550001122", 3, "2026-08-12"],
  ["14", "0x742d35Cc6634C0532925a3b844Bc454e4438f44e", 4, "2026-01-28"],
  ["15", "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq", 4, "2026-03-03"],
  ["16", "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa", 4, "2025-09-09"],
  ["17", "REF-88421", 5, "2026-02-02"],
  ["18", "Pago en efectivo sucursal centro", 5, "2026-06-14"],
  ["19", "SPEI manual 2024", 5, "2025-07-25"],
];

const stubPaymentMethods = stubRows.map(
  ([id, reference, paymentType, createdAt]) =>
    new PaymentMethodSummaryEntity(id, reference, paymentType, createdAt, true),
);

class FindPaymentMethodsByPartyStubUsecase implements ApiCallerInterface {
  public execute(
    _id: string,
    _type: "scammer" | "organization",
    page = 1,
    paymentType?: string,
  ): Promise<FindPaymentMethodsByPartyResult> {
    const filtered = paymentType
      ? stubPaymentMethods.filter(
          (paymentMethod) => String(paymentMethod.paymentType) === paymentType,
        )
      : stubPaymentMethods;

    const safePage = page > 0 ? page : 1;
    const start = (safePage - 1) * PAGE_SIZE;

    return Promise.resolve({
      data: filtered.slice(start, start + PAGE_SIZE),
      total: filtered.length,
      page: safePage,
      count: PAGE_SIZE,
    });
  }

  public cancel(): void {
    // No cancellation needed for stub usecase
  }
}

export default FindPaymentMethodsByPartyStubUsecase;
