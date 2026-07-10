"use client";

import * as React from "react";
import { DEPARTMENTS } from "./departments";
import type { CouponState, TransactionType } from "./types";

/** 다른 기기의 변경 사항을 반영하기 위한 자동 새로고침 주기(ms) */
const REFRESH_INTERVAL = 30_000;

function emptyState(): CouponState {
  return {
    balances: Object.fromEntries(DEPARTMENTS.map((d) => [d.id, 0])),
    transactions: [],
  };
}

interface CouponContextValue {
  /** 서버에서 첫 데이터를 받아오기 전에는 false — 화면 깜빡임 방지용 */
  ready: boolean;
  state: CouponState;
  isAdmin: boolean;
  login: (id: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addCoupons: (
    departmentId: string,
    amount: number,
    memo?: string
  ) => Promise<string | null>;
  spendCoupons: (
    departmentId: string,
    amount: number,
    memo?: string
  ) => Promise<string | null>;
  /** 내역의 메모를 수정한다 (관리자 전용). 성공 시 null, 실패 시 오류 메시지. */
  updateMemo: (transactionId: string, memo: string) => Promise<string | null>;
}

const CouponContext = React.createContext<CouponContextValue | null>(null);

export function CouponProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  const [state, setState] = React.useState<CouponState>(emptyState);
  const [isAdmin, setIsAdmin] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      const [stateRes, sessionRes] = await Promise.all([
        fetch("/api/state", { cache: "no-store" }),
        fetch("/api/auth/session", { cache: "no-store" }),
      ]);
      if (stateRes.ok) setState(await stateRes.json());
      if (sessionRes.ok) {
        const session = (await sessionRes.json()) as { isAdmin: boolean };
        setIsAdmin(session.isAdmin);
      }
    } catch {
      // 네트워크 오류 시 기존 화면을 유지한다.
    }
  }, []);

  React.useEffect(() => {
    let active = true;
    void (async () => {
      await refresh();
      if (active) setReady(true);
    })();

    const onFocus = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);
    const interval = window.setInterval(onFocus, REFRESH_INTERVAL);
    return () => {
      active = false;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
      window.clearInterval(interval);
    };
  }, [refresh]);

  const login = React.useCallback(
    async (id: string, password: string) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, password }),
        });
        if (!res.ok) return false;
        setIsAdmin(true);
        void refresh();
        return true;
      } catch {
        return false;
      }
    },
    [refresh]
  );

  const logout = React.useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsAdmin(false);
    }
  }, []);

  const applyTransaction = React.useCallback(
    async (
      departmentId: string,
      type: TransactionType,
      amount: number,
      memo?: string
    ): Promise<string | null> => {
      if (!Number.isInteger(amount) || amount <= 0)
        return "1 이상의 정수를 입력해 주세요.";
      try {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ departmentId, type, amount, memo }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 401) setIsAdmin(false);
          return (
            (data as { error?: string }).error ?? "요청을 처리하지 못했습니다."
          );
        }
        setState((data as { state: CouponState }).state);
        return null;
      } catch {
        return "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";
      }
    },
    []
  );

  const addCoupons = React.useCallback(
    (departmentId: string, amount: number, memo?: string) =>
      applyTransaction(departmentId, "add", amount, memo),
    [applyTransaction]
  );

  const spendCoupons = React.useCallback(
    (departmentId: string, amount: number, memo?: string) =>
      applyTransaction(departmentId, "use", amount, memo),
    [applyTransaction]
  );

  const updateMemo = React.useCallback(
    async (transactionId: string, memo: string): Promise<string | null> => {
      try {
        const res = await fetch(
          `/api/transactions/${encodeURIComponent(transactionId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ memo }),
          }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          if (res.status === 401) setIsAdmin(false);
          return (
            (data as { error?: string }).error ?? "메모를 저장하지 못했습니다."
          );
        }
        setState((data as { state: CouponState }).state);
        return null;
      } catch {
        return "서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.";
      }
    },
    []
  );

  const value = React.useMemo(
    () => ({
      ready,
      state,
      isAdmin,
      login,
      logout,
      addCoupons,
      spendCoupons,
      updateMemo,
    }),
    [ready, state, isAdmin, login, logout, addCoupons, spendCoupons, updateMemo]
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
