# Global Macro Dashboard — 설계 문서 v2

## 프로젝트 철학

**"Frame을 만든다"**

이 대시보드는 정답을 알려주는 도구가 아니다.
사용자가 스스로 시나리오를 구축할 수 있는 프레임을 제공한다.

- 데이터는 API에서 그대로 가져와 보여준다
- 각 지표 옆에 "이 지표가 무엇을 의미하는지" 맥락만 제공한다
- 판단은 사용자가 한다
- 사용자가 직접 기준을 정하고, 비교하고, 시나리오를 설계한다

하드코딩된 경보 시스템 없음. 사용자 정의 알람 시스템.

---

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: TradingView Lightweight Charts (`lightweight-charts`)
- **State**: Zustand (사용자 설정 전역 관리)
- **Storage**: localStorage (사용자 설정 영속화)
- **Deployment**: Vercel

---

## 전체 레이아웃

```
┌──────────────────────────────────────────────────────────┐
│  TOP BAR — 사용자가 직접 구성한 핀 지표들 (자유 편집)      │
│  [VIX 18.5 ▼1.2] [HY OAS 420bp ▲15] [+지표 추가]        │
├──────────────────────────────────────────────────────────┤
│  [증시] [금리·채권] [환율·원자재] [유동성·크레딧]           │
│  [경제지표] [📊 차트 비교] [⚙️ 내 알람]                    │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  탭별 지표 카드 그리드                                     │
│  카드 클릭 → 모달 차트 오픈                                │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 핵심 인터랙션 3가지

### 1. 카드 클릭 → 차트 모달

모든 지표 카드는 클릭 가능하다.
클릭 시 해당 지표의 시계열 차트가 모달로 열린다.

모달 구성:
```
┌─────────────────────────────────────────┐
│  US 2Y Yield          [1M][3M][1Y][5Y]  │
│                                  [📌 핀] │
│  ┌─────────────────────────────────┐    │
│  │  lightweight-charts 시계열       │    │
│  └─────────────────────────────────┘    │
│                                         │
│  이 지표가 의미하는 것                    │
│  2년물 국채 수익률은 향후 2년간 Fed 금리  │
│  기대를 반영한다. Fed 인상 예고 시 실제   │
│  인상 전에 먼저 오르는 가장 빠른 반응     │
│  지표다.                                │
│                                         │
│  관련 지표와의 관계                      │
│  • 2Y↑ → Fed 인상 기대 반영 중          │
│  • 2Y > 10Y → 장단기 역전 (주의)        │
│  • 2Y 빠른 하락 → 침체 대응 인하 시작    │
│                                         │
│  [차트 비교에 추가]  [내 알람 설정]       │
└─────────────────────────────────────────┘
```

### 2. 상단바 — 사용자 핀 지표

상단바는 사용자가 원하는 지표를 자유롭게 추가/제거/순서 변경한다.

- 기본값: VIX, HY OAS, Net Liquidity, USD/KRW
- `[+지표 추가]` 버튼 → 전체 지표 목록에서 선택
- 각 핀 지표 우클릭 또는 X버튼 → 제거
- 드래그로 순서 변경
- 설정은 localStorage에 저장 (새로고침해도 유지)

```typescript
// 핀 지표 타입
interface PinnedMetric {
  id: string           // 지표 고유 ID (예: 'us2y', 'hyOas')
  label: string        // 표시 이름
  value: number
  change: number
  unit: string         // '%', 'bp', '원' 등
  positiveIsGood: boolean  // false면 상승 시 빨간색 (USD/KRW 등)
}
```

### 3. 차트 비교 탭

사용자가 여러 지표를 한 화면에 나란히 놓고 비교하는 탭.

```
┌──────────────────────────────────────────────────────┐
│  📊 차트 비교                          [+ 차트 추가]  │
├──────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐                  │
│  │ US 10Y Yield │  │ HY OAS       │  [+ 추가]        │
│  │  차트        │  │  차트        │                  │
│  │       [X]    │  │       [X]    │                  │
│  └──────────────┘  └──────────────┘                  │
│  ┌──────────────┐  ┌──────────────┐                  │
│  │ Gold         │  │ Net Liquidity│  [+ 추가]        │
│  │  차트        │  │  차트        │                  │
│  │       [X]    │  │       [X]    │                  │
│  └──────────────┘  └──────────────┘                  │
├──────────────────────────────────────────────────────┤
│  기간: [1M] [3M] [6M] [1Y]  ← 전체 차트에 일괄 적용  │
└──────────────────────────────────────────────────────┘
```

- 차트는 최대 6개까지 추가 가능
- 기간 선택은 전체 차트에 일괄 적용
- 배치는 localStorage에 저장

---

## 탭별 지표 구성

### TAB 1: 증시

| 지표 ID | 지표명 | 단위 | 설명 (모달에 표시) |
|---------|--------|------|-------------------|
| `sp500` | S&P 500 | pt | 미국 대형주 500개 지수. 글로벌 위험자산 심리의 기준점 |
| `nasdaq` | NASDAQ | pt | 기술·성장주 중심. 금리에 가장 민감. 이익이 먼 미래에 집중 |
| `kospi` | KOSPI | pt | 한국 대형주. 외국인 수급에 극단적으로 민감 |
| `kosdaq` | KOSDAQ | pt | 한국 중소·기술주 |
| `foreignNetBuy` | 외국인 순매수 (KOSPI) | 억원 | 음수 = 순매도. USD/KRW와 함께 보면 악순환/선순환 루프 판단 가능 |
| `foreignOwnership` | 외국인 지분율 | % | 하락 추세 = 이탈 중. 반등 시 선순환 루프 진입 신호 |
| `fearGreed` | Fear & Greed Index | 0~100 | CNN Money 산출. 7가지 지표 종합. 높을수록 탐욕. 극단값은 역발상 신호 |
| `cpRatio` | KOSPI C/P Ratio | 배 | 콜/풋 거래량 비율. 낮을수록 하락 대비 심리 강함 |

### TAB 2: 금리·채권

| 지표 ID | 지표명 | 단위 | 설명 |
|---------|--------|------|------|
| `fedRate` | Fed 기준금리 | % | FOMC가 결정하는 정책금리. 모든 자산 할인율의 기준 |
| `us2y` | US 2Y Yield | % | 향후 2년 Fed 금리 기대 반영. 가장 빠르게 반응 |
| `us10y` | US 10Y Yield | % | 장기 성장 기대 반영. 주식 할인율의 핵심 기준 |
| `spread2y10y` | 2Y-10Y Spread | bp | 10Y - 2Y. 음수 = 역전. 방향과 속도가 핵심 |
| `bokRate` | BOK 기준금리 | % | 한국은행 정책금리 |
| `kr10y` | KR 10Y Yield | % | 한국 장기금리 |
| `jp10y` | JP 10Y JGB | % | 일본 장기금리. BOJ 정책 정상화 모니터링 |

**2Y-10Y Spread 카드 특이사항**:
- 현재값 + 전월 대비 변화 + 3개월 추세 방향 표시
- 음수 구간에서는 카드 보더를 주황색으로
- 모달 차트에서 음수 구간 빨간 음영 처리

### TAB 3: 환율·원자재

**환율**

| 지표 ID | 지표명 | 단위 | 설명 |
|---------|--------|------|------|
| `usdKrw` | USD/KRW | 원 | 상승 = 원화 약세. 외국인 수급과 함께 보는 것이 핵심 |
| `dxy` | DXY | pt | 달러 인덱스. 상승 = 글로벌 달러 강세. 원자재 하락 압력 |
| `usdJpy` | USD/JPY | 엔 | 엔화 환율. 캐리 트레이드 청산 모니터링 |
| `eurUsd` | EUR/USD | $ | 유로-달러 |

**원자재**

| 지표 ID | 지표명 | 단위 | 설명 |
|---------|--------|------|------|
| `wti` | WTI | $/bbl | 경기 온도계. 단, 공급 충격과 수요 증가를 구분해서 봐야 함 |
| `gold` | Gold | $/oz | 실질금리의 역함수. 화폐 신뢰도 바로미터 |
| `silver` | Silver | $/oz | 가치저장 + 산업재(반도체·태양광·EV). Gold보다 변동성 큼 |

**원자재 카드 추가 정보**:
- Gold 카드: 실질금리(US10Y - 인플레 기대) 함께 표시
- Silver 카드: Gold/Silver Ratio 함께 표시
- WTI 카드: 전월 대비 변화 + DXY와 방향 비교

### TAB 4: 유동성·크레딧

**유동성**

| 지표 ID | 지표명 | 단위 | 설명 |
|---------|--------|------|------|
| `fedAssets` | Fed 자산 | 조달러 | QE/QT 여부. 증가=유동성 공급, 감소=회수 |
| `tga` | TGA 잔고 | 억달러 | 미국 정부 통장. 증가=시장 유동성 감소 |
| `rrp` | RRP 잔고 | 억달러 | Fed에 맡긴 민간 자금. 감소=시장으로 돈 나옴 |
| `netLiquidity` | Net Liquidity | 조달러 | = Fed자산 - TGA - RRP. S&P500과 강한 상관관계 |

**Net Liquidity 카드 특이사항**:
- 공식 `Fed자산 - TGA - RRP` 카드 하단에 항상 표시
- 전주 대비 변화 + 방향 화살표

**크레딧**

| 지표 ID | 지표명 | 단위 | 설명 |
|---------|--------|------|------|
| `hyOas` | HY OAS | bp | 하이일드 크레딧 스프레드. 주식보다 먼저 위험 신호 |
| `igOas` | IG OAS | bp | 투자등급 스프레드. HY보다 둔감하지만 더 넓은 커버 |
| `koreaCds` | 한국 CDS | bp | 한국 부도 위험. 급등 시 외국인 이탈 선행 신호 |

### TAB 5: 경제지표

| 지표 ID | 지표명 | 단위 | 설명 |
|---------|--------|------|------|
| `cpiUs` | CPI (미국) | YoY% | 고정 바구니 기준. 대체 효과 미반영으로 PCE보다 높게 나옴 |
| `pceUs` | PCE (미국) | YoY% | Fed 공식 목표 지표. 실제 소비 변화 반영. 목표 2% |
| `trimmedPce` | 절사평균 PCE | YoY% | 극단값 제거. 기조적 물가 흐름 파악용 |
| `ppiUs` | PPI (미국) | YoY% | 생산자물가. CPI 2~3개월 선행 지표 |
| `unemployment` | 실업률 | % | 낮을수록 고용 과열. 임금 상승 → 인플레 압력 |
| `pmi` | PMI 제조업 | pt | 50 이상=확장. 경기 방향 선행 |
| `gdpUs` | GDP (미국) | QoQ% | 실제 성장률 |
| `cpiKr` | CPI (한국) | YoY% | BOK 목표 2% |

---

## ⚙️ 내 알람 탭

사용자가 직접 지표별 알람 기준을 설정한다.
하드코딩된 경보 없음. 모든 기준은 사용자 정의.

### UI 구조

```
┌─────────────────────────────────────────────────────┐
│  ⚙️ 내 알람 설정                      [+ 알람 추가]  │
├─────────────────────────────────────────────────────┤
│  VIX                                                │
│  현재값: 18.5                                        │
│  ┌────────────────────────────────────────────┐     │
│  │ 🔴 30 이상이면 경보   [수정] [삭제]          │     │
│  │ 🟡 25 이상이면 주의   [수정] [삭제]          │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
│  HY OAS                                             │
│  현재값: 420bp                                       │
│  ┌────────────────────────────────────────────┐     │
│  │ 🔴 500 이상이면 경보   [수정] [삭제]         │     │
│  └────────────────────────────────────────────┘     │
│                                                     │
│  2Y-10Y Spread                                      │
│  현재값: -13bp                                       │
│  ┌────────────────────────────────────────────┐     │
│  │ 🟡 0 이하이면 주의   [수정] [삭제]           │     │
│  │ 🔴 음수→양수 전환 시 경보   [수정] [삭제]    │     │
│  └────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────┘
```

### 알람 추가 모달

```
지표 선택: [드롭다운 — 전체 지표 목록]
조건:      [이상] [이하] [전환: 음수→양수] [전환: 양수→음수]
기준값:    [입력]
레벨:      [🔴 경보] [🟡 주의] [🟢 정보]
메모:      [자유 텍스트 입력 — 이 알람을 만든 이유]
```

### 알람 타입

```typescript
type AlarmCondition =
  | { type: 'above'; threshold: number }
  | { type: 'below'; threshold: number }
  | { type: 'crossUp'; threshold: number }   // 아래→위 전환
  | { type: 'crossDown'; threshold: number } // 위→아래 전환

