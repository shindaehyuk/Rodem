import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/server/auth";
import { createTransaction, getState } from "@/lib/server/db";

export async function POST(req: NextRequest) {
  if (!verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json(
      { error: "관리자만 쿠폰을 관리할 수 있습니다." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { error } = await createTransaction(
      String(body.departmentId ?? ""),
      body.type,
      Number(body.amount),
      typeof body.memo === "string" ? body.memo : undefined
    );
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json({ state: await getState() });
  } catch (err) {
    console.error("POST /api/transactions failed:", err);
    return NextResponse.json(
      { error: "요청을 처리하지 못했습니다." },
      { status: 500 }
    );
  }
}
