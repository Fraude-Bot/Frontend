import accountNumberIcon from "@/presentation/assets/payments/account-number.png";
import cardNumberIcon from "@/presentation/assets/payments/card-number.png";
import clabeIcon from "@/presentation/assets/payments/clabe.png";
import cryptoWalletIcon from "@/presentation/assets/payments/crypto-wallet.png";

const PAYMENT_ICON_SRC: Record<string, string> = {
  "1": cardNumberIcon,
  "2": clabeIcon,
  "3": accountNumberIcon,
  "4": cryptoWalletIcon,
  card_number: cardNumberIcon,
  clabe: clabeIcon,
  account_number: accountNumberIcon,
  wallet: cryptoWalletIcon,
};

export function getPaymentIconSrc(type: string): string | undefined {
  return PAYMENT_ICON_SRC[type.trim().toLowerCase()];
}
