# 프로젝트 구조

## 📁 디렉토리 구조

```
global-macro-dashboard/
├── 📂 app/                          # Next.js App Router
│   ├── api/                        # API Routes
│   │   ├── ecos/route.ts          # 한국은행 ECOS API
│   │   ├── fred/route.ts          # FRED API
│   │   └── yahoo/route.ts         # Yahoo Finance API
│   ├── globals.css                # 전역 스타일
│   ├── layout.tsx                 # 루트 레이아웃
│   └── page.tsx                   # 메인 페이지
│
├── 📂 components/                   # React 컴포넌트
│   ├── cards/
│   │   └── MetricCard.tsx         # 지표 카드 컴포넌트
│   ├── layout/
│   │   ├── TabNav.tsx             # 탭 네비게이션
│   │   └── TopBar.tsx             # 상단 바
│   ├── modals/
│   │   ├── AlarmModal.tsx         # 알람 설정 모달
│   │   ├── ChartModal.tsx         # 차트 모달
│   │   └── MetricSelectorModal.tsx # 지표 선택 모달
│   └── tabs/
│       ├── AlarmsTab.tsx          # 알람 탭
│       ├── BondsTab.tsx           # 채권 탭
│       ├── CalendarTab.tsx        # 캘린더 탭
│       ├── CompareTab.tsx         # 비교 탭
│       ├── EconomicTab.tsx        # 경제지표 탭
│       ├── FxCommoditiesTab.tsx   # 외환/원자재 탭
│       ├── LiquidityTab.tsx       # 유동성 탭
│       └── StocksTab.tsx          # 주식 탭
│
├── 📂 lib/                          # 유틸리티 & 로직
│   ├── api/
│   │   ├── ecos.ts                # ECOS API 클라이언트
│   │   ├── fred.ts                # FRED API 클라이언트
│   │   └── yahoo.ts               # Yahoo Finance API 클라이언트
│   ├── hooks/
│   │   └── useMetrics.ts          # 지표 데이터 훅
│   ├── metrics/
│   │   ├── metricsMeta.ts         # 지표 메타데이터
│   │   └── metricsTypes.ts        # 지표 타입 정의
│   ├── mock/
│   │   ├── mockData.ts            # 목업 데이터
│   │   └── mockTimeSeriesData.ts  # 시계열 목업 데이터
│   ├── store/
│   │   └── userSettingsStore.ts   # Zustand 사용자 설정 스토어
│   ├── types/
│   │   └── metrics.ts             # TypeScript 타입 정의
│   └── utils/
│       └── dateUtils.ts           # 날짜 유틸리티
│
├── 📂 public/                       # 정적 파일
│
├── 📄 설정 파일
│   ├── .env.local                 # 환경 변수 (API 키)
│   ├── package.json               # 프로젝트 의존성
│   ├── tsconfig.json              # TypeScript 설정
│   ├── next.config.ts             # Next.js 설정
│   ├── eslint.config.mjs          # ESLint 설정
│   └── postcss.config.mjs         # PostCSS 설정
│
└── 📄 문서
    ├── README.md                  # 프로젝트 개요
    ├── USER_MANUAL.md             # 사용자 매뉴얼
    ├── PROJECT_STRUCTURE.md       # 프로젝트 구조 (본 문서)
    ├── AGENTS.md                  # AI 에이전트 규칙
    └── CLAUDE.md                  # Claude 설정
```

## 🔑 주요 기술 스택

### 프론트엔드
- **Framework**: Next.js 16.2.9 (App Router)
- **React**: 19.2.4
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5.0.14

### 데이터 시각화
- **Chart.js**: 4.5.1 (with react-chartjs-2)
  - 용도: 기본 차트 및 경제지표 시각화
- **Lightweight Charts**: 5.2.0
  - 용도: 고성능 주식/채권 차트

### API 통합
- **FRED API**: 미국 연방준비제도 경제지표
- **ECOS API**: 한국은행 경제통계
- **Yahoo Finance API**: 실시간 주가, 채권, 환율 데이터

### 유틸리티
- **date-fns**: 날짜 처리
- **cheerio**: HTML 파싱 (웹 스크래핑용)

## 🏗️ 아키텍처 패턴

### 1. 계층화된 구조
```
UI Layer (components/)
    ↓
Business Logic (lib/hooks/, lib/api/)
    ↓
Data Layer (API Routes, External APIs)
```

### 2. API Route 패턴
각 데이터 소스는 독립적인 API Route로 분리:
- `/api/fred`: FRED API 프록시
- `/api/ecos`: ECOS API 프록시
- `/api/yahoo`: Yahoo Finance API 프록시

**장점:**
- API 키 보안 (서버 사이드에서만 사용)
- CORS 이슈 해결
- 응답 캐싱 및 에러 핸들링 중앙화

