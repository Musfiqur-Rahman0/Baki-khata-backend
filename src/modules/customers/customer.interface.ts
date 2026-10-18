export interface CustomerRecord {
  id: string;
  shopOwnerId: string;
  name: string;
  phone: string;
  address: string | null;
  note: string | null;
  archivedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerBalance {
  creditTotal: string;
  paymentTotal: string;
  due: string;
}

export interface CustomerWithBalance {
  customer: Omit<CustomerRecord, "shopOwnerId">;
  balance: CustomerBalance;
}
