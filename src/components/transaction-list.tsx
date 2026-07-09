"use client";

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

export function TransactionList({
  transactions,
  emptyMessage = "아직 내역이 없습니다.",
}: {
  transactions: CouponTransaction[];
  emptyMessage?: string;
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-14 text-muted-foreground">
        <InboxIcon className="size-8 opacity-50" />
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="pl-4">부서</TableHead>
          <TableHead>구분</TableHead>
          <TableHead className="text-right">수량</TableHead>
          <TableHead className="hidden sm:table-cell">메모</TableHead>
          <TableHead className="pr-4 text-right">일시</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => {
          const dept = DEPARTMENT_MAP[tx.departmentId];
          return (
            <TableRow key={tx.id}>
              <TableCell className="pl-4 font-medium">
                <span className="inline-flex items-center gap-2">
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: dept?.color ?? "#8898aa" }}
                  />
                  {getDepartmentName(tx.departmentId)}
                </span>
              </TableCell>
              <TableCell>
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
  );
}
