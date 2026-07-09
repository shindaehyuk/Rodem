# 로뎀 카페 쿠폰 관리

카페에서 사용하는 부서별 쿠폰 관리 앱입니다. Stripe 핀테크 스타일의 디자인으로,
11개 부서의 쿠폰 보유 현황 확인 · 쿠폰 추가/사용 · 내역 조회 · 관리자 기능을 제공합니다.

## 기술 스택

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** 스타일 컴포넌트
- **Lucide** 아이콘
- **next-themes** 기반 다크모드 (라이트 / 다크 / 시스템)
- 반응형 디자인 (모바일 ~ 데스크톱)
- **SQLite** (better-sqlite3) 서버 저장소 + API 라우트

## 주요 기능

| 페이지 | 경로 | 설명 |
| --- | --- | --- |
| 대시보드 | `/` | 11개 부서 쿠폰 보유 현황, 오늘 추가/사용 통계, 최근 내역 |
| 내역 | `/history` | 쿠폰 추가·사용 전체 내역 (구분/부서별 필터) |
| 관리자 | `/admin` | 관리자 로그인 후 쿠폰 추가·사용 처리 |

- 쿠폰 추가/사용은 **관리자만** 가능합니다 (httpOnly 쿠키 세션, 12시간 유지).
- 보유 수량보다 많이 사용하려 하면 서버에서 차단됩니다.
- 데이터는 서버의 SQLite 데이터베이스(`data/rodem.db`)에 저장되어
  **모든 기기에서 공유**됩니다. 화면은 포커스 복귀 시와 30초마다 자동 갱신됩니다.

### API

| 메서드 | 경로 | 설명 |
| --- | --- | --- |
| `GET` | `/api/state` | 부서별 잔액 + 최근 내역 조회 |
| `POST` | `/api/transactions` | 쿠폰 추가/사용 (관리자 전용) |
| `POST` | `/api/auth/login` | 관리자 로그인 (httpOnly 세션 쿠키 발급) |
| `POST` | `/api/auth/logout` | 로그아웃 |
| `GET` | `/api/auth/session` | 현재 세션 확인 |

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

### 관리자 계정

기본 계정은 `admin` / `rodem1234` 이며, 환경 변수로 변경할 수 있습니다.

| 환경 변수 | 기본값 | 설명 |
| --- | --- | --- |
| `ADMIN_ID` | `admin` | 관리자 아이디 |
| `ADMIN_PASSWORD` | `rodem1234` | 관리자 비밀번호 |
| `AUTH_SECRET` | (개발용 기본값) | 세션 쿠키 서명 키 — **운영 시 반드시 설정** |
| `DATABASE_PATH` | `./data/rodem.db` | SQLite 파일 경로 |

```bash
# 예: 운영 실행
ADMIN_PASSWORD=새비밀번호 AUTH_SECRET=$(openssl rand -hex 32) npm start
```

> ⚠️ 배포 참고: SQLite는 파일 기반이므로 **파일 시스템이 유지되는 서버**
> (일반 VPS, Docker 볼륨, Railway/Fly.io 볼륨 등)에 배포해야 합니다.
> Vercel 같은 서버리스 환경에서는 파일이 유지되지 않으므로
> Turso, Supabase 등 외부 DB로 교체가 필요합니다.

## 부서 설정

부서 목록(이름/색상)은 `src/lib/departments.ts`에서 수정할 수 있습니다.
