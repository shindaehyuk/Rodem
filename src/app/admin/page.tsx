"use client";

import * as React from "react";
import {
  CircleAlertIcon,
  LockIcon,
  LogOutIcon,
  MinusIcon,
  PlusIcon,
  ShieldCheckIcon,
} from "lucide-react";

import { DEPARTMENTS } from "@/lib/departments";
import { useCouponStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CouponActionDialog } from "@/components/coupon-action-dialog";
import { TransactionList } from "@/components/transaction-list";

function LoginForm() {
  const { login } = useCouponStore();
  const [id, setId] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!login(id, password)) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    setError(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6 py-10">
      <span className="stripe-gradient flex size-14 items-center justify-center rounded-2xl text-white shadow-lg">
        <LockIcon className="size-6" />
      </span>
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">관리자 로그인</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          쿠폰 관리는 관리자만 할 수 있습니다.
        </p>
      </div>

      <Card className="w-full">
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-id">아이디</Label>
              <Input
                id="admin-id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                autoComplete="username"
                placeholder="admin"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="admin-pw">비밀번호</Label>
              <Input
                id="admin-pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            {error && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <CircleAlertIcon className="size-4 shrink-0" />
                {error}
              </p>
            )}
            <Button type="submit" className="w-full">
              로그인
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function AdminPanel() {
  const { state, logout } = useCouponStore();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
            <ShieldCheckIcon className="size-6 text-primary" />
            관리자 페이지
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            부서별 쿠폰을 추가하거나 사용 처리할 수 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CouponActionDialog
            type="add"
            trigger={
              <Button>
                <PlusIcon /> 쿠폰 추가
              </Button>
            }
          />
          <CouponActionDialog
            type="use"
            trigger={
              <Button variant="secondary">
                <MinusIcon /> 쿠폰 사용
              </Button>
            }
          />
          <Button variant="outline" onClick={logout}>
            <LogOutIcon /> 로그아웃
          </Button>
        </div>
      </div>

      <Card className="py-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">부서</TableHead>
              <TableHead className="text-right">보유 쿠폰</TableHead>
              <TableHead className="pr-4 text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DEPARTMENTS.map((dept) => {
              const balance = state.balances[dept.id] ?? 0;
              return (
                <TableRow key={dept.id}>
                  <TableCell className="pl-4 font-medium">
                    <span className="inline-flex items-center gap-2">
                      <span
                        className="size-2 shrink-0 rounded-full"
                        style={{ backgroundColor: dept.color }}
                      />
                      {dept.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {balance.toLocaleString("ko-KR")}장
                  </TableCell>
                  <TableCell className="pr-4">
                    <div className="flex justify-end gap-1.5">
                      <CouponActionDialog
                        type="add"
                        departmentId={dept.id}
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            aria-label={`${dept.name} 쿠폰 추가`}
                          >
                            <PlusIcon /> 추가
                          </Button>
                        }
                      />
                      <CouponActionDialog
                        type="use"
                        departmentId={dept.id}
                        trigger={
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={balance === 0}
                            aria-label={`${dept.name} 쿠폰 사용`}
                          >
                            <MinusIcon /> 사용
                          </Button>
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">최근 내역</h2>
        <Card className="py-2">
          <TransactionList
            transactions={state.transactions.slice(0, 10)}
            emptyMessage="아직 내역이 없습니다."
          />
        </Card>
      </section>

      <Separator />
      <p className="text-xs text-muted-foreground">
        로그인 세션은 12시간 동안 유지되며, 이 브라우저에서만 적용됩니다.
      </p>
    </div>
  );
}

export default function AdminPage() {
  const { ready, isAdmin } = useCouponStore();

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-muted-foreground">
        불러오는 중…
      </div>
    );
  }

  return isAdmin ? <AdminPanel /> : <LoginForm />;
}
