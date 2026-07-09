"use client";

import * as React from "react";
import { HistoryIcon } from "lucide-react";

import { DEPARTMENTS } from "@/lib/departments";
import { useCouponStore } from "@/lib/store";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransactionList } from "@/components/transaction-list";

type Filter = "all" | "add" | "use";

export default function HistoryPage() {
  const { state } = useCouponStore();
  const [filter, setFilter] = React.useState<Filter>("all");
  const [deptFilter, setDeptFilter] = React.useState<string>("all");

  const filtered = state.transactions.filter((tx) => {
    if (filter !== "all" && tx.type !== filter) return false;
    if (deptFilter !== "all" && tx.departmentId !== deptFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
          <HistoryIcon className="size-6 text-primary" />
          쿠폰 내역
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          쿠폰 추가 및 사용 내역을 확인할 수 있습니다.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all" className="px-4">
              전체
            </TabsTrigger>
            <TabsTrigger value="add" className="px-4">
              추가
            </TabsTrigger>
            <TabsTrigger value="use" className="px-4">
              사용
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="부서 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 부서</SelectItem>
            {DEPARTMENTS.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card className="py-2">
        <TransactionList
          transactions={filtered}
          emptyMessage="조건에 맞는 내역이 없습니다."
        />
      </Card>

      <p className="text-xs text-muted-foreground">
        총 {filtered.length.toLocaleString("ko-KR")}건의 내역이 있습니다.
      </p>
    </div>
  );
}
