"use client";

import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";

import { DEPARTMENTS } from "@/lib/departments";
import { useCouponStore } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { state, ready } = useCouponStore();

  const totalBalance = DEPARTMENTS.reduce(
    (sum, d) => sum + (state.balances[d.id] ?? 0),
    0
  );
  const fmt = (n: number) => (ready ? n.toLocaleString("ko-KR") : "–");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          부서별 쿠폰 현황
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          부서를 선택하면 상세 현황과 내역을 볼 수 있습니다 · 전체 보유{" "}
          <span className="font-semibold text-foreground tabular-nums">
            {fmt(totalBalance)}
          </span>
          장
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {DEPARTMENTS.map((dept) => {
          const balance = state.balances[dept.id] ?? 0;
          return (
            <Link key={dept.id} href={`/departments/${dept.id}`}>
              <Card className="group relative h-full gap-3 overflow-hidden py-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
                <span
                  className="absolute inset-x-0 top-0 h-0.75"
                  style={{ backgroundColor: dept.color }}
                />
                <CardHeader className="px-5">
                  <CardTitle className="flex items-center justify-between text-sm font-medium text-muted-foreground">
                    <span className="flex items-center gap-2">
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      />
                      {dept.name}
                    </span>
                    <ChevronRightIcon className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}
