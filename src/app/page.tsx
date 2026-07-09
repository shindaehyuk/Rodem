"use client";

import Link from "next/link";
import {
  ArrowDownLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  TicketIcon,
} from "lucide-react";

import { DEPARTMENTS } from "@/lib/departments";
import { isToday } from "@/lib/format";
import { useCouponStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionList } from "@/components/transaction-list";

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

export default function DashboardPage() {
  const { state, ready } = useCouponStore();

  const totalBalance = DEPARTMENTS.reduce(
    (sum, d) => sum + (state.balances[d.id] ?? 0),
    0
  );
  const todayAdded = state.transactions
    .filter((tx) => tx.type === "add" && isToday(tx.createdAt))
    .reduce((sum, tx) => sum + tx.amount, 0);
  const todayUsed = state.transactions
    .filter((tx) => tx.type === "use" && isToday(tx.createdAt))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const fmt = (n: number) => (ready ? n.toLocaleString("ko-KR") : "–");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          부서별 쿠폰 현황
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          11개 부서의 카페 쿠폰 보유 현황을 한눈에 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="전체 보유 쿠폰"
          value={fmt(totalBalance)}
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
        <h2 className="mb-4 text-lg font-semibold tracking-tight">부서별 현황</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {DEPARTMENTS.map((dept) => {
            const balance = state.balances[dept.id] ?? 0;
            return (
              <Card
                key={dept.id}
                className="group relative gap-3 overflow-hidden py-5 transition-shadow hover:shadow-md"
              >
                <span
                  className="absolute inset-x-0 top-0 h-0.75"
                  style={{ backgroundColor: dept.color }}
                />
                <CardHeader className="px-5">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <span
                      className="size-2 rounded-full"
                      style={{ backgroundColor: dept.color }}
                    />
                    {dept.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-5">
                  <p className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl">
                    {fmt(balance)}
                    <span className="ml-1 text-sm font-medium text-muted-foreground">
                      장
                    </span>
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">최근 내역</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/history">
              전체 보기 <ArrowRightIcon />
            </Link>
          </Button>
        </div>
        <Card className="py-2">
          <TransactionList
            transactions={state.transactions.slice(0, 5)}
            emptyMessage="아직 내역이 없습니다. 관리자 페이지에서 쿠폰을 추가해 보세요."
          />
        </Card>
      </section>
    </div>
  );
}
