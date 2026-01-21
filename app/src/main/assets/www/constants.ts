
import { BankName, AccountType, CardCategory, BankCard } from './types';

export const ALL_CARDS: BankCard[] = [
  // QNB
  { id: 'qnb-h', bank: BankName.QNB, name: 'QNB Hesap Kartı', category: CardCategory.DEBIT, accountType: AccountType.BIREYSEL },
  { id: 'qnb-f', bank: BankName.QNB, name: 'QNB Fix Kredi Kartı', category: CardCategory.CREDIT, accountType: AccountType.BIREYSEL, statementDay: 21 },
  { id: 'qnb-m', bank: BankName.QNB, name: 'QNB Miles&Smiles Kredi Kartı', category: CardCategory.CREDIT, accountType: AccountType.BIREYSEL, statementDay: 15 },
  { id: 'qnb-s', bank: BankName.QNB, name: 'QNB Şirket Kartı', category: CardCategory.DEBIT, accountType: AccountType.TICARI },
  { id: 'qnb-t', bank: BankName.QNB, name: 'QNB Troy Kredi Kartı', category: CardCategory.CREDIT, accountType: AccountType.TICARI, statementDay: 15 },

  // ENPARA
  { id: 'enpara-b', bank: BankName.ENPARA, name: 'ENPARA Bireysel Kartı', category: CardCategory.DEBIT, accountType: AccountType.BIREYSEL },
  { id: 'enpara-s', bank: BankName.ENPARA, name: 'ENPARA Şirket Kartı', category: CardCategory.DEBIT, accountType: AccountType.TICARI },

  // IS BANK
  { id: 'is-h', bank: BankName.IS_BANK, name: 'İş Hesap Kartı', category: CardCategory.DEBIT, accountType: AccountType.BIREYSEL },
  { id: 'is-m', bank: BankName.IS_BANK, name: 'İş Maximum Kredi Kartı', category: CardCategory.CREDIT, accountType: AccountType.BIREYSEL, statementDay: 15 },

  // TEB
  { id: 'teb-h', bank: BankName.TEB, name: 'TEB Hesap Kartı', category: CardCategory.DEBIT, accountType: AccountType.BIREYSEL },
  { id: 'teb-b', bank: BankName.TEB, name: 'TEB Bonus Kredi Kartı', category: CardCategory.CREDIT, accountType: AccountType.BIREYSEL, statementDay: 4 },

  // ZIRAAT
  { id: 'ziraat-h', bank: BankName.ZIRAAT, name: 'Ziraat Hesap Kartı', category: CardCategory.DEBIT, accountType: AccountType.BIREYSEL },

  // ICBC
  { id: 'icbc-h', bank: BankName.ICBC, name: 'ICBC Hesap Kartı', category: CardCategory.DEBIT, accountType: AccountType.BIREYSEL },
];

export const BANK_LOGOS: Record<BankName, string> = {
  [BankName.QNB]: 'https://i.imgur.com/cjDrCuD.jpeg',
  [BankName.ENPARA]: 'https://i.imgur.com/YgMlvg2.png',
  [BankName.IS_BANK]: 'https://i.imgur.com/a6MCxxf.png',
  [BankName.TEB]: 'https://i.imgur.com/KtO0bJr.png',
  [BankName.ZIRAAT]: 'https://i.imgur.com/Jvtb0pq.png',
  [BankName.ICBC]: 'https://i.imgur.com/cMTktqd.jpeg'
};
