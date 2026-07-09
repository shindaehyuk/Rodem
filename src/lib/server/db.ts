import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { DEPARTMENT_MAP, DEPARTMENTS } from "@/lib/departments";
import type {
  CouponState,
  CouponTransaction,
  TransactionType,
} from "@/lib/types";

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    const url =
      process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) {
      throw new Error(
        "SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 환경 변수를 설정해 주세요."
      );
    }
    client = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

interface TxRow {
  id: string;
  department_id: string;
  type: TransactionType;
  amount: number;
  memo: string | null;
  created_at: string;
}

function rowToTransaction(row: TxRow): CouponTransaction {
  return {
    id: row.id,
    departmentId: row.department_id,
    type: row.type,
    amount: row.amount,
    memo: row.memo ?? undefined,
    createdAt: row.created_at,
  };
}

export async function getState(): Promise<CouponState> {
  const supabase = getClient();
  const [balancesRes, txRes] = await Promise.all([
    supabase.from("department_balances").select("department_id, balance"),
    supabase
      .from("transactions")
      .select("id, department_id, type, amount, memo, created_at")
      .order("created_at", { ascending: false })
      .limit(500),
  ]);

  if (balancesRes.error) throw new Error(balancesRes.error.message);
  if (txRes.error) throw new Error(txRes.error.message);

  const balances = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, 0]));
  for (const row of balancesRes.data as {
    department_id: string;
    balance: number;
  }[]) {
    if (row.department_id in balances) balances[row.department_id] = row.balance;
  }

  return {
    balances,
    transactions: (txRes.data as TxRow[]).map(rowToTransaction),
  };
}

export async function createTransaction(
  departmentId: string,
  type: TransactionType,
  amount: number,
  memo?: string
): Promise<{ error: string | null }> {
  if (!DEPARTMENT_MAP[departmentId])
    return { error: "존재하지 않는 부서입니다." };
  if (type !== "add" && type !== "use") return { error: "잘못된 요청입니다." };
  if (!Number.isInteger(amount) || amount <= 0 || amount > 100000)
    return { error: "1 이상의 정수를 입력해 주세요." };

  const { data, error } = await getClient().rpc("create_transaction", {
    p_department_id: departmentId,
    p_type: type,
    p_amount: amount,
    p_memo: memo?.trim().slice(0, 50) || null,
  });

  if (error) {
    console.error("create_transaction rpc failed:", error.message);
    return { error: "요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }
  return { error: (data as string | null) ?? null };
}
