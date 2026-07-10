"use client";

import * as React from "react";
import { ArrowDownLeftIcon, ArrowUpRightIcon, InboxIcon } from "lucide-react";

import { getDepartmentName, DEPARTMENT_MAP } from "@/lib/departments";
import { formatDateTime } from "@/lib/format";
import type { CouponTransaction } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TransactionDetailDialog } from "@/components/transaction-detail-dialog";

export function TransactionList({
  transactions,
  emptyMessage = "아직 내역이 없습니다.",
  showDepartment = true,
}: {
  transactions: CouponTransaction[];
  emptyMessage?: string;
  /** 부서 상세처럼 부서가 자명한 화면에서는 부서 열을 숨긴다. */
  showDepartment?: boolean;
}) {
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  // 메모 저장 후에도 최신 내용이 보이도록 항상 현재 목록에서 찾는다.
  const selected =
    transactions.find((tx) => tx.id === selectedId) ?? null;

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-14 text-muted-foreground">
        <InboxIcon className="size-8 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          {showDepartment && <TableHead className="pl-4">부서</TableHead>}
          <TableHead className={showDepartment ? undefined : "pl-4"}>
            구분
          </TableHead>
          <TableHead className="text-right">수량</TableHead>
          <TableHead className="hidden sm:table-cell">메모</TableHead>
          <TableHead className="pr-4 text-right">일시</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => {
          const dept = DEPARTMENT_MAP[tx.departmentId];
          return (
            <TableRow
              key={tx.id}
              className="cursor-pointer"
              tabIndex={0}
              aria-label="내역 상세 보기"
              onClick={() => setSelectedId(tx.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(tx.id);
                }
              }}
            >
              {showDepartment && (
                <TableCell className="pl-4 font-medium">
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="size-2 shrink-0 rounded-full"
                      style={{ backgroundColor: dept?.color ?? "#8898aa" }}
                    />
                    {getDepartmentName(tx.departmentId)}
                  </span>
                </TableCell>
              )}
              <TableCell className={showDepartment ? undefined : "pl-4"}>
                {tx.type === "add" ? (
                  <Badge variant="success">
                    <ArrowUpRightIcon /> 추가
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <ArrowDownLeftIcon /> 사용
                  </Badge>
                )}
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">
                {tx.type === "add" ? "+" : "−"}
                {tx.amount.toLocaleString("ko-KR")}
              </TableCell>
              <TableCell className="hidden max-w-48 truncate text-muted-foreground sm:table-cell">
                {tx.memo ?? "—"}
              </TableCell>
              <TableCell className="pr-4 text-right text-muted-foreground tabular-nums">
                {formatDateTime(tx.createdAt)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
    {selected && (
      <TransactionDetailDialog
        key={selected.id}
        transaction={selected}
        onClose={() => setSelectedId(null)}
      />
    )}
    </>
  );
}