### 3. 컴포넌트 구조
```
components/
├── cards/      # 재사용 가능한 카드 컴포넌트
├── layout/     # 레이아웃 컴포넌트 (TopBar, TabNav)
├── modals/     # 모달 다이얼로그
└── tabs/       # 각 탭의 메인 컴포넌트
```

### 4. 상태 관리
- **Local State**: React useState/useEffect
- **Global State**: Zustand (`userSettingsStore.ts`)
  - 사용자 선택 지표
  - 알람 설정
  - 탭 상태

### 5. 타입 시스템
```typescript
lib/types/         # 공통 타입 정의
lib/metrics/       # 지표 관련 타입 및 메타데이터
```

## 📊 데이터 플로우

### 1. 지표 데이터 로딩
```
사용자 → useMetrics Hook → API Route → 외부 API → 데이터 파싱 → 차트 렌더링
```

### 2. 실시간 주가 업데이트
```
StocksTab → Yahoo API (/api/yahoo) → 주기적 폴링 → Lightweight Charts 업데이트
```

### 3. 알람 시스템
```
사용자 설정 → userSettingsStore → 주기적 체크 → 조건 충족 시 알림
```

## 🔐 환경 변수

`.env.local` 파일에 다음 API 키 필요:
```env
FRED_API_KEY=your_fred_api_key
ECOS_API_KEY=your_ecos_api_key
```

## 🚀 주요 기능 모듈

### 1. 경제지표 대시보드
- **파일**: `components/tabs/EconomicTab.tsx`
- **API**: FRED, ECOS
- **차트**: Chart.js

### 2. 주식/채권 차트
- **파일**: `components/tabs/StocksTab.tsx`, `BondsTab.tsx`
- **API**: Yahoo Finance
- **차트**: Lightweight Charts

### 3. 지표 비교
- **파일**: `components/tabs/CompareTab.tsx`
- **기능**: 여러 지표를 하나의 차트에 오버레이

### 4. 알람 시스템
- **파일**: `components/tabs/AlarmsTab.tsx`
- **스토어**: `lib/store/userSettingsStore.ts`
- **기능**: 지표 임계값 알람

## 📝 코딩 컨벤션

### 파일 명명 규칙
- 컴포넌트: PascalCase (예: `MetricCard.tsx`)
- 유틸리티/API: camelCase (예: `dateUtils.ts`)
- 타입 정의: camelCase (예: `metrics.ts`)

### 컴포넌트 구조
```typescript
// 1. Imports
import { useState } from 'react'
import type { MetricData } from '@/lib/types/metrics'

// 2. Types/Interfaces
interface Props {
  data: MetricData
}

// 3. Component
export default function MyComponent({ data }: Props) {
  // 4. Hooks
  const [state, setState] = useState()

  // 5. Handlers
  const handleClick = () => {}

  // 6. Render
  return <div>...</div>
}
```

### Import Alias
- `@/*`: 프로젝트 루트 경로 (tsconfig.json에서 설정)
- 예: `import { fetchFredData } from '@/lib/api/fred'`

## 🔄 개발 워크플로우

### 1. 로컬 개발
```bash
npm run dev        # 개발 서버 시작 (포트 3000)
npm run build      # 프로덕션 빌드
npm run start      # 프로덕션 서버 시작
npm run lint       # ESLint 실행
```

### 2. 새 기능 추가 시
1. 타입 정의 추가 (`lib/types/`)
2. API 클라이언트 작성 (`lib/api/`)
3. API Route 생성 (`app/api/`)
4. 커스텀 훅 작성 (`lib/hooks/`)
5. UI 컴포넌트 구현 (`components/`)

### 3. Git 워크플로우
- 브랜치: `main` (메인 브랜치)
- 커밋 컨벤션:
  - `feat:` 새 기능
  - `fix:` 버그 수정
  - `chore:` 설정 변경
  - `docs:` 문서 업데이트

## 🎯 확장 가능성

### 추가 예정 기능
1. **데이터 내보내기**: CSV/Excel 다운로드
2. **사용자 인증**: 개인화된 대시보드
3. **실시간 알람**: 브라우저 푸시 알림
4. **모바일 최적화**: 반응형 차트 개선
5. **백엔드 통합**: 데이터 캐싱 및 히스토리 저장

### 성능 최적화
- React 19의 Server Components 활용
- Chart.js 데이터 데시메이션
- API 응답 캐싱 (Next.js Cache)
- 이미지 최적화 (next/image)

## 📚 참고 문서
- [Next.js 16 문서](https://nextjs.org/docs)
- [Tailwind CSS 4](https://tailwindcss.com/docs)
- [Chart.js](https://www.chartjs.org/docs/)
- [Lightweight Charts](https://tradingview.github.io/lightweight-charts/)
- [FRED API](https://fred.stlouisfed.org/docs/api/)
- [한국은행 ECOS API](https://ecos.bok.or.kr/api/)
