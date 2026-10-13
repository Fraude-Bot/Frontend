import PaymentMethodSummaryEntity from "@/core/domain/payment-method/entities/payment-method-summary.entity";

type FindPaymentMethodsByPartyModel<T> = {
  data: T[];
  total: number;
  page: number;
  count: number;
};

type FindPaymentMethodsByPartyResult =
  FindPaymentMethodsByPartyModel<PaymentMethodSummaryEntity>;

export type { FindPaymentMethodsByPartyModel };
export default FindPaymentMethodsByPartyResult;
