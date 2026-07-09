import { NextResponse } from "next/server";

import { getState } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json(await getState());
  } catch (err) {
    console.error("GET /api/state failed:", err);
    return NextResponse.json(
      { error: "데이터를 불러오지 못했습니다." },
      { status: 500 }
    );
  }
}
