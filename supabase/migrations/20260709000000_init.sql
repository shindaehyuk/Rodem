-- 로뎀 카페 쿠폰 관리 초기 스키마
-- Supabase 대시보드의 SQL Editor에 붙여넣어 실행하거나,
-- supabase CLI(`supabase db push`)로 적용하세요.

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  department_id text not null,
  type text not null check (type in ('add', 'use')),
  amount integer not null check (amount > 0),
  memo text,
  created_at timestamptz not null default now()
);

create index if not exists idx_tx_created on public.transactions (created_at desc);
create index if not exists idx_tx_dept on public.transactions (department_id);

-- 앱은 서비스 롤 키로만 접근하므로 anon/authenticated 접근을 차단한다.
alter table public.transactions enable row level security;
revoke all on public.transactions from anon, authenticated;

-- 부서별 잔액 집계 뷰
create or replace view public.department_balances as
select
  department_id,
  sum(case when type = 'add' then amount else -amount end)::int as balance
from public.transactions
group by department_id;

revoke all on public.department_balances from anon, authenticated;

-- 쿠폰 추가/사용을 원자적으로 처리하는 함수.
-- 성공 시 null, 실패 시 오류 메시지(text)를 반환한다.
create or replace function public.create_transaction(
  p_department_id text,
  p_type text,
  p_amount integer,
  p_memo text default null
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if p_type not in ('add', 'use') then
    return '잘못된 요청입니다.';
  end if;
  if p_amount is null or p_amount <= 0 or p_amount > 100000 then
    return '1 이상의 정수를 입력해 주세요.';
  end if;

  -- 같은 부서에 대한 동시 요청을 직렬화해 잔액 초과 사용을 방지한다.
  perform pg_advisory_xact_lock(hashtext(p_department_id));

  if p_type = 'use' then
    select coalesce(sum(case when type = 'add' then amount else -amount end), 0)
      into v_balance
      from public.transactions
     where department_id = p_department_id;

    if p_amount > v_balance then
      return '보유 쿠폰(' || v_balance || '장)보다 많이 사용할 수 없습니다.';
    end if;
  end if;

  insert into public.transactions (department_id, type, amount, memo)
  values (p_department_id, p_type, p_amount, nullif(trim(coalesce(p_memo, '')), ''));

  return null;
end;
$$;

revoke execute on function public.create_transaction(text, text, integer, text)
  from anon, authenticated;
