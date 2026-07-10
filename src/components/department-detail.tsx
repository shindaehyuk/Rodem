"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowDownLeftIcon,
  ArrowLeftIcon,
  ArrowUpRightIcon,
  MinusIcon,
  PlusIcon,
  TicketIcon,
} from "lucide-react";

import { DEPARTMENT_MAP } from "@/lib/departments";
import { isToday } from "@/lib/format";
import { useCouponStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CouponActionDialog } from "@/components/coupon-action-dialog";
import { TransactionList } from "@/components/transaction-list";

type Filter = "all" | "add" | "use";

function StatCard({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <Card className="gap-2 py-5">
      <CardHeader className="px-5">
        <CardDescription className="flex items-center gap-2 text-[13px] font-medium">
          {icon}
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-5">
        <p
          className={
            "text-3xl font-bold tracking-tight tabular-nums" +
            (accent ? " stripe-gradient-text" : "")
          }
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export function DepartmentDetail({ departmentId }: { departmentId: string }) {
  const { state, ready, isAdmin } = useCouponStore();
  const [filter, setFilter] = React.useState<Filter>("all");

  const dept = DEPARTMENT_MAP[departmentId];
  if (!dept) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-muted-foreground">
        <p>존재하지 않는 부서입니다.</p>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeftIcon /> 대시보드로 돌아가기
          </Link>
        </Button>
      </div>
    );
  }

  const balance = state.balances[departmentId] ?? 0;
  const deptTxs = state.transactions.filter(
    (tx) => tx.departmentId === departmentId
  );
  const todayAdded = deptTxs
    .filter((tx) => tx.type === "add" && isToday(tx.createdAt))
    .reduce((sum, tx) => sum + tx.amount, 0);
  const todayUsed = deptTxs
    .filter((tx) => tx.type === "use" && isToday(tx.createdAt))
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalAdded = deptTxs
    .filter((tx) => tx.type === "add")
    .reduce((sum, tx) => sum + tx.amount, 0);
  const totalUsed = deptTxs
    .filter((tx) => tx.type === "use")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const filtered = deptTxs.filter(
    (tx) => filter === "all" || tx.type === filter
  );
  const fmt = (n: number) => (ready ? n.toLocaleString("ko-KR") : "–");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 mb-2 text-muted-foreground"
          asChild
        >
          <Link href="/">
            <ArrowLeftIcon /> 대시보드
          </Link>
        </Button>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
              <span
                className="size-3 rounded-full"
                style={{ backgroundColor: dept.color }}
              />
              {dept.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground tabular-nums">
              누적 추가 {fmt(totalAdded)}장 · 누적 사용 {fmt(totalUsed)}장
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-center gap-2">
              <CouponActionDialog
                type="add"
                departmentId={departmentId}
                trigger={
                  <Button>
                    <PlusIcon /> 쿠폰 추가
                  </Button>
                }
              />
              <CouponActionDialog
                type="use"
                departmentId={departmentId}
                trigger={
                  <Button variant="secondary" disabled={balance === 0}>
                    <MinusIcon /> 쿠폰 사용
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="보유 쿠폰"
          value={`${fmt(balance)}장`}
          icon={<TicketIcon className="size-3.5" />}
          accent
        />
        <StatCard
          title="오늘 추가"
          value={`+${fmt(todayAdded)}`}
          icon={<ArrowUpRightIcon className="size-3.5" />}
        />
        <StatCard
          title="오늘 사용"
          value={`−${fmt(todayUsed)}`}
          icon={<ArrowDownLeftIcon className="size-3.5" />}
        />
      </div>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">쿠폰 내역</h2>
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
        </div>
        <Card className="py-2">
          <TransactionList
            transactions={filtered}
            showDepartment={false}
            emptyMessage={
              filter === "all"
                ? "아직 내역이 없습니다."
                : "조건에 맞는 내역이 없습니다."
            }
          />
        </Card>
      </section>
    </div>
  );
}
