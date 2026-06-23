/**
 * 모든 지표의 메타데이터
 * Frame의 핵심 — 데이터 + 의미
 */

import type { MetricMeta } from './metricsTypes';

export const metricsMeta: MetricMeta[] = [
  // === 금리·채권 ===
  {
    id: 'spread2y10y',
    label: '2Y-10Y Spread (US)',
    labelKo: '장단기 금리차 (미국)',
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
    label: '2Y Yield (US)',
    labelKo: '2년물 국채 (미국)',
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
    label: '10Y Yield (US)',
    labelKo: '10년물 국채 (미국)',
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
    label: 'HY OAS (US)',
    labelKo: '하이일드 스프레드 (미국)',
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
    id: 'igOas',
    label: 'IG OAS (US)',
    labelKo: '투자등급 스프레드 (미국)',
    unit: 'bp',
    tab: 'liquidity',
    positiveIsGood: false,
    description: '투자등급 회사채와 미국 국채의 금리 차이.',
    interpretation:
      'HY OAS보다 변동성이 작지만 신용시장 전체의 건강도를 보여준다. ' +
      'IG OAS 확대는 우량 기업조차 자금 조달 비용이 높아짐을 의미.',
    relationships: [
      'IG OAS↑ → 신용시장 전반 긴축',
      'IG + HY 동시 확대 → Risk Off 강력 신호',
    ],
    chartConfig: {
      color: '#f97316',
      referenceLines: [100, 150, 200],
    },
  },

  {
    id: 'fedAssets',
    label: 'Fed Assets (US)',
    labelKo: 'Fed 자산 (미국)',
    unit: '조달러',
    tab: 'liquidity',
    positiveIsGood: true,
    description: 'Fed 대차대조표 총자산. QE로 증가, QT로 감소.',
    interpretation:
      'Fed가 시장에서 국채·MBS를 매입하면 증가. ' +
      '자산 증가 = 시중 통화량 증가 = 유동성 증가.',
    relationships: [
      'Fed Assets↑ → QE 진행 중 → 주가 우호적',
      'Fed Assets↓ → QT 진행 중 → 유동성 축소',
    ],
    chartConfig: {
      color: '#10b981',
    },
  },

  {
    id: 'tga',
    label: 'TGA (US)',
    labelKo: '재무부 계좌 (미국)',
    unit: '억달러',
    tab: 'liquidity',
    positiveIsGood: false,
    description: '미국 재무부가 Fed에 보유한 현금. 국채 발행으로 증가.',
    interpretation:
      'TGA 증가 = 재무부가 국채를 팔아 시장에서 현금을 흡수 = 유동성 감소. ' +
      'TGA 감소 = 재무부가 돈을 쓰면서 시장에 현금 방출 = 유동성 증가.',
    relationships: [
      'TGA↑ → Net Liquidity↓ → 주가 압박',
      'TGA↓ → Net Liquidity↑ → 주가 우호적',
    ],
    chartConfig: {
      color: '#ef4444',
    },
  },

  {
    id: 'rrp',
    label: 'RRP (US)',
    labelKo: '역레포 (미국)',
    unit: '억달러',
    tab: 'liquidity',
    positiveIsGood: false,
    description: 'Fed의 역레포 잔액. MMF가 초과 현금을 Fed에 맡긴 금액.',
    interpretation:
      'RRP 증가 = 시장에서 돈이 Fed로 회수됨 = 유동성 감소. ' +
      'RRP 감소 = Fed에 맡긴 돈이 시장으로 나옴 = 유동성 증가.',
    relationships: [
      'RRP↑ → Net Liquidity↓',
      'RRP↓ → Net Liquidity↑ → 주가 우호적',
    ],
    chartConfig: {
      color: '#f59e0b',
    },
  },

  {
    id: 'netLiquidity',
    label: 'Net Liquidity (US)',
    labelKo: '순유동성 (미국)',
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
    label: 'Gold (Global)',
    labelKo: '금 (국제)',
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
    id: 'silver',
    label: 'Silver (Global)',
    labelKo: '은 (국제)',
    unit: '$/oz',
    tab: 'fx',
    positiveIsGood: true,
    description: '은 현물 가격. 화폐 금속이자 산업 원자재의 이중 성격.',
    interpretation:
      '금과 유사하게 안전자산 역할을 하지만, 산업 수요(태양광, 전자기기)가 50% 이상. ' +
      '경기 회복기에는 금보다 더 강한 상승을 보이고(금은비 하락), 위기 시에는 금보다 더 빠르게 하락.',
    relationships: [
      '실질금리↓ → 은↑ (금과 동행)',
      '경기 확장기 → 산업 수요↑ → 은↑↑',
      '금은비(Gold/Silver) 90 이상 → 은 저평가 신호',
      'DXY↑ → 은↓ (달러 표시 원자재)',
    ],
    chartConfig: {
      color: '#94a3b8',
    },
  },

  {
    id: 'wti',
    label: 'WTI Crude (Global)',
    labelKo: 'WTI 원유 (국제)',
    unit: '$/barrel',
    tab: 'fx',
    positiveIsGood: true,
    description: '미국산 경질유 (WTI). 미국 원유 가격의 벤치마크.',
    interpretation:
      '미국 셰일오일 생산량과 OPEC+ 공급 정책에 민감. ' +
      '원유 가격은 인플레이션의 선행지표. WTI 급등 → PPI↑ → CPI↑ 전이. ' +
      '브렌트유와 일반적으로 동행하지만 미국 재고·생산량에 따라 괴리 발생.',
    relationships: [
      'WTI↑ → PPI↑ → CPI↑ (인플레 압력)',
      'WTI↑ 급등 → 소비 위축 → 경기 둔화 리스크',
      'DXY↑ → WTI↓ (달러 표시 원자재)',
      'OPEC+ 감산 → WTI↑',
    ],
    chartConfig: {
      color: '#f97316',
    },
  },

  {
    id: 'brent',
    label: 'Brent Crude (Global)',
    labelKo: '브렌트유 (국제)',
    unit: '$/barrel',
    tab: 'fx',
    positiveIsGood: true,
    description: '북해산 원유 (Brent). 글로벌 원유 가격의 국제 벤치마크.',
    interpretation:
      'WTI보다 글로벌 수급 반영. 유럽·아시아 원유 거래의 기준. ' +
      '일반적으로 WTI보다 배럴당 3~5달러 높게 형성 (운송비·품질 프리미엄). ' +
      '중동 지정학 리스크에 WTI보다 민감.',
    relationships: [
      'Brent↑ → 글로벌 인플레 압력',
      '중동 위기 → Brent 급등',
      'Brent - WTI Spread 확대 → 미국 원유 공급↑ 신호',
      'DXY↑ → Brent↓',
    ],
    chartConfig: {
      color: '#ea580c',
    },
  },

  {
    id: 'natgas',
    label: 'Natural Gas (US)',
    labelKo: '천연가스 (미국)',
    unit: '$/MMBtu',
    tab: 'fx',
    positiveIsGood: true,
    description: '미국 천연가스 현물 가격. 난방·발전 연료.',
    interpretation:
      '계절성이 강한 에너지 원자재. 겨울(난방 수요)과 여름(냉방 발전)에 급등. ' +
      '원유와 달리 저장·운송이 어려워 지역별 가격 차이 큼. ' +
      '셰일가스 혁명 이후 미국은 천연가스 순수출국.',
    relationships: [
      '동절기(11~2월) → 난방 수요↑ → natgas↑',
      '하절기(7~8월) → 발전 수요↑ → natgas↑',
      '천연가스↑ 급등 → 전기요금↑ → 소비자물가↑',
      '유럽 천연가스 위기 → LNG 수출↑ → 미국 natgas↑',
    ],
    chartConfig: {
      color: '#14b8a6',
    },
  },

  {
    id: 'copper',
    label: 'Copper (Global)',
    labelKo: '구리 (국제)',
    unit: '$/MT',
    tab: 'fx',
    positiveIsGood: true,
    description: '구리 선물 가격. "경제학 박사 학위를 가진 금속".',
    interpretation:
      '건설·제조·전력 등 모든 산업에 필수. 글로벌 경기의 가장 정확한 선행지표. ' +
      '구리 급락은 평균 3~6개월 후 경기 둔화로 이어지는 패턴. ' +
      '중국 수요가 전체의 50% 이상. 중국 부동산·인프라 투자와 직결.',
    relationships: [
      '구리↑ → 글로벌 경기 확장 신호',
      '구리↓ 급락 → 침체 선행 경고',
      '중국 인프라 투자↑ → 구리↑',
      '구리/금 비율↑ → Risk On (성장 우선)',
      '구리/금 비율↓ → Risk Off (안전자산 선호)',
    ],
    chartConfig: {
      color: '#c2410c',
    },
  },

  {
    id: 'gasPrice',
    label: 'US Gas Price (US)',
    labelKo: '미국 휘발유 가격 (미국)',
    unit: '$/gallon',
    tab: 'fx',
    positiveIsGood: false,
    description: '미국 평균 휘발유 소매가격 (갤런당). 소비자 체감 인플레이션의 최전선.',
    interpretation:
      '소비자가 가장 자주 접하는 가격. 정치적으로 민감한 지표. ' +
      '휘발유 가격 급등 → 소비자 심리 악화 → 소비 위축. ' +
      'WTI 원유 + 정제 마진 + 유통비용으로 구성. 원유보다 2~4주 후행.',
    relationships: [
      'WTI↑ → 2~4주 후 휘발유↑',
      '휘발유 $4 초과 → 소비자 심리 급격 악화',
      '휘발유↑ → CPI↑ (교통비 항목 직접 반영)',
      '대선 전 → 정부 비축유 방출 → 휘발유↓ 시도',
    ],
    chartConfig: {
      color: '#dc2626',
    },
  },

  // === 환율 ===
  {
    id: 'usdKrw',
    label: 'USD/KRW',
    labelKo: '달러/원',
    unit: '원',
    tab: 'fx',
    positiveIsGood: false,  // 상승 = 원화 약세 = 나쁨
    description: '달러-원 환율 (매매기준율). 상승 = 원화 약세.',
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

  {
    id: 'eurKrw',
    label: 'EUR/KRW',
    labelKo: '유로/원',
    unit: '원',
    tab: 'fx',
    positiveIsGood: false,
    description: '유로-원 환율. EUR/USD × USD/KRW와 동행.',
    interpretation:
      '유로존 통화정책과 경기 전망을 반영. ' +
      'ECB 긴축 시 유로 강세, 완화 시 유로 약세.',
    relationships: [
      'ECB 긴축 → EUR 강세 → EUR/KRW↑',
      'EUR/USD↑ + USD/KRW↑ → EUR/KRW↑↑',
      '유로존 경기↓ → EUR 약세',
    ],
    chartConfig: {
      color: '#f59e0b',
    },
  },

  {
    id: 'jpyKrw',
    label: 'JPY/KRW',
    labelKo: '엔/원 (100엔)',
    unit: '원',
    tab: 'fx',
    positiveIsGood: false,
    description: '100엔당 원화 환율. 엔캐리 트레이드와 밀접.',
    interpretation:
      'JPY 약세(JPY/KRW↓) → 엔캐리 활성화 → 글로벌 위험자산 우호적. ' +
      'JPY 강세(JPY/KRW↑) → 엔캐리 청산 → 위험자산 급락.',
    relationships: [
      'JPY 약세 → 엔캐리 활성화 → 주가↑',
      'JPY 급등 → 엔캐리 청산 → 주가 급락',
      'BOJ 정책 정상화 → JPY 강세',
    ],
    chartConfig: {
      color: '#06b6d4',
    },
  },

  {
    id: 'cnyKrw',
    label: 'CNY/KRW',
    labelKo: '위안/원',
    unit: '원',
    tab: 'fx',
    positiveIsGood: false,
    description: '위안-원 환율. 중국 경기와 수출 경쟁력 지표.',
    interpretation:
      '위안 약세(CNY/KRW↓) → 한국 수출 경쟁력↓ + 중국 경기 우려. ' +
      '중국은 한국 최대 교역국으로 위안 동향이 KOSPI에 직접 영향.',
    relationships: [
      'CNY 약세 → 한국 수출 경쟁력↓',
      'CNY 약세 + 중국 경기↓ → KOSPI↓ 이중 타격',
      'USD/CNY↑ → CNY 약세 신호',
    ],
    chartConfig: {
      color: '#ec4899',
    },
  },

  {
    id: 'dxy',
    label: 'DXY',
    labelKo: '달러인덱스',
    unit: '지수',
    tab: 'fx',
    positiveIsGood: true,
    description: '달러 강도 지수. EUR(57%), JPY(14%), GBP(12%) 등 6개 통화 대비.',
    interpretation:
      '글로벌 달러 강도의 기준. DXY↑ = 달러 강세 = 신흥국 통화 약세. ' +
      'Fed 긴축 기대 시 상승, 완화 기대 시 하락.',
    relationships: [
      'DXY↑ → USD/KRW↑ (신흥국 통화 약세)',
      'DXY↑ → 원자재 가격↓ (달러 표시)',
      'Fed 긴축 기대 → DXY↑',
    ],
    chartConfig: {
      color: '#10b981',
    },
  },

  {
    id: 'eurUsd',
    label: 'EUR/USD',
    labelKo: '유로/달러',
    unit: 'USD',
    tab: 'fx',
    positiveIsGood: true,
    description: 'DXY의 57%를 차지하는 가장 영향력 있는 환율.',
    interpretation:
      'EUR/USD↑ = 유로 강세 = DXY↓. ' +
      'ECB vs Fed 금리 차이가 핵심. ECB 긴축 시 유로 강세.',
    relationships: [
      'EUR/USD↑ → DXY↓ (역상관)',
      'ECB 긴축 > Fed 긴축 → EUR 강세',
      'EUR 강세 → 유로존 수출↓',
    ],
    chartConfig: {
      color: '#8b5cf6',
    },
  },

  {
    id: 'usdJpy',
    label: 'USD/JPY',
    labelKo: '달러/엔',
    unit: 'JPY',
    tab: 'fx',
    positiveIsGood: true,
    description: '달러당 엔화. 엔캐리 트레이드의 핵심 지표.',
    interpretation:
      'USD/JPY↑ = 엔 약세 → 엔캐리 활성화 → 글로벌 위험자산 우호적. ' +
      'BOJ 정책 정상화 시 엔 강세 → 엔캐리 청산 위험.',
    relationships: [
      'USD/JPY↑ → 엔캐리 활성화 → 주가↑',
      'USD/JPY 급락 → 엔캐리 청산 → 주가 급락',
      'BOJ YCC 폐지 → 엔 강세',
    ],
    chartConfig: {
      color: '#f97316',
    },
  },

  {
    id: 'usdCny',
    label: 'USD/CNY',
    labelKo: '달러/위안',
    unit: 'CNY',
    tab: 'fx',
    positiveIsGood: false,
    description: '달러당 위안. 중국 경기와 PBOC 정책 반영.',
    interpretation:
      'USD/CNY↑ = 위안 약세 → 중국 경기 우려 또는 자본 유출. ' +
      'PBOC가 7.0~7.3 범위로 관리. 7.3 돌파 시 위기 신호.',
    relationships: [
      'USD/CNY↑ → 중국 경기 우려 → KOSPI↓',
      'USD/CNY > 7.3 → 위안 방어 실패 신호',
      '위안 약세 → 한국 수출 경쟁력↓',
    ],
    chartConfig: {
      color: '#dc2626',
    },
  },

  // === 증시 ===
  {
    id: 'sp500',
    label: 'S&P 500 (US)',
    labelKo: 'S&P 500 (미국)',
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
    label: 'KOSPI (KR)',
    labelKo: 'KOSPI (한국)',
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
    label: 'NASDAQ (US)',
    labelKo: '나스닥 (미국)',
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
    label: 'Fed Rate (US)',
    labelKo: '연준 기준금리 (미국)',
    unit: '%',
    tab: 'bonds',
    positiveIsGood: true,
    description: 'FOMC가 결정하는 정책금리. 모든 자산 할인율의 기준.',
    interpretation: 'Fed의 의도가 직접 반영되는 유일한 금리. 다른 모든 금리의 기준점.',
    relationships: ['Fed Rate↑ → 모든 자산 할인율↑'],
    chartConfig: { color: '#06b6d4' },
  },

  // === 경제지표 ===
  {
    id: 'cpiUs',
    label: 'CPI (US)',
    labelKo: '소비자물가지수 (미국)',
    unit: '%',
    tab: 'economic',
    positiveIsGood: false,
    description: '미국 소비자물가지수 전년 대비 상승률. Fed의 가장 중요한 인플레 지표.',
    interpretation: 'Fed의 목표는 2%. 2% 초과 시 긴축, 2% 미만 시 완화 압력.',
    relationships: ['CPI↑ → Fed 긴축 기대 → 금리↑'],
    chartConfig: { color: '#ef4444' },
  },

  {
    id: 'pceUs',
    label: 'PCE (US)',
    labelKo: '개인소비지출 물가 (미국)',
    unit: '%',
    tab: 'economic',
    positiveIsGood: false,
    description: 'Fed가 공식 인플레 목표로 사용하는 지표. CPI보다 포괄적.',
    interpretation: 'Fed의 공식 목표 지표. 2% 목표.',
    relationships: ['PCE > 2% → Fed 긴축 압력'],
    chartConfig: { color: '#f97316' },
  },

  {
    id: 'corePce',
    label: 'Core PCE (US)',
    labelKo: '근원 PCE (미국)',
    unit: '%',
    tab: 'economic',
    positiveIsGood: false,
    description: 'PCE에서 식품·에너지 제외. 변동성 낮은 근원 인플레.',
    interpretation: 'Fed가 가장 중시하는 인플레 지표. 일시적 요인 제거.',
    relationships: ['Core PCE > 2% → Fed 긴축 지속'],
    chartConfig: { color: '#dc2626' },
  },

  {
    id: 'trimmedPce',
    label: 'Trimmed PCE (US)',
    labelKo: '절사평균 PCE (미국)',
    unit: '%',
    tab: 'economic',
    positiveIsGood: false,
    description: '극단값 제외한 PCE. 더 안정적인 추세 인플레 측정.',
    interpretation: '장기 인플레 추세를 보는 지표.',
    relationships: ['Trimmed PCE 상승 → 인플레 고착화 우려'],
    chartConfig: { color: '#ea580c' },
  },

  {
    id: 'ppiUs',
    label: 'PPI (US)',
    labelKo: '생산자물가지수 (미국)',
    unit: '%',
    tab: 'economic',
    positiveIsGood: false,
    description: '생산자가 받는 가격 지수. CPI보다 선행.',
    interpretation: 'PPI 상승이 CPI로 전이되는지가 핵심.',
    relationships: ['PPI↑ → CPI↑ 선행 신호'],
    chartConfig: { color: '#f59e0b' },
  },

  {
    id: 'unemployment',
    label: 'Unemployment (US)',
    labelKo: '실업률 (미국)',
    unit: '%',
    tab: 'economic',
    positiveIsGood: false,
    description: '미국 실업률. Fed의 이중 목표 중 하나.',
    interpretation: '실업률↑ → 경기 약화 → Fed 완화 압력.',
    relationships: ['실업률↑ → Fed 인하 압력'],
    chartConfig: { color: '#6366f1' },
  },

  {
    id: 'gdpUs',
    label: 'GDP (US)',
    labelKo: 'GDP 성장률 (미국)',
    unit: '%',
    tab: 'economic',
    positiveIsGood: true,
    description: '미국 실질 GDP 전년 대비 성장률. 경기 종합 지표.',
    interpretation: 'GDP 고성장 + 고인플레 → 긴축. GDP 저성장 + 저인플레 → 완화.',
    relationships: ['GDP↑ + CPI↑ → 긴축 국면'],
    chartConfig: { color: '#10b981' },
  },

  // === 한국 경제지표 (ECOS) ===
  {
    id: 'bokRate',
    label: 'BOK Rate (KR)',
    labelKo: '한국은행 기준금리 (한국)',
    unit: '%',
    tab: 'bonds',
    positiveIsGood: true,
    description: '한국은행 기준금리. 월별 금융통화위원회에서 결정.',
    interpretation: 'Fed Rate 대비 금리차가 USD/KRW 환율에 영향. 금리 인상 시 원화 강세 압력.',
    relationships: ['BOK Rate < Fed Rate → 자본 유출 압력', 'BOK Rate↑ → 원화 강세'],
    chartConfig: { color: '#8b5cf6' },
  },

  {
    id: 'kr3y',
    label: '3Y Yield (KR)',
    labelKo: '국고채 3년 (한국)',
    unit: '%',
    tab: 'bonds',
    positiveIsGood: true,
    description: '한국 국고채 3년물 수익률. 회사채 스프레드 계산의 기준금리.',
    interpretation: '미국 2Y와 유사하게 단기 정책금리 기대를 반영. 회사채 스프레드 계산에 사용.',
    relationships: ['KR 3Y ≈ BOK Rate 기대', 'KR 3Y - BOK Rate = 정책 기대 프리미엄'],
    chartConfig: { color: '#06b6d4' },
  },

  {
    id: 'kr10y',
    label: '10Y Yield (KR)',
    labelKo: '국고채 10년 (한국)',
    unit: '%',
    tab: 'bonds',
    positiveIsGood: true,
    description: '한국 국고채 10년물 수익률. 장기 성장 기대 반영.',
    interpretation: 'US 10Y와 동행하지만 한국 경기 전망과 환율 변동성에 따라 괴리 발생.',
    relationships: ['US 10Y↑ → KR 10Y↑ (글로벌 연동)', 'KR 10Y - KR 3Y = 장단기 스프레드'],
    chartConfig: { color: '#3b82f6' },
  },

  {
    id: 'krSpread3y10y',
    label: '3Y-10Y Spread (KR)',
    labelKo: '장단기 금리차 (한국)',
    unit: 'bp',
    tab: 'bonds',
    positiveIsGood: true,
    description: '한국 10년물과 3년물 국고채 수익률의 차이. 10Y - 3Y로 계산.',
    interpretation:
      '미국의 2Y-10Y Spread와 유사한 역할. 한국은 3년물이 가장 유동성이 높은 벤치마크다. ' +
      '정상 상태에서는 양수. 스프레드 축소는 경기 둔화 우려를 반영.',
    relationships: [
      'KR 3Y↑ 빠르게 → BOK 인상 기대 강해지는 중',
      'KR 10Y↑ 느리게 → 장기 성장 기대는 아직 유지',
      'Spread 축소 → 경기 둔화 또는 BOK 인하 기대',
    ],
    chartConfig: {
      color: '#8b5cf6',
      referenceLines: [0],
    },
  },

  {
    id: 'krIgSpread',
    label: 'IG Spread (KR)',
    labelKo: 'IG 스프레드 (한국)',
    unit: 'bp',
    tab: 'liquidity',
    positiveIsGood: false,
    description: '한국 회사채 AA-등급과 국고채 3년의 스프레드. (AA- - KR3Y) × 100bp.',
    interpretation: '한국 우량기업의 신용 프리미엄. 미국 IG OAS와 유사한 역할.',
    relationships: ['KR IG Spread↑ → 신용시장 긴축', 'HY OAS↑ + KR IG Spread↑ → 글로벌 Risk Off'],
    chartConfig: { color: '#f97316', referenceLines: [50, 100, 150] },
  },

  {
    id: 'krHySpread',
    label: 'HY Spread (KR)',
    labelKo: 'HY 스프레드 (한국)',
    unit: 'bp',
    tab: 'liquidity',
    positiveIsGood: false,
    description: '한국 회사채 BBB-등급과 국고채 3년의 스프레드. (BBB- - KR3Y) × 100bp.',
    interpretation: '한국 고위험 기업의 신용 프리미엄. 미국 HY OAS와 유사한 역할.',
    relationships: ['KR HY Spread↑ → 한국 신용위험 증가', '급등 시 KOSPI 압박 신호'],
    chartConfig: { color: '#f59e0b', referenceLines: [200, 400, 600] },
  },

  {
    id: 'krCorpAA',
    label: 'Corp AA- (KR)',
    labelKo: '회사채 AA- (한국)',
    unit: '%',
    tab: 'bonds',
    positiveIsGood: false,
    description: '한국 회사채 AA-등급 3년물 수익률. 우량기업 조달금리.',
    interpretation: 'AA- 회사채는 한국 우량기업의 자금조달 비용. 국고채 대비 스프레드가 신용 리스크.',
    relationships: ['AA- ↑ 급등 → 기업 자금조달 어려움', 'AA- - KR 3Y = IG Spread'],
    chartConfig: { color: '#8b5cf6' },
  },

  {
    id: 'krCorpBBB',
    label: 'Corp BBB- (KR)',
    labelKo: '회사채 BBB- (한국)',
    unit: '%',
    tab: 'bonds',
    positiveIsGood: false,
    description: '한국 회사채 BBB-등급 3년물 수익률. 고위험 기업 조달금리.',
    interpretation: 'BBB- 회사채는 한국 고위험 기업의 자금조달 비용. 급등 시 부도 위험 증가.',
    relationships: ['BBB- ↑ 급등 → 기업 부도 위험 증가', 'BBB- - KR 3Y = HY Spread'],
    chartConfig: { color: '#f59e0b' },
  },

  {
    id: 'cpiKr',
    label: 'CPI (KR)',
    labelKo: '소비자물가지수 (한국)',
    unit: '% YoY',
    tab: 'economic',
    positiveIsGood: false,
    description: '한국 소비자물가지수 전년 대비 상승률. 한국은행 기준금리 결정의 핵심 지표.',
    interpretation: 'CPI 2% 초과 지속 시 BOK 긴축 압력. 1% 이하 시 완화 압력.',
    relationships: ['CPI KR↑ → BOK Rate↑ 압력', 'CPI US↑ → CPI KR↑ (수입 물가 전이)'],
    chartConfig: { color: '#ef4444', referenceLines: [2] },
  },

  {
    id: 'unemploymentKr',
    label: 'Unemployment (KR)',
    labelKo: '실업률 (한국)',
    unit: '%',
    tab: 'economic',
    positiveIsGood: false,
    description: '한국 실업률. 경기 후행지표.',
    interpretation: '3% 이하 양호, 4% 이상 경기 둔화 신호. 미국과 달리 변동성이 작음.',
    relationships: ['실업률↑ → BOK 완화 압력', 'GDP↓ → 실업률↑ (후행)'],
    chartConfig: { color: '#6366f1', referenceLines: [3, 4] },
  },

  {
    id: 'gdpKr',
    label: 'GDP Growth (KR)',
    labelKo: 'GDP 성장률 (한국)',
    unit: '% QoQ',
    tab: 'economic',
    positiveIsGood: true,
    description: '한국 실질 GDP 성장률 (전분기 대비). 분기별 발표.',
    interpretation: '2% 이상 양호, 0~1% 성장 둔화, 음수 기술적 침체. 수출 의존 경제로 글로벌 경기에 민감.',
    relationships: ['GDP↑ → BOK 인상 압력', '수출↓ → GDP↓', '중국 경기↓ → 한국 GDP↓'],
    chartConfig: { color: '#10b981', referenceLines: [0, 2], negativeZoneColor: 'rgba(239, 68, 68, 0.15)' },
  },

  {
    id: 'ppiKr',
    label: 'PPI (KR)',
    labelKo: '생산자물가지수 (한국)',
    unit: '% YoY',
    tab: 'economic',
    positiveIsGood: true,
    description: '한국 생산자물가지수 (전년 동월 대비). 월별 발표.',
    interpretation: 'CPI 선행지표. PPI 상승 → 수개월 후 CPI 상승 압력. 원자재·에너지 가격에 민감.',
    relationships: ['PPI↑ → CPI↑ (선행)', '원유↑ → PPI↑', 'PPI급등 → BOK 인상 압력'],
    chartConfig: { color: '#f59e0b', referenceLines: [0, 2] },
  },

  {
    id: 'industrialKr',
    label: 'Industrial Production (KR)',
    labelKo: '산업생산지수 (한국)',
    unit: '지수',
    tab: 'economic',
    positiveIsGood: true,
    description: '한국 산업생산지수 (계절조정, 2015=100). 월별 발표.',
    interpretation: '제조업 중심 경제의 핵심 지표. 전월 대비 증가 → 경기 확장, 감소 → 경기 둔화.',
    relationships: ['산업생산↑ → GDP↑ (선행)', '수출↓ → 산업생산↓', '반도체 사이클과 강한 상관'],
    chartConfig: { color: '#06b6d4', referenceLines: [] },
  },

  {
    id: 'krFxReserves',
    label: 'FX Reserves (KR)',
    labelKo: '외환보유액 (한국)',
    unit: '억달러',
    tab: 'liquidity',
    positiveIsGood: true,
    description: '한국은행이 보유한 외환보유액. 월별 발표.',
    interpretation: '외환위기 대응 능력의 지표. 감소 추세는 외환 유출 또는 환율 방어 개입 신호.',
    relationships: ['외환보유액↓ 급락 → 환율 방어 개입 중', 'USD/KRW↑ + 외환보유액↓ → 외환 위기 신호'],
    chartConfig: { color: '#10b981', referenceLines: [4000] },
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
