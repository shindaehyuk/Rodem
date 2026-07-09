import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

import { DEPARTMENT_MAP, DEPARTMENTS } from "@/lib/departments";
import type {
  CouponState,
  CouponTransaction,
  TransactionType,
} from "@/lib/types";

const DB_PATH =
  process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "rodem.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        department_id TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('add', 'use')),
        amount INTEGER NOT NULL CHECK (amount > 0),
        memo TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_tx_created ON transactions (created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_tx_dept ON transactions (department_id);
    `);
  }
  return db;
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

export function getState(): CouponState {
  const database = getDb();
  const balanceRows = database
    .prepare(
      `SELECT department_id,
              SUM(CASE WHEN type = 'add' THEN amount ELSE -amount END) AS balance
       FROM transactions GROUP BY department_id`
    )
    .all() as { department_id: string; balance: number }[];

  const balances = Object.fromEntries(DEPARTMENTS.map((d) => [d.id, 0]));
  for (const row of balanceRows) {
    if (row.department_id in balances) balances[row.department_id] = row.balance;
  }

  const txRows = database
    .prepare(
      `SELECT * FROM transactions ORDER BY created_at DESC, id DESC LIMIT 500`
    )
    .all() as TxRow[];

  return { balances, transactions: txRows.map(rowToTransaction) };
}

export function createTransaction(
  departmentId: string,
  type: TransactionType,
  amount: number,
  memo?: string
): { error: string | null } {
  if (!DEPARTMENT_MAP[departmentId]) return { error: "존재하지 않는 부서입니다." };
  if (type !== "add" && type !== "use") return { error: "잘못된 요청입니다." };
  if (!Number.isInteger(amount) || amount <= 0 || amount > 100000)
    return { error: "1 이상의 정수를 입력해 주세요." };

  const database = getDb();
  const run = database.transaction((): { error: string | null } => {
    if (type === "use") {
      const row = database
        .prepare(
          `SELECT COALESCE(SUM(CASE WHEN type = 'add' THEN amount ELSE -amount END), 0) AS balance
           FROM transactions WHERE department_id = ?`
        )
        .get(departmentId) as { balance: number };
      if (amount > row.balance)
        return {
          error: `보유 쿠폰(${row.balance}장)보다 많이 사용할 수 없습니다.`,
        };
    }
    database
      .prepare(
        `INSERT INTO transactions (id, department_id, type, amount, memo, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
      .run(
        `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        departmentId,
        type,
        amount,
        memo?.trim().slice(0, 50) || null,
        new Date().toISOString()
      );
    return { error: null };
  });
  return run();
}
