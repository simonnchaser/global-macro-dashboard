import { NextRequest, NextResponse } from 'next/server'
import {
  FRED_SERIES,
  FRED_PC1_UNITS,
  convertFredValue,
} from '@/lib/api/fred'
import { getObservationStart } from '@/lib/utils/dateUtils'
import type { FredMetricId, TimeSeriesPoint, FredApiResponse } from '@/lib/types/metrics'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const metricId = searchParams.get('metricId') as FredMetricId
  const period   = searchParams.get('period') || '3M'

  // Handle calculated metrics
  if (metricId === 'spread2y10y') {
    return handleSpreadCalculation(period)
  }
  if (metricId === 'netLiquidity') {
    return handleNetLiquidityCalculation(period)
  }

  const seriesId = FRED_SERIES[metricId]
  if (!seriesId) {
    return NextResponse.json({ error: `Unknown metricId: ${metricId}` }, { status: 400 })
  }

  const apiKey = process.env.FRED_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'FRED_API_KEY not set' }, { status: 500 })
  }

  const params = new URLSearchParams({
    series_id:         seriesId,
    api_key:           apiKey,
    file_type:         'json',
    sort_order:        'asc',
    observation_start: getObservationStart(period),
    units:             FRED_PC1_UNITS.has(metricId) ? 'pc1' : 'lin',
  })

  try {
    const res = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?${params}`,
      { next: { revalidate: getCacheTime(metricId) } }
    )
    if (!res.ok) throw new Error(`FRED ${res.status}`)

    const data = await res.json()

    const timeSeries: TimeSeriesPoint[] = data.observations
      .filter((o: { date: string; value: string }) => o.value !== '.')
      .map((o: { date: string; value: string }) => ({
        time:  o.date,
        value: convertFredValue(metricId, parseFloat(o.value)),
      }))

    const latest = timeSeries[timeSeries.length - 1]

    const response: FredApiResponse = {
      metricId,
      timeSeries,
      latestValue: latest?.value ?? 0,
      latestDate:  latest?.time  ?? '',
    }

    return NextResponse.json(response)

  } catch (err) {
    console.error(`FRED fetch error [${metricId}]:`, err)
    return NextResponse.json({ error: 'FRED fetch failed' }, { status: 500 })
  }
}

async function handleSpreadCalculation(period: string) {
  const apiKey = process.env.FRED_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'FRED_API_KEY not set' }, { status: 500 })
  }

  try {
    // Fetch both us10y and us2y
    const observationStart = getObservationStart(period)

    const params10y = new URLSearchParams({
      series_id: 'DGS10',
      api_key: apiKey,
      file_type: 'json',
      sort_order: 'asc',
      observation_start: observationStart,
      units: 'lin',
    })

    const params2y = new URLSearchParams({
      series_id: 'DGS2',
      api_key: apiKey,
      file_type: 'json',
      sort_order: 'asc',
      observation_start: observationStart,
      units: 'lin',
    })

    const [res10y, res2y] = await Promise.all([
      fetch(`https://api.stlouisfed.org/fred/series/observations?${params10y}`, { next: { revalidate: 3600 } }),
      fetch(`https://api.stlouisfed.org/fred/series/observations?${params2y}`, { next: { revalidate: 3600 } })
    ])

    if (!res10y.ok || !res2y.ok) throw new Error('FRED fetch failed')

    const [data10y, data2y] = await Promise.all([res10y.json(), res2y.json()])

    // Create map for us2y values by date
    const us2yMap = new Map<string, number>()
    data2y.observations
      .filter((o: { date: string; value: string }) => o.value !== '.')
      .forEach((o: { date: string; value: string }) => {
        us2yMap.set(o.date, parseFloat(o.value))
      })

    // Calculate spread for each date
    const timeSeries: TimeSeriesPoint[] = data10y.observations
      .filter((o: { date: string; value: string }) => o.value !== '.')
      .filter((o: { date: string; value: string }) => us2yMap.has(o.date))
      .map((o: { date: string; value: string }) => {
        const us10yValue = parseFloat(o.value)
        const us2yValue = us2yMap.get(o.date)!
        return {
          time: o.date,
          value: (us10yValue - us2yValue) * 100  // Convert to bp
        }
      })

    const latest = timeSeries[timeSeries.length - 1]

    const response: FredApiResponse = {
      metricId: 'spread2y10y',
      timeSeries,
      latestValue: latest?.value ?? 0,
      latestDate: latest?.time ?? '',
    }

    return NextResponse.json(response)

  } catch (err) {
    console.error('FRED spread calculation error:', err)
    return NextResponse.json({ error: 'Spread calculation failed' }, { status: 500 })
  }
}

