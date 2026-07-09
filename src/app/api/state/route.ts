import { NextResponse } from "next/server";

import { getState } from "@/lib/server/db";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getState());
}
