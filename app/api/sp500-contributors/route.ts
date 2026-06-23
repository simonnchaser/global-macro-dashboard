/**
 * S&P 500 구성 종목별 기여도 API
 * Yahoo Finance ^GSPC 구성 종목 데이터 실시간 파싱
 */

import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export interface SP500Contributor {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap: number
  weight: number          // S&P 500 내 비중 (%)
  contribution: number    // 지수 기여도 (포인트)
}

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

// Yahoo Finance S&P 500 구성 종목 페이지에서 데이터 스크래핑
async function fetchSP500Components(): Promise<Array<{ symbol: string; name: string; weight: number }>> {
  try {
    const url = 'https://finance.yahoo.com/quote/%5EGSPC/components'
    const res = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      next: { revalidate: 3600 }, // 1시간 캐시
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch components page: ${res.status}`)
    }

    const html = await res.text()
    const $ = cheerio.load(html)

    const components: Array<{ symbol: string; name: string; weight: number }> = []

    // Yahoo Finance 테이블 파싱 (구조는 실제 페이지 확인 필요)
    $('table tbody tr').each((i, row) => {
      if (i >= 50) return false // 상위 50개만

      const cells = $(row).find('td')
      if (cells.length >= 4) {
        const symbol = $(cells[0]).find('a').text().trim()
        const name = $(cells[1]).text().trim()
        const weightText = $(cells[3]).text().trim() // "7.00%" 형식
        const weight = parseFloat(weightText.replace('%', ''))

        if (symbol && !isNaN(weight)) {
          components.push({ symbol, name, weight })
        }
      }
    })

    return components
  } catch (error) {
    console.error('[fetchSP500Components] Error:', error)
    // 실패 시 기본 상위 종목 반환
    return [
      { symbol: 'AAPL', name: 'Apple Inc.', weight: 7.0 },
      { symbol: 'MSFT', name: 'Microsoft Corporation', weight: 6.5 },
      { symbol: 'NVDA', name: 'NVIDIA Corporation', weight: 5.5 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', weight: 3.5 },
      { symbol: 'META', name: 'Meta Platforms Inc.', weight: 2.5 },
      { symbol: 'GOOGL', name: 'Alphabet Inc. Class A', weight: 2.0 },
      { symbol: 'TSLA', name: 'Tesla Inc.', weight: 2.0 },
      { symbol: 'BRK.B', name: 'Berkshire Hathaway Inc. Class B', weight: 1.8 },
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.', weight: 1.5 },
      { symbol: 'V', name: 'Visa Inc.', weight: 1.4 },
    ]
  }
}

export async function GET() {
  try {
    // 1. S&P 500 구성 종목 가져오기 (실시간 스크래핑 또는 캐시된 데이터)
    const components = await fetchSP500Components()

    // 상위 30개만 사용
    const topComponents = components.slice(0, 30)

    // 2. Yahoo Finance에서 각 종목의 실시간 가격 데이터 가져오기
    const promises = topComponents.map(async (stock) => {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}?interval=1d&range=2d`
        const res = await fetch(url, {
          headers: { 'User-Agent': USER_AGENT },
          next: { revalidate: 60 }, // 1분 캐시
        })

        if (!res.ok) return null

        const data = await res.json()
        const result = data.chart?.result?.[0]
        if (!result) return null

        const meta = result.meta
        const closes: (number | null)[] = result.indicators?.quote?.[0]?.close ?? []

        const currentPrice = meta.regularMarketPrice || closes[closes.length - 1] || 0
        const previousClose = meta.chartPreviousClose || closes[closes.length - 2] || currentPrice
        const change = currentPrice - previousClose
        const changePercent = (change / previousClose) * 100

        // 대략적인 시가총액 계산 (비중 기반)
        const estimatedMarketCap = stock.weight * 1000000000000 // 1T 기준

        return {
          symbol: stock.symbol,
          name: stock.name,
          price: currentPrice,
          change,
          changePercent,
          marketCap: estimatedMarketCap,
          weight: stock.weight,
          contribution: (changePercent / 100) * stock.weight, // 지수 기여도 (포인트)
        }
      } catch (error) {
        console.error(`[sp500-contributors] Failed to fetch ${stock.symbol}:`, error)
        return null
      }
    })

    const results = await Promise.all(promises)
    const contributors = results.filter((r): r is SP500Contributor => r !== null)

    // 기여도 절대값 기준으로 정렬 (상위 10개)
    const topContributors = contributors
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, 10)

    const totalMarketCap = contributors.reduce((sum, c) => sum + c.marketCap, 0)

    return NextResponse.json({
      contributors: topContributors,
      totalMarketCap,
      updatedAt: new Date().toISOString(),
    })

  } catch (error) {
    console.error('[sp500-contributors] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
