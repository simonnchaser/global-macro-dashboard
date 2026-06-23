# Global Macro Dashboard

실시간 글로벌 거시경제 지표 대시보드 - 52개 핵심 지표를 한눈에 모니터링

## 📊 주요 기능

### 1. 실시간 지표 모니터링 (52개 지표)
- **미국 경제지표 (FRED)**: 금리, 채권, 유동성, 인플레이션, 고용, GDP
- **글로벌 시장 (Yahoo Finance)**: 증시, 환율, 원자재
- **한국 경제지표 (ECOS)**: 금리, 채권, 경제지표, 환율

### 2. 실시간 차트
- **1분봉 차트**: 주요 증시 실시간 모니터링 (1D 탭)
- **타임존 지원**: KST, EDT, UTC 자동 처리
- **기간 선택**: 1D, 1M, 3M, 6M, 1Y, MAX
- **기술적 기능**: 음수 구간 음영, 기준선 표시

### 3. 차트 비교
- 최대 6개 지표 동시 비교
- 정규화 옵션으로 스케일 통일
- 개별 차트 클릭으로 확대 보기

### 4. 알람 시스템
- 지표별 목표값 설정
- 도달 시 시각적 알림

## 🚀 시작하기

### 환경 변수 설정
`.env.local` 파일을 생성하고 API 키를 입력하세요:

```bash
FRED_API_KEY=your_fred_api_key
ECOS_API_KEY=your_ecos_api_key
```

### 설치 및 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

## 📁 프로젝트 구조

```
global-macro-dashboard/
├── app/
│   ├── api/                    # API 라우트
│   │   ├── fred/              # FRED API (미국 경제지표)
│   │   ├── yahoo/             # Yahoo Finance API (증시·원자재·환율)
│   │   └── ecos/              # ECOS API (한국 경제지표)
│   ├── page.tsx               # 메인 페이지
│   └── layout.tsx             # 루트 레이아웃
├── components/
│   ├── cards/                 # 지표 카드
│   ├── layout/                # 레이아웃 (TopBar, TabNav)
│   ├── modals/                # 모달 (Chart, Alarm, MetricSelector)
│   └── tabs/                  # 탭별 컴포넌트
├── lib/
│   ├── api/                   # API 설정 (FRED, Yahoo, ECOS)
│   ├── hooks/                 # React Hooks (useMetrics)
│   ├── metrics/               # 지표 메타데이터 및 타입
│   ├── store/                 # Zustand 상태 관리
│   ├── types/                 # TypeScript 타입 정의
│   └── utils/                 # 유틸리티 함수
└── public/                    # 정적 파일
```

## 🔧 기술 스택

- **Framework**: Next.js 16.2.9 (App Router)
- **언어**: TypeScript
- **스타일링**: Tailwind CSS
- **차트**: lightweight-charts v5 (TradingView)
- **상태관리**: Zustand
- **API**:
  - FRED (Federal Reserve Economic Data)
  - Yahoo Finance
  - ECOS (한국은행 경제통계시스템)

## 📊 지표 목록

### FRED API (16개)
- 금리·채권: Fed Rate, US 2Y, US 10Y, 2Y-10Y Spread
- 유동성: Fed Assets, TGA, RRP, Net Liquidity, HY OAS, IG OAS
- 경제지표: CPI, PCE, Core PCE, Trimmed PCE, PPI, Unemployment, GDP

### Yahoo Finance API (16개)
- 증시: S&P 500, NASDAQ, KOSPI, KOSDAQ
- 환율: DXY, EUR/USD, USD/JPY, USD/CNY
- 원자재: Gold, Silver, WTI, Brent, Natural Gas, Copper

### ECOS API (20개)
- 금리·채권: BOK Rate, KR 3Y, KR 10Y, 3Y-10Y Spread, Corp AA-, Corp BBB-
- 유동성: IG Spread, HY Spread, FX Reserves
- 경제지표: CPI KR, Unemployment KR, GDP KR, PPI KR, Industrial Production
- 환율: USD/KRW, EUR/KRW, JPY/KRW, CNY/KRW

## 🎯 특징

### 실시간 데이터 갱신
- 1분봉: 60초마다 갱신 (Yahoo Finance)
- 일봉: 5분마다 갱신 (Yahoo Finance)
- 금리·경제지표: 1~24시간 캐싱 (FRED, ECOS)

### 타임존 자동 처리
- 한국 증시: KST (UTC+9)
- 미국 증시: EDT (UTC-4)
- 국제 시장: UTC

### 단위 자동 변환
- FRED: Millions → 조달러/억달러, % → bp, Index → YoY%
- ECOS: 백만달러 → 억달러, Index → YoY%

## 📝 라이선스

MIT License

## 🤝 기여

이슈 및 풀 리퀘스트 환영합니다!

---

**Built with [Next.js](https://nextjs.org) and [lightweight-charts](https://tradingview.github.io/lightweight-charts/)**
