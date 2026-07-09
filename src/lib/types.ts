export type TransactionType = "add" | "use";

export interface Department {
  id: string;
  name: string;
  color: string; // tailwind-safe hex accent for the department
}

export interface CouponTransaction {
  id: string;
  departmentId: string;
  type: TransactionType;
  amount: number;
  memo?: string;
  createdAt: string; // ISO timestamp
}

export interface CouponState {
  balances: Record<string, number>;
  transactions: CouponTransaction[];
}
