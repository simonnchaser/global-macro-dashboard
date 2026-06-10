/**
 * 지표 타입 정의
 */

export type TabId = 'stocks' | 'bonds' | 'fx' | 'liquidity' | 'economic' | 'calendar' | 'compare' | 'alarms';

export type MetricId =
  // 증시
  | 'sp500' | 'nasdaq' | 'kospi' | 'kosdaq'
  | 'foreignNetBuy' | 'foreignOwnership' | 'fearGreed' | 'cpRatio'
  // 금리·채권
  | 'fedRate' | 'us2y' | 'us10y' | 'spread2y10y'
  | 'bokRate' | 'kr10y' | 'jp10y'
  // 환율
  | 'usdKrw' | 'dxy' | 'usdJpy' | 'eurUsd'
  // 원자재
  | 'wti' | 'gold' | 'silver'
  // 유동성
  | 'fedAssets' | 'tga' | 'rrp' | 'netLiquidity'
  // 크레딧
  | 'hyOas' | 'igOas' | 'koreaCds'
  // 경제지표
  | 'cpiUs' | 'pceUs' | 'trimmedPce' | 'ppiUs'
  | 'unemployment' | 'pmi' | 'gdpUs' | 'cpiKr';

export interface MetricValue {
  value: number;
  change: number | null;
}

export interface MetricMeta {
  id: MetricId;
  label: string;
  labelKo: string;
  unit: string;
  tab: TabId;
  positiveIsGood: boolean;  // false = 상승이 나쁜 지표 (USD/KRW, VIX 등)

  // 모달에 표시되는 설명
  description: string;      // 이 지표가 무엇인지 (1~2문장)
  interpretation: string;   // 어떻게 읽는지 (2~3문장)
  relationships: string[];  // 관련 지표와의 관계 (bullet)

  // 차트 설정
  chartConfig: {
    color: string;
    negativeZoneColor?: string;  // 2Y-10Y처럼 음수 구간 다른 색
    referenceLines?: number[];   // PMI 50, CPI 2% 같은 기준선
  };
}

// 알람 조건
export type AlarmCondition =
  | { type: 'above'; threshold: number }
  | { type: 'below'; threshold: number }
  | { type: 'crossUp'; threshold: number }   // 아래→위 전환
  | { type: 'crossDown'; threshold: number }; // 위→아래 전환

export interface UserAlarm {
  id: string;
  metricId: MetricId;
  metricLabel: string;
  condition: AlarmCondition;
  level: 'danger' | 'warning' | 'info';
  memo: string;
  createdAt: string;
  isActive: boolean;
}

// 사용자 설정
export interface UserSettings {
  // 상단바 핀 지표
  pinnedMetrics: MetricId[];  // metricId 배열. 순서가 표시 순서

  // 차트 비교 탭 배치
  compareCharts: MetricId[];  // metricId 배열. 최대 6개

  // 사용자 알람
  alarms: UserAlarm[];

  // 기본 차트 기간
  defaultChartPeriod: '1M' | '3M' | '6M' | '1Y';
}

export const defaultSettings: UserSettings = {
  pinnedMetrics: ['vix', 'hyOas', 'netLiquidity', 'usdKrw'],
  compareCharts: [],
  alarms: [],
  defaultChartPeriod: '3M',
};