async function handleNetLiquidityCalculation(period: string) {
  const apiKey = process.env.FRED_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'FRED_API_KEY not set' }, { status: 500 })
  }

  try {
    const observationStart = getObservationStart(period)

    // Fetch fedAssets, tga, rrp in parallel
    const paramsFedAssets = new URLSearchParams({
      series_id: 'WALCL',
      api_key: apiKey,
      file_type: 'json',
      sort_order: 'asc',
      observation_start: observationStart,
      units: 'lin',
    })

    const paramsTga = new URLSearchParams({
      series_id: 'WTREGEN',
      api_key: apiKey,
      file_type: 'json',
      sort_order: 'asc',
      observation_start: observationStart,
      units: 'lin',
    })

    const paramsRrp = new URLSearchParams({
      series_id: 'WLRRAL',
      api_key: apiKey,
      file_type: 'json',
      sort_order: 'asc',
      observation_start: observationStart,
      units: 'lin',
    })

    const [resFedAssets, resTga, resRrp] = await Promise.all([
      fetch(`https://api.stlouisfed.org/fred/series/observations?${paramsFedAssets}`, { next: { revalidate: 43200 } }),
      fetch(`https://api.stlouisfed.org/fred/series/observations?${paramsTga}`, { next: { revalidate: 43200 } }),
      fetch(`https://api.stlouisfed.org/fred/series/observations?${paramsRrp}`, { next: { revalidate: 43200 } })
    ])

    if (!resFedAssets.ok || !resTga.ok || !resRrp.ok) {
      throw new Error('FRED fetch failed')
    }

    const [dataFedAssets, dataTga, dataRrp] = await Promise.all([
      resFedAssets.json(),
      resTga.json(),
      resRrp.json()
    ])

    // Create maps for TGA and RRP values by date
    const tgaMap = new Map<string, number>()
    dataTga.observations
      .filter((o: { date: string; value: string }) => o.value !== '.')
      .forEach((o: { date: string; value: string }) => {
        const tgaInTrillions = parseFloat(o.value) / 100 / 10000  // Millions → 억달러 → 조달러
        tgaMap.set(o.date, tgaInTrillions)
      })

    const rrpMap = new Map<string, number>()
    dataRrp.observations
      .filter((o: { date: string; value: string }) => o.value !== '.')
      .forEach((o: { date: string; value: string }) => {
        const rrpInTrillions = parseFloat(o.value) / 100 / 10000  // Millions → 억달러 → 조달러
        rrpMap.set(o.date, rrpInTrillions)
      })

    // Calculate Net Liquidity for each date where all three metrics exist
    const timeSeries: TimeSeriesPoint[] = dataFedAssets.observations
      .filter((o: { date: string; value: string }) => o.value !== '.')
      .filter((o: { date: string; value: string }) => tgaMap.has(o.date) && rrpMap.has(o.date))
      .map((o: { date: string; value: string }) => {
        const fedAssetsInTrillions = parseFloat(o.value) / 1_000_000  // Millions → Trillions
        const tgaInTrillions = tgaMap.get(o.date)!
        const rrpInTrillions = rrpMap.get(o.date)!

        return {
          time: o.date,
          value: fedAssetsInTrillions - tgaInTrillions - rrpInTrillions
        }
      })

    const latest = timeSeries[timeSeries.length - 1]

    const response: FredApiResponse = {
      metricId: 'netLiquidity',
      timeSeries,
      latestValue: latest?.value ?? 0,
      latestDate: latest?.time ?? '',
    }

    return NextResponse.json(response)

  } catch (err) {
    console.error('FRED net liquidity calculation error:', err)
    return NextResponse.json({ error: 'Net liquidity calculation failed' }, { status: 500 })
  }
}

function getCacheTime(id: FredMetricId): number {
  const weekly  = new Set<FredMetricId>(['fedAssets', 'tga', 'rrp'])
  const monthly = new Set<FredMetricId>(['fedRate', 'cpiUs', 'pceUs', 'corePce', 'trimmedPce', 'ppiUs', 'unemployment'])
  const quarterly = new Set<FredMetricId>(['gdpUs'])

  if (weekly.has(id))    return 43200
  if (monthly.has(id))   return 86400
  if (quarterly.has(id)) return 86400
  return 3600
}