interface UserAlarm {
  id: string
  metricId: string
  metricLabel: string
  condition: AlarmCondition
  level: 'danger' | 'warning' | 'info'
  memo: string
  createdAt: string
  isActive: boolean
}
```

---

## 지표 메타데이터 구조

각 지표는 값뿐 아니라 맥락 정보를 가진다.
이게 "Frame"의 핵심 — 데이터 + 의미.

```typescript
interface MetricMeta {
  id: string
  label: string
  labelKo: string
  unit: string
  tab: TabId
  positiveIsGood: boolean  // false = 상승이 나쁜 지표 (USD/KRW, VIX 등)

  // 모달에 표시되는 설명
  description: string      // 이 지표가 무엇인지 (1~2문장)
  interpretation: string   // 어떻게 읽는지 (2~3문장)
  relationships: string[]  // 관련 지표와의 관계 (bullet)

  // 차트 설정
  chartConfig: {
    color: string
    negativeZoneColor?: string  // 2Y-10Y처럼 음수 구간 다른 색
    referenceLines?: number[]   // PMI 50, CPI 2% 같은 기준선
  }
}
```

### 지표 메타 예시

```typescript
const metrics: MetricMeta[] = [
  {
    id: 'spread2y10y',
    label: '2Y-10Y Spread',
    labelKo: '장단기 금리차',
    unit: 'bp',
    tab: 'bonds',
    positiveIsGood: true,
    description: '미국 10년물과 2년물 국채 수익률의 차이. 10Y - 2Y로 계산.',
    interpretation:
      '정상 상태에서는 양수. 음수(역전)는 Fed의 급격한 금리 인상 시 발생한다. ' +
      '역전 자체보다 방향과 속도가 중요하다. ' +
      '음수에서 양수로 전환되는 시점(역전 해소)은 역사적으로 실제 침체 시작과 일치해왔다.',
    relationships: [
      '2Y↑ 빠르게 → Fed 인상 기대 강해지는 중',
      '10Y↑ 느리게 → 장기 성장 기대는 아직 유지',
      'Spread 음수 진입 → 평균 12~18개월 후 침체 선행 신호',
      'Spread 음수→양수 전환 → 침체 시작 시점과 역사적으로 일치',
    ],
    chartConfig: {
      color: '#3b82f6',
      negativeZoneColor: 'rgba(239, 68, 68, 0.15)',
      referenceLines: [0],
    },
  },
  {
    id: 'hyOas',
    label: 'HY OAS',
    labelKo: '하이일드 스프레드',
    unit: 'bp',
    tab: 'liquidity',
    positiveIsGood: false,
    description: '하이일드(정크본드) 채권과 미국 국채의 금리 차이. 기업 신용 위험의 온도계.',
    interpretation:
      '스프레드 확대 = 시장이 기업 부도 위험을 높게 평가하는 것. ' +
      '채권 투자자는 주식 투자자보다 보수적이고 선제적이어서 ' +
      '주식보다 수일~수주 먼저 위험 신호를 낸다.',
    relationships: [
      'HY OAS↑ + VIX↑ 동시 → Risk Off 전형 패턴',
      'HY OAS↑ → 수일~수주 후 주가 하락',
      'HY OAS 고점 후 축소 → 단기 저점 탐색 구간',
    ],
    chartConfig: {
      color: '#f59e0b',
      referenceLines: [300, 500, 800],
    },
  },
  {
    id: 'gold',
    label: 'Gold',
    labelKo: '금',
    unit: '$/oz',
    tab: 'fx',
    positiveIsGood: true,
    description: '금 현물 가격. 5000년간 가치 저장 수단. 중앙은행이 찍어낼 수 없는 유일한 자산.',
    interpretation:
      '실질금리(명목금리 - 인플레 기대)의 역함수로 움직인다. ' +
      '실질금리 높으면 국채가 실제 이자를 주니 금 매력 감소. ' +
      '실질금리 마이너스면 국채 보유가 오히려 손해 → 금으로 이동.',
    relationships: [
      '실질금리↑ → 금↓ (국채가 더 매력적)',
      '실질금리↓ or 마이너스 → 금↑',
      '달러강세 → 금↓ (but 위기 시 안전자산 수요로 상쇄 가능)',
      'VIX↑ + 지정학 위기 → 금↑↑ (안전자산 도피)',
    ],
    chartConfig: {
      color: '#eab308',
    },
  },
  {
    id: 'netLiquidity',
    label: 'Net Liquidity',
    labelKo: '순유동성',
    unit: '조달러',
    tab: 'liquidity',
    positiveIsGood: true,
    description: 'Fed자산 - TGA - RRP. 실제로 시장에 돌아다니는 달러의 양.',
    interpretation:
      'Fed가 돈을 풀어도 TGA나 RRP에 흡수되면 시장에 도달하지 않는다. ' +
      '세 변수를 합쳐야 실제 유동성을 알 수 있다. ' +
      'S&P500과 역사적으로 강한 상관관계. TGA·RRP는 매일 공개되어 선행 신호 역할.',
    relationships: [
      'Net Liquidity↑ → 위험자산 우호적 환경',
      'Net Liquidity↓ → 위험자산 압박',
      'TGA 급증 (국채 대량 발행 후) → Net Liquidity 급감 주의',
      'RRP 감소 → 시장으로 돈 나옴 → Net Liquidity 증가',
    ],
    chartConfig: {
      color: '#22c55e',
    },
  },
]
```

---

## 데이터 아키텍처

```
/lib
  /metrics
    metricsMeta.ts      ← 모든 지표 메타데이터 (설명, 관계, 차트 설정)
    metricsTypes.ts     ← TypeScript 타입 정의
  /mock
    mockData.ts         ← 더미 데이터 (API 연결 전)
  /store
    userSettingsStore.ts  ← Zustand: 핀 지표, 알람, 차트 비교 설정
    metricsStore.ts       ← Zustand: 실시간 지표 값

