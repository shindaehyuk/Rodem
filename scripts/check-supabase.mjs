#!/usr/bin/env node
/**
 * Supabase 설정 진단 스크립트.
 * .env.local 의 접속 정보와 마이그레이션 적용 여부를 데이터 변경 없이 확인합니다.
 *
 *   npm run check:supabase
 */
import { readFileSync, existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// .env.local 로드 (next dev 없이 단독 실행되므로 직접 파싱)
if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (match && !(match[1] in process.env)) process.env[match[1]] = match[2];
  }
}

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

const ok = (msg) => console.log(`✅ ${msg}`);
const fail = (msg, hint) => {
  console.error(`❌ ${msg}`);
  if (hint) console.error(`   → ${hint}`);
  process.exit(1);
};

if (!url) fail("SUPABASE_URL 이 설정되지 않았습니다.", ".env.local 을 확인하세요.");
if (!key) fail("SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다.", ".env.local 을 확인하세요.");
if (key.startsWith("sb_publishable_"))
  fail(
    "publishable(공개) 키가 설정되어 있습니다.",
    "대시보드 → Project Settings → API Keys 의 sb_secret_... 키를 사용하세요."
  );
ok(`환경 변수 확인 (${url})`);

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// 1. 테이블/뷰 존재 확인 (읽기 전용)
const balances = await supabase
  .from("department_balances")
  .select("department_id, balance");
if (balances.error) {
  if (/relation .* does not exist|Could not find the table/i.test(balances.error.message))
    fail(
      "department_balances 뷰가 없습니다 — 마이그레이션이 실행되지 않았습니다.",
      "대시보드 SQL Editor 에서 supabase/migrations/20260709000000_init.sql 을 실행하세요."
    );
  fail(`뷰 조회 실패: ${balances.error.message}`);
}
ok(`department_balances 뷰 조회 성공 (잔액 보유 부서 ${balances.data.length}곳)`);

// 2. 함수 존재 확인 — 검증 실패가 예상되는 입력이라 데이터는 변경되지 않음
const rpc = await supabase.rpc("create_transaction", {
  p_department_id: "dept-01",
  p_type: "add",
  p_amount: 0,
  p_memo: null,
});
if (rpc.error) {
  if (/function .* does not exist|Could not find the function/i.test(rpc.error.message))
    fail(
      "create_transaction 함수가 없습니다 — 마이그레이션이 실행되지 않았습니다.",
      "대시보드 SQL Editor 에서 supabase/migrations/20260709000000_init.sql 을 실행하세요."
    );
  fail(`함수 호출 실패: ${rpc.error.message}`);
}
if (rpc.data !== "1 이상의 정수를 입력해 주세요.")
  fail(`create_transaction 함수 응답이 예상과 다릅니다: ${JSON.stringify(rpc.data)}`);
ok("create_transaction 함수 동작 확인 (데이터 변경 없음)");

console.log("\n🎉 Supabase 설정이 완료되었습니다. `npm run dev` 로 앱을 실행하세요.");
