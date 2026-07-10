"use client";

import * as React from "react";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  CheckIcon,
  CircleAlertIcon,
  PencilIcon,
} from "lucide-react";

import { DEPARTMENT_MAP, getDepartmentName } from "@/lib/departments";
import { formatDateTime } from "@/lib/format";
import { useCouponStore } from "@/lib/store";
import type { CouponTransaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}

/**
 * 내역 상세 다이얼로그. 선택된 내역이 바뀔 때 폼이 초기화되도록
 * 부모에서 `key={transaction.id}` 를 지정해 마운트한다.
 */
export function TransactionDetailDialog({
  transaction,
  onClose,
}: {
  transaction: CouponTransaction;
  onClose: () => void;
}) {
  const { isAdmin, updateMemo } = useCouponStore();
  const [memo, setMemo] = React.useState(transaction.memo ?? "");
  const [saving, setSaving] = React.useState(false);
  const [savedOnce, setSavedOnce] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const dept = DEPARTMENT_MAP[transaction.departmentId];
  const isAdd = transaction.type === "add";
  const memoChanged = memo.trim() !== (transaction.memo ?? "");

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const result = await updateMemo(transaction.id, memo);
      if (result) setError(result);
      else setSavedOnce(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            내역 상세
            {isAdd ? (
              <Badge variant="success">
                <ArrowUpRightIcon /> 추가
              </Badge>
            ) : (
              <Badge variant="secondary">
                <ArrowDownLeftIcon /> 사용
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {getDepartmentName(transaction.departmentId)} 부서의{" "}
            {isAdd ? "쿠폰 추가" : "쿠폰 사용"} 내역입니다.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1">
          <DetailRow label="부서">
            <span className="inline-flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: dept?.color ?? "#8898aa" }}
              />
              {getDepartmentName(transaction.departmentId)}
            </span>
          </DetailRow>
          <DetailRow label="수량">
            <span className="tabular-nums">
              {isAdd ? "+" : "−"}
              {transaction.amount.toLocaleString("ko-KR")}장
            </span>
          </DetailRow>
          <DetailRow label="일시">
            <span className="tabular-nums">
              {formatDateTime(transaction.createdAt)}
            </span>
          </DetailRow>
        </div>

        <Separator />

        {isAdmin ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="detail-memo">
              메모{" "}
              <span className="font-normal text-muted-foreground">
                (관리자만 수정 가능)
              </span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="detail-memo"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="추가/사용 사유를 남겨 주세요"
                maxLength={50}
              />
              <Button
                onClick={handleSave}
                disabled={saving || !memoChanged}
                aria-label="메모 저장"
              >
                {saving ? (
                  "저장 중…"
                ) : !memoChanged && savedOnce ? (
                  <>
                    <CheckIcon /> 저장됨
                  </>
                ) : (
                  <>
                    <PencilIcon /> 저장
                  </>
                )}
              </Button>
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <CircleAlertIcon className="size-4 shrink-0" />
                {error}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-muted-foreground">메모</span>
            <p className="text-sm">
              {transaction.memo ?? (
                <span className="text-muted-foreground">메모가 없습니다.</span>
              )}
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