/components
  /layout
    TopBar.tsx          ← 핀 지표 바 (편집 가능)
    TabNav.tsx          ← 탭 네비게이션
  /cards
    MetricCard.tsx      ← 클릭 가능한 지표 카드 (공통)
    SpreadCard.tsx      ← 2Y-10Y Spread 전용 (방향·속도 표시)
    NetLiquidityCard.tsx ← 공식 표시 포함
  /modals
    ChartModal.tsx      ← 카드 클릭 시 차트 모달
    AddPinModal.tsx     ← 핀 지표 추가 모달
    AddAlarmModal.tsx   ← 알람 추가 모달
  /charts
    TimeSeriesChart.tsx ← lightweight-charts 래퍼
    MiniChart.tsx       ← 카드 내 미니 차트 (60px)
  /tabs
    StockTab.tsx
    BondsTab.tsx
    FxCommoditiesTab.tsx
    LiquidityTab.tsx
    EconomicTab.tsx
    ChartCompareTab.tsx ← 차트 비교
    AlarmTab.tsx        ← 내 알람 설정

/hooks
  useMetrics.ts         ← 지표 데이터 fetch
  useAlarms.ts          ← 알람 조건 체크
  useUserSettings.ts    ← localStorage 영속화
```

---

## 사용자 설정 저장 구조 (Zustand + localStorage)

```typescript
interface UserSettings {
  // 상단바 핀 지표
  pinnedMetrics: string[]  // metricId 배열. 순서가 표시 순서

