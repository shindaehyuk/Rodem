"use client";

import * as React from "react";
import { DEPARTMENTS } from "./departments";
import type { CouponState, CouponTransaction, TransactionType } from "./types";

const STORE_KEY = "rodem-coupon-store-v1";
const AUTH_KEY = "rodem-admin-session-v1";
const SESSION_HOURS = 12;

/**
 * 데모용 관리자 계정입니다. 실제 운영 시에는 서버 측 인증으로
 * 교체해야 합니다 (NextAuth, Supabase Auth 등).
 */
const ADMIN_ID = "admin";
const ADMIN_PASSWORD = "rodem1234";

function emptyState(): CouponState {
  return {
    balances: Object.fromEntries(DEPARTMENTS.map((d) => [d.id, 0])),
    transactions: [],
  };
}

function loadState(): CouponState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as CouponState;
    // 부서가 추가/삭제되어도 안전하도록 잔액 맵을 보정한다.
    const balances = Object.fromEntries(
      DEPARTMENTS.map((d) => [d.id, parsed.balances?.[d.id] ?? 0])
    );
    return { balances, transactions: parsed.transactions ?? [] };
  } catch {
    return emptyState();
  }
}

function loadAuth(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const { expiresAt } = JSON.parse(raw) as { expiresAt: number };
    if (Date.now() > expiresAt) {
      window.localStorage.removeItem(AUTH_KEY);
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

interface CouponContextValue {
  /** localStorage 로드가 끝나기 전에는 false — 화면 깜빡임 방지용 */
  ready: boolean;
  state: CouponState;
  isAdmin: boolean;
  login: (id: string, password: string) => boolean;
  logout: () => void;
  addCoupons: (departmentId: string, amount: number, memo?: string) => string | null;
  useCoupons: (departmentId: string, amount: number, memo?: string) => string | null;
}

const CouponContext = React.createContext<CouponContextValue | null>(null);

export function CouponProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const [state, setState] = React.useState<CouponState>(emptyState);
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    setState(loadState());
    setIsAdmin(loadAuth());
    setReady(true);
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const login = React.useCallback((id: string, password: string) => {
    if (id.trim() === ADMIN_ID && password === ADMIN_PASSWORD) {
      const expiresAt = Date.now() + SESSION_HOURS * 60 * 60 * 1000;
      window.localStorage.setItem(AUTH_KEY, JSON.stringify({ expiresAt }));
      setIsAdmin(true);
      return true;
    }
    return false;
  }, []);

  const logout = React.useCallback(() => {
    window.localStorage.removeItem(AUTH_KEY);
    setIsAdmin(false);
  }, []);

  const applyTransaction = React.useCallback(
    (
      departmentId: string,
      type: TransactionType,
      amount: number,
      memo?: string
    ): string | null => {
      if (!isAdmin) return "관리자만 쿠폰을 관리할 수 있습니다.";
      if (!Number.isInteger(amount) || amount <= 0)
        return "1 이상의 정수를 입력해 주세요.";

      const current = state.balances[departmentId] ?? 0;
      if (type === "use" && amount > current)
        return `보유 쿠폰(${current}장)보다 많이 사용할 수 없습니다.`;

      const tx: CouponTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        departmentId,
        type,
        amount,
        memo: memo?.trim() || undefined,
        createdAt: new Date().toISOString(),
      };
      setState((prev) => {
        const prevBalance = prev.balances[departmentId] ?? 0;
        return {
          balances: {
            ...prev.balances,
            [departmentId]:
              type === "add" ? prevBalance + amount : prevBalance - amount,
          },
          transactions: [tx, ...prev.transactions],
        };
      });
      return null;
    },
    [isAdmin, state]
  );

  const addCoupons = React.useCallback(
    (departmentId: string, amount: number, memo?: string) =>
      applyTransaction(departmentId, "add", amount, memo),
    [applyTransaction]
  );

  const useCoupons = React.useCallback(
    (departmentId: string, amount: number, memo?: string) =>
      applyTransaction(departmentId, "use", amount, memo),
    [applyTransaction]
  );

  const value = React.useMemo(
    () => ({ ready, state, isAdmin, login, logout, addCoupons, useCoupons }),
    [ready, state, isAdmin, login, logout, addCoupons, useCoupons]
  );

  return (
    <CouponContext.Provider value={value}>{children}</CouponContext.Provider>
  );
}

export function useCouponStore() {
  const ctx = React.useContext(CouponContext);
  if (!ctx) throw new Error("useCouponStore must be used within CouponProvider");
  return ctx;
}
