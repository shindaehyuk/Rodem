# 로뎀 카페 쿠폰 관리

카페에서 사용하는 부서별 쿠폰 관리 앱입니다. Stripe 핀테크 스타일의 디자인으로,
11개 부서의 쿠폰 보유 현황 확인 · 쿠폰 추가/사용 · 내역 조회 · 관리자 기능을 제공합니다.

## 기술 스택

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** 스타일 컴포넌트
- **Lucide** 아이콘
- **next-themes** 기반 다크모드 (라이트 / 다크 / 시스템)
- 반응형 디자인 (모바일 ~ 데스크톱)
- **Supabase** (Postgres) 저장소 + Next.js API 라우트

## 주요 기능

| 페이지 | 경로 | 설명 |
| --- | --- | --- |
| 대시보드 | `/` | 11개 부서 쿠폰 보유 현황, 오늘 추가/사용 통계, 최근 내역 |
| 내역 | `/history` | 쿠폰 추가·사용 전체 내역 (구분/부서별 필터) |
| 관리자 | `/admin` | 관리자 로그인 후 쿠폰 추가·사용 처리 |

- **PWA 지원**: 홈 화면에 설치하면 주소창 없는 전체화면 앱으로 실행되고,
  스플래시 화면(컵홀더 로고)이 표시됩니다. 서비스 워커가 앱 셸과 마지막
  쿠폰 현황을 캐시해 오프라인에서도 조회할 수 있습니다.
- 쿠폰 추가/사용은 **관리자만** 가능합니다 (httpOnly 쿠키 세션, 12시간 유지).
- 보유 수량보다 많이 사용하려 하면 서버(Postgres 함수)에서 원자적으로 차단됩니다.
- 데이터는 **Supabase(Postgres)** 에 저장되어 **모든 기기에서 공유**됩니다.
  화면은 포커스 복귀 시와 30초마다 자동 갱신됩니다.
- Supabase 접근은 서버 API 라우트에서 서비스 롤 키로만 이루어지며,
  브라우저에는 Supabase 키가 노출되지 않습니다.

### API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `GET` | `/api/state` | 부서별 잔액 + 최근 내역 조회 |
| `POST` | `/api/transactions` | 쿠폰 추가/사용 (관리자 전용) |
| `POST` | `/api/auth/login` | 관리자 로그인 (httpOnly 세션 쿠키 발급) |
| `POST` | `/api/auth/logout` | 로그아웃 |
| `GET` | `/api/auth/session` | 현재 세션 확인 |

## 시작하기

### 1. Supabase 프로젝트 준비

1. [supabase.com](https://supabase.com)에서 새 프로젝트를 만듭니다.
2. 대시보드 → **SQL Editor**에 `supabase/migrations/20260709000000_init.sql`
   내용을 붙여넣고 실행합니다. (supabase CLI 사용 시 `supabase db push`)
3. 대시보드 → **Project Settings → API**에서 `Project URL`과
   `service_role` 키를 확인합니다.

### 2. 환경 변수 설정

`.env.example`을 복사해 `.env.local`을 만들고 값을 채웁니다.

```bash
cp .env.example .env.local
```

| 환경 변수 | 기본값 | 설명 |
| --- | --- | --- |
| `SUPABASE_URL` | (필수) | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | (필수) | **secret 키** (`sb_secret_...` 또는 기존 `service_role` JWT) — 서버 전용, 절대 공개 금지. `sb_publishable_...` 공개 키는 사용할 수 없습니다. |
| `ADMIN_ID` | `admin` | 관리자 아이디 |
| `ADMIN_PASSWORD` | `rodem1234` | 관리자 비밀번호 |
| `AUTH_SECRET` | (개발용 기본값) | 세션 쿠키 서명 키 — **운영 시 반드시 설정** (`openssl rand -hex 32`) |

### 3. 설정 점검 및 실행

```bash
npm install
npm run check:supabase   # 접속 정보와 마이그레이션 적용 여부 확인 (데이터 변경 없음)
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

> Supabase가 외부 DB이므로 Vercel 등 서버리스 환경에도 그대로 배포할 수
> 있습니다. 배포 플랫폼의 환경 변수 설정에 위 값들을 등록하세요.

## 부서 설정

부서 목록(이름/색상)은 `src/lib/departments.ts`에서 수정할 수 있습니다.
