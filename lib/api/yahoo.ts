/**
 * Yahoo Finance API 어댑터
 *
 * 비공식 API를 사용하여 실시간 시장 데이터 조회
 * CORS 방지를 위해 Next.js API Route를 통해 호출
 */

export interface YahooQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
  previousTimestamp?: number; // 비교 기준 시점 (Unix timestamp, seconds)
}

export interface YahooTimeSeries {
  timestamp: number; // Unix timestamp in seconds (일관성 유지)
  value: number;
}

/**
 * Yahoo Finance 심볼 매핑
 *
 * 주의: S&P 500, NASDAQ, WTI, DXY는 FRED API로 이동됨
 * Yahoo는 FRED에 없는 지표만 사용
 */
export const yahooSymbolMap: Record<string, string> = {
  // 증시 (한국 지수만 - 미국 지수는 FRED)
  kospi: '^KS11',
  kosdaq: '^KQ11',

  // 원자재 (Gold, Silver만 - WTI는 FRED)
  gold: 'GC=F',
  silver: 'SI=F',

  // 환율 (FRED 환율 시리즈는 업데이트가 느리므로 Yahoo 사용)
  usdKrw: 'KRW=X',
  usdJpy: 'JPY=X',
  eurUsd: 'EURUSD=X',
  usdCny: 'CNY=X',
};

/**
 * Yahoo Finance에서 현재 시세 조회
 */
export async function fetchYahooQuote(metricId: string): Promise<YahooQuote | null> {
  const symbol = yahooSymbolMap[metricId];

  if (!symbol) {
    console.warn(`[Yahoo API] No symbol mapping for ${metricId}`);
    return null;
  }

  try {
    // Next.js API Route를 통해 호출 (CORS 우회)
    // 5d로 요청하여 이전 거래일 데이터 확보 (주말/공휴일 고려)
    const response = await fetch(`/api/yahoo?symbol=${symbol}&range=5d`);

    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('Invalid Yahoo API response');
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const quote = result.indicators?.quote?.[0];

    if (!meta || !quote) {
      throw new Error('Missing quote data');
    }

    // 종가 기준으로만 계산 (실시간 데이터 제외)
    // 메인 화면: 전날 종가 vs 그저께 종가
    // 모달: 실시간 현재가는 별도 표시
    const timestamps = result.timestamp || [];
    const closes = quote.close || [];

    // 유효한 종가 데이터만 필터링 (null 제거)
    const validData: Array<{timestamp: number, close: number}> = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closes[i] !== null && !isNaN(closes[i])) {
        validData.push({
          timestamp: timestamps[i],
          close: closes[i]
        });
      }
    }

    // 최소 2개의 데이터 포인트 필요
    if (validData.length < 2) {
      throw new Error('Insufficient data points');
    }

    // 종가 기준: 마지막 2개 종가로 계산
    // [0, 1, 2, 3, 4] -> current=4, previous=3
    const currentPoint = validData[validData.length - 1];  // 전날 종가
    const previousPoint = validData[validData.length - 2]; // 그저께 종가

    const currentPrice = currentPoint.close;
    const previousClose = previousPoint.close;
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;
    const previousTimestamp = previousPoint.timestamp;

    // Yahoo Finance API는 Unix timestamp를 초 단위로 반환
    // 따라서 일관성을 위해 초 단위로 반환
    return {
      symbol,
      price: currentPrice,
      change,
      changePercent,
      timestamp: currentPoint.timestamp, // Yahoo API의 실제 데이터 시점 (초 단위)
      previousTimestamp,
    };
  } catch (error) {
    console.error(`[Yahoo API] Failed to fetch ${symbol}:`, error);
    return null;
  }
}

/**
 * Yahoo Finance에서 시계열 데이터 조회
 */
export async function fetchYahooTimeSeries(
  metricId: string,
  range: '1mo' | '3mo' | '6mo' | '1y' | '3y' | '5y' | 'max' = '3mo'
): Promise<YahooTimeSeries[] | null> {
  const symbol = yahooSymbolMap[metricId];

  if (!symbol) {
    console.warn(`[Yahoo API] No symbol mapping for ${metricId}`);
    return null;
  }

  try {
    // Yahoo API의 range 매핑
    // 'max'를 사용하면 가능한 모든 과거 데이터를 받을 수 있음
    let apiRange: string;
    switch (range) {
      case '1mo':
        apiRange = '1mo';
        break;
      case '3mo':
        apiRange = '3mo';
        break;
      case '6mo':
        apiRange = '1y'; // 6mo는 데이터가 부족할 수 있어서 1y 요청
        break;
      case '1y':
        apiRange = '2y'; // 1y는 2y 요청해서 충분한 데이터 확보
        break;
      case '3y':
        apiRange = '5y'; // 3y는 5y 요청해서 충분한 데이터 확보
        break;
      case '5y':
        apiRange = '10y'; // 5y는 10y 요청해서 충분한 데이터 확보
        break;
      case 'max':
        apiRange = 'max'; // Yahoo API는 max 지원
        break;
      default:
        apiRange = range;
    }

    const response = await fetch(`/api/yahoo?symbol=${symbol}&range=${apiRange}`);

    if (!response.ok) {
      throw new Error(`Yahoo API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.chart || !data.chart.result || data.chart.result.length === 0) {
      throw new Error('Invalid Yahoo API response');
    }

    const result = data.chart.result[0];
    const meta = result.meta;
    const timestamps = result.timestamp || [];
    const closes = result.indicators?.quote?.[0]?.close || [];

    // timestamp와 close를 매핑
    // Yahoo API는 Unix timestamp를 초 단위로 반환하므로 그대로 유지
    const timeSeries: YahooTimeSeries[] = timestamps
      .map((timestamp: number, index: number) => ({
        timestamp: timestamp, // 초 단위 그대로 유지 (일관성)
        value: closes[index],
      }))
      .filter((item: YahooTimeSeries) => item.value !== null && !isNaN(item.value));

    // 실시간 현재가를 새 포인트로 추가 (마지막 값 교체 대신)
    if (meta.regularMarketPrice && meta.regularMarketTime) {
      const latestTimestamp = meta.regularMarketTime; // 초 단위 그대로 유지
      // 이미 같은 시간대 데이터가 있으면 교체, 없으면 추가
      const lastIndex = timeSeries.length - 1;
      if (lastIndex >= 0 && timeSeries[lastIndex].timestamp === latestTimestamp) {
        timeSeries[lastIndex].value = meta.regularMarketPrice;
      } else {
        // 새 포인트 추가
        timeSeries.push({
          timestamp: latestTimestamp,
          value: meta.regularMarketPrice,
        });
      }
    }

    return timeSeries;
  } catch (error) {
    console.error(`[Yahoo API] Failed to fetch time series for ${symbol}:`, error);
    return null;
  }
}
