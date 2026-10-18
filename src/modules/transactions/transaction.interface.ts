import type { TransactionType } from "../../generated/client/enums.js";

export interface LedgerBalance {
  creditTotal: string;
  paymentTotal: string;
  due: string;
}

export interface LedgerTransaction {
  id: string;
  customerId: string;
  type: TransactionType;
  amount: string;
  note: string | null;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}
