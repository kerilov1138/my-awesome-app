
export enum BankName {
  QNB = 'QNB Finansbank',
  ENPARA = 'ENPARA Bank',
  IS_BANK = 'İş Bankası',
  TEB = 'TEB Bankası',
  ZIRAAT = 'Ziraat Bankası',
  ICBC = 'ICBC Bankası'
}

export enum AccountType {
  BIREYSEL = 'Bireysel',
  TICARI = 'Ticari'
}

export enum CardCategory {
  DEBIT = 'Hesap Kartı',
  CREDIT = 'Kredi Kartı'
}

export interface BankCard {
  id: string;
  bank: BankName;
  name: string;
  category: CardCategory;
  accountType: AccountType;
  statementDay?: number; // 1-31
}

export interface Transaction {
  id: string;
  cardId: string;
  description: string;
  totalAmount: number;
  installments: number;
  date: string; // ISO format
  monthlyAmount: number;
  firstPaymentDate: string; // ISO format
}

export interface MonthlyOverview {
  monthYear: string; // "YYYY-MM"
  totalAmount: number;
  transactions: {
    transactionId: string; // Orijinal işleme geri dönmek için
    description: string;
    cardName: string;
    amount: number;
    installmentIndex: number; // e.g., 3 of 12
    totalInstallments: number;
  }[];
}
