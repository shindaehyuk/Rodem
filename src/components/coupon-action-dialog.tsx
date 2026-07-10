"use client";

import * as React from "react";
import { CircleAlertIcon, MinusIcon, PlusIcon } from "lucide-react";

import { DEPARTMENTS, getDepartmentName } from "@/lib/departments";
import { useCouponStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CouponActionDialog({
  type,
  departmentId,
  trigger,
}: {
  type: "add" | "use";
  /** 지정하면 부서 선택이 고정됩니다. */
  departmentId?: string;
  trigger: React.ReactNode;
}) {
  const { state, addCoupons, spendCoupons } = useCouponStore();
  const [open, setOpen] = React.useState(false);
  const [dept, setDept] = React.useState(departmentId ?? "");
  const [amount, setAmount] = React.useState("1");
  const [memo, setMemo] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const isAdd = type === "add";
  const title = isAdd ? "쿠폰 추가" : "쿠폰 사용";
  const balance = dept ? (state.balances[dept] ?? 0) : null;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      // 다이얼로그를 열 때마다 폼을 초기화한다.
      setDept(departmentId ?? "");
      setAmount("1");
      setMemo("");
      setError(null);
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dept) {
      setError("부서를 선택해 주세요.");
      return;
    }
    const parsed = Number(amount);
    setSubmitting(true);
    try {
      const result = isAdd
        ? await addCoupons(dept, parsed, memo)
        : await spendCoupons(dept, parsed, memo);
      if (result) {
        setError(result);
        return;
      }
      setOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isAdd ? (
              <span className="flex size-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <PlusIcon className="size-4" />
              </span>
            ) : (
              <span className="flex size-7 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <MinusIcon className="size-4" />
              </span>
            )}
            {title}
          </DialogTitle>
          <DialogDescription>
            {departmentId
              ? `${getDepartmentName(departmentId)} 부서의 쿠폰을 ${isAdd ? "추가" : "사용"}합니다.`
              : `부서를 선택하고 수량을 입력해 주세요.`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {!departmentId && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="dept-select">부서</Label>
              <Select value={dept} onValueChange={setDept}>
                <SelectTrigger id="dept-select" className="w-full">
                  <SelectValue placeholder="부서 선택" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} — {state.balances[d.id] ?? 0}장 보유
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount-input">수량</Label>
              {balance !== null && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  현재 보유 {balance.toLocaleString("ko-KR")}장
                </span>
              )}
            </div>
            <Input
              id="amount-input"
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="memo-input">
              메모 <span className="font-normal text-muted-foreground">(선택)</span>
            </Label>
            <Input
              id="memo-input"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder={isAdd ? "예: 분기 배부" : "예: 부서 모임 사용"}
              maxLength={50}
            />
          </div>

          {error && (
            <p className="flex items-center gap-1.5 text-sm text-destructive">
              <CircleAlertIcon className="size-4 shrink-0" />
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant={isAdd ? "default" : "secondary"}
              disabled={submitting}
            >
              {submitting ? "처리 중…" : title}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