  // 차트 비교 탭 배치
  compareCharts: string[]  // metricId 배열. 최대 6개

  // 사용자 알람
  alarms: UserAlarm[]

  // 기본 차트 기간
  defaultChartPeriod: '1M' | '3M' | '6M' | '1Y'
}

// 기본값
const defaultSettings: UserSettings = {
  pinnedMetrics: ['vix', 'hyOas', 'netLiquidity', 'usdKrw'],
  compareCharts: [],
  alarms: [],
  defaultChartPeriod: '3M',
}
```

---

## 더미 데이터 (2026.06 기준)

```typescript
export const mockMetricsData = {
  // 증시
  sp500:            { value: 4950.5,  change: +0.92 },
  nasdaq:           { value: 15620.3, change: +0.81 },
  kospi:            { value: 2680.5,  change: -0.46 },
  kosdaq:           { value: 865.2,   change: -0.59 },
  foreignNetBuy:    { value: -1250,   change: null },   // 억원
  foreignOwnership: { value: 32.5,    change: -0.3 },   // %
  fearGreed:        { value: 62,      change: +4 },     // 중립
  cpRatio:          { value: 0.68,    change: -0.05 },

  // 금리·채권
  fedRate:          { value: 3.625,   change: 0 },
  us2y:             { value: 4.85,    change: +0.03 },
  us10y:            { value: 4.72,    change: +0.01 },
  spread2y10y:      { value: -13,     change: -2 },     // bp, 음수=역전
  bokRate:          { value: 2.75,    change: 0 },
  kr10y:            { value: 3.45,    change: +0.02 },
  jp10y:            { value: 0.72,    change: +0.04 },

  // 환율
  usdKrw:           { value: 1285.5,  change: +8.5 },
  dxy:              { value: 104.8,   change: +0.3 },
  usdJpy:           { value: 158.3,   change: +0.8 },
  eurUsd:           { value: 1.072,   change: -0.003 },

  // 원자재
  wti:              { value: 82.4,    change: -0.8 },
  gold:             { value: 3150,    change: +12 },
  silver:           { value: 31.2,    change: +0.4 },

  // 유동성
  fedAssets:        { value: 6.8,     change: -0.05 },  // 조달러
  tga:              { value: 8200,    change: +320 },   // 억달러
  rrp:              { value: 3800,    change: -150 },   // 억달러
  netLiquidity:     { value: 5.2,     change: -0.15 },  // 조달러

  // 크레딧
  hyOas:            { value: 420,     change: +15 },    // bp
  igOas:            { value: 128,     change: +4 },     // bp
  koreaCds:         { value: 58,      change: +2 },     // bp

  // 경제지표
  cpiUs:            { value: 3.1,     change: -0.1 },
  pceUs:            { value: 2.8,     change: -0.1 },
  trimmedPce:       { value: 2.4,     change: 0 },
  ppiUs:            { value: 2.9,     change: +0.2 },
  unemployment:     { value: 4.1,     change: +0.1 },
  pmi:              { value: 49.8,    change: -0.5 },   // 50 기준선
  gdpUs:            { value: 2.4,     change: -0.1 },
  cpiKr:            { value: 2.6,     change: +0.1 },
}
```

---

## 개발 순서

1. **프로젝트 세팅**
   - Zustand 설치 (`npm install zustand`)
   - lightweight-charts 설치 (`npm install lightweight-charts`)
   - `/lib/metrics/metricsMeta.ts` 생성 (지표 메타데이터 전체)
   - `/lib/mock/mockData.ts` 생성 (위 더미 데이터)

2. **레이아웃 뼈대**
   - TopBar (핀 지표 표시 — 편집 기능은 나중에)
   - TabNav (7개 탭)
   - 기본 페이지 라우팅

3. **MetricCard 공통 컴포넌트**
   - 값·변화·단위 표시
   - 클릭 핸들러 (모달 오픈)
   - positiveIsGood 기반 색상

4. **탭별 카드 그리드** (더미 데이터로)
   - 5개 지표 탭 전부

5. **ChartModal**
   - lightweight-charts 시계열
   - 지표 설명·관계 패널
   - "차트 비교에 추가" / "알람 설정" 버튼

6. **차트 비교 탭**
   - 사용자 선택 차트 그리드
   - 기간 일괄 적용

7. **내 알람 탭**
   - 알람 CRUD
   - 조건 체크 로직

8. **TopBar 편집 기능**
   - 핀 추가/제거
   - localStorage 영속화

9. **API 연결** (추후)
