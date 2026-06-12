/**
 * Yahoo Finance API Proxy
 *
 * CORS 우회를 위한 Next.js API Route
 * 클라이언트에서 직접 Yahoo Finance를 호출하면 CORS 에러 발생
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const range = searchParams.get('range') || '3mo';

  // range에 따라 최적의 interval 자동 설정
  let interval = searchParams.get('interval');
  if (!interval) {
    if (range === '1mo') interval = '1d';
    else if (range === '3mo') interval = '1d';
    else if (range === '6mo') interval = '1d';
    else if (range === '1y') interval = '1d';
    else if (range === '2y') interval = '1d';
    else if (range === '3y') interval = '1d';
    else if (range === '5y') interval = '1wk';
    else if (range === '10y') interval = '1wk';
    else if (range === 'max') interval = '1wk';
    else interval = '1d';
  }

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    );
  }

  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?range=${range}&interval=${interval}`;

    const response = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API returned ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Yahoo API Route] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Yahoo Finance' },
      { status: 500 }
    );
  }
}
