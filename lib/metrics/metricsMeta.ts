/**
 * 모든 지표의 메타데이터
 * Frame의 핵심 — 데이터 + 의미
 */

import type { MetricMeta } from './metricsTypes';

export const metricsMeta: MetricMeta[] = [
  // === 금리·채권 ===
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
    id: 'us2y',
    label: 'US 2Y Yield',
    labelKo: '미국 2년물 국채 수익률',
    unit: '%',
    tab: 'bonds',
    positiveIsGood: true,
    description: '향후 2년간 Fed 금리 기대를 반영하는 가장 빠른 반응 지표.',
    interpretation:
      'Fed 인상 예고 시 실제 인상 전에 먼저 오르는 가장 빠른 반응 지표다. ' +
      '단기 금리는 정책에 직접 반응하므로 Fed의 의도를 실시간으로 읽을 수 있다.',
    relationships: [
      '2Y↑ → Fed 인상 기대 반영 중',
      '2Y > 10Y → 장단기 역전 (주의)',
      '2Y 빠른 하락 → 침체 대응 인하 시작',
    ],
    chartConfig: {
      color: '#3b82f6',
      referenceLines: [],
    },
  },

  {
    id: 'us10y',
    label: 'US 10Y Yield',
    labelKo: '미국 10년물 국채 수익률',
    unit: '%',
    tab: 'bonds',
    positiveIsGood: true,
    description: '장기 성장 기대를 반영하는 주식 할인율의 핵심 기준.',
    interpretation:
      '장기 국채 수익률은 향후 10년간의 성장과 인플레 기대를 종합한다. ' +
      '주식의 미래 현금흐름을 할인하는 기준금리 역할을 하므로 주가와 역상관이 강하다.',
    relationships: [
      '10Y↑ → 주식 할인율↑ → 주가 하락 압력',
      '10Y↑ 빠르게 → 성장 기대 또는 인플레 우려',
      '10Y↓ → 침체 우려 또는 Fed 인하 기대',
    ],
    chartConfig: {
      color: '#06b6d4',
      referenceLines: [],
    },
  },

  // === 유동성·크레딧 ===
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

  // === 원자재 ===
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

  // === 환율 ===
  {
    id: 'usdKrw',
    label: 'USD/KRW',
    labelKo: '달러-원 환율',
    unit: '원',
    tab: 'fx',
    positiveIsGood: false,  // 상승 = 원화 약세 = 나쁨
    description: '달러-원 환율. 상승 = 원화 약세.',
    interpretation:
      '외국인 수급과 함께 보는 것이 핵심. ' +
      '외국인 순매도 + USD/KRW 상승 = 악순환 루프. ' +
      '외국인 순매수 + USD/KRW 하락 = 선순환 루프.',
    relationships: [
      'USD/KRW↑ + 외국인 순매도 → 악순환 루프',
      'USD/KRW↓ + 외국인 순매수 → 선순환 루프',
      'DXY↑ → USD/KRW↑ (글로벌 달러 강세)',
    ],
    chartConfig: {
      color: '#ef4444',
    },
  },

  // === 증시 ===
  {
    id: 'sp500',
    label: 'S&P 500',
    labelKo: 'S&P 500',
    unit: 'pt',
    tab: 'stocks',
    positiveIsGood: true,
    description: '미국 대형주 500개 지수. 글로벌 위험자산 심리의 기준점.',
    interpretation:
      '시가총액 가중 방식으로 애플, 마이크로소프트 등 대형주 비중이 높다. ' +
      '글로벌 위험자산의 기준이 되며, 모든 자산군이 이 지수와 비교된다.',
    relationships: [
      'Net Liquidity↑ → S&P 500↑',
      'HY OAS↑ → S&P 500↓ (수일~수주 선행)',
      '10Y Yield↑ 급격히 → S&P 500↓',
    ],
    chartConfig: {
      color: '#10b981',
    },
  },

  {
    id: 'kospi',
    label: 'KOSPI',
    labelKo: 'KOSPI',
    unit: 'pt',
    tab: 'stocks',
    positiveIsGood: true,
    description: '한국 대형주. 외국인 수급에 극단적으로 민감.',
    interpretation:
      '삼성전자, SK하이닉스 등 수출주 비중이 높아 글로벌 경기와 원화 환율에 민감하다. ' +
      '외국인 지분율이 30%가 넘어 외국인 수급이 방향을 결정한다.',
    relationships: [
      '외국인 순매수 + USD/KRW↓ → KOSPI↑',
      '외국인 순매도 + USD/KRW↑ → KOSPI↓',
      'S&P 500↑ → KOSPI↑ (but 지연 반응)',
    ],
    chartConfig: {
      color: '#3b82f6',
    },
  },

  // 기타 주요 지표들 (간략하게)
  {
    id: 'nasdaq',
    label: 'NASDAQ',
    labelKo: 'NASDAQ',
    unit: 'pt',
    tab: 'stocks',
    positiveIsGood: true,
    description: '기술·성장주 중심. 금리에 가장 민감.',
    interpretation: '이익이 먼 미래에 집중되어 있어 금리 변화에 민감하게 반응한다.',
    relationships: ['10Y Yield↑ → NASDAQ↓ (강한 역상관)'],
    chartConfig: { color: '#8b5cf6' },
  },

  {
    id: 'fedRate',
    label: 'Fed Rate',
    labelKo: '연준 기준금리',
    unit: '%',
    tab: 'bonds',
    positiveIsGood: true,
    description: 'FOMC가 결정하는 정책금리. 모든 자산 할인율의 기준.',
    interpretation: 'Fed의 의도가 직접 반영되는 유일한 금리. 다른 모든 금리의 기준점.',
    relationships: ['Fed Rate↑ → 모든 자산 할인율↑'],
    chartConfig: { color: '#06b6d4' },
  },
];

// 모든 지표 배열 export (지표 선택 모달용)
export const allMetrics = metricsMeta;

// 지표 ID로 메타데이터 찾기
export const getMetricMeta = (id: string): MetricMeta | undefined => {
  return metricsMeta.find((m) => m.id === id);
};

// 탭별 지표 목록
export const getMetricsByTab = (tab: string): MetricMeta[] => {
  return metricsMeta.filter((m) => m.tab === tab);
};
