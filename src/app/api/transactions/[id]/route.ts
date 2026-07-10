import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/server/auth";
import { getState, updateTransactionMemo } from "@/lib/server/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.json(
      { error: "관리자만 메모를 수정할 수 있습니다." },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    if (typeof body.memo !== "string") {
      return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
    }
    const { error } = await updateTransactionMemo(id, body.memo);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json({ state: await getState() });
  } catch (err) {
    console.error("PATCH /api/transactions/[id] failed:", err);
    return NextResponse.json(
      { error: "요청을 처리하지 못했습니다." },
      { status: 500 }
    );
  }
}
