'use client'

import { useState, useEffect } from 'react'
import type { FredMetricId, MetricSnapshot, TimeSeriesPoint, FredApiResponse, EcosMetricId, EcosMetricSnapshot, EcosApiResponse, YahooMetricId, YahooApiResponse } from '@/lib/types/metrics'
import { mockSnapshots, mockEcosSnapshots, mockYahooSnapshots } from '@/lib/mock/mockData'
import { ECOS_CALCULATED } from '@/lib/api/ecos'

// 지표 ID가 ECOS인지 판단
function isEcosMetric(id: string): id is EcosMetricId {
  const ecosMetrics: EcosMetricId[] = [
    'bokRate', 'kr3y', 'kr10y', 'cpiKr', 'unemploymentKr',
    'krCorpAA', 'krCorpBBB', 'krFxReserves',
    'gdpKr', 'ppiKr', 'industrialKr',
    // 원화 환율은 Yahoo로 이전 (usdKrw, eurKrw, jpyKrw, cnyKrw 제거)
    'krSpread3y10y', 'krIgSpread', 'krHySpread'
  ]
  return ecosMetrics.includes(id as EcosMetricId)
}

// 지표 ID가 Yahoo Finance인지 판단
function isYahooMetric(id: string): id is YahooMetricId {
  const yahooMetrics: YahooMetricId[] = [
    // 증시
    'sp500', 'nasdaq', 'kospi', 'kosdaq', 'sse',
    // 국제 환율
    'dxy', 'eurUsd', 'usdJpy', 'usdCny',
    // 원화 환율 (ECOS에서 이전)
    'usdKrw', 'eurKrw', 'jpyKrw', 'cnyKrw',
    // 원자재
    'gold', 'silver', 'wti', 'brent', 'natgas', 'copper'
  ]
  return yahooMetrics.includes(id as YahooMetricId)
}

function buildSnapshot(
  id: FredMetricId,
  timeSeries: TimeSeriesPoint[]
): MetricSnapshot {
  const latest = timeSeries[timeSeries.length - 1]
  const prev   = timeSeries[timeSeries.length - 2]

  const change        = prev ? latest.value - prev.value : 0
  const changePercent = prev ? (change / prev.value) * 100 : 0

  return {
    id,
    value:         latest.value,
    change:        Math.round(change * 1000) / 1000,
    changePercent: Math.round(changePercent * 100) / 100,
    updatedAt:     (typeof latest.time === 'string' ? latest.time : new Date(latest.time * 1000).toISOString()),
  }
}

export function useMetricSnapshot(
  id: FredMetricId | EcosMetricId | any,
  period: string = '3M'
): { snapshot: MetricSnapshot | EcosMetricSnapshot | null; isLoading: boolean; error: string | null } {
  const [snapshot, setSnapshot] = useState<MetricSnapshot | EcosMetricSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        // API endpoint 결정
        const apiEndpoint = isYahooMetric(id) ? 'yahoo' : isEcosMetric(id) ? 'ecos' : 'fred'
        const res = await fetch(`/api/${apiEndpoint}?metricId=${id}&period=${period}`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)

        const data: FredApiResponse | EcosApiResponse | YahooApiResponse = await res.json()

        if (!mounted) return

        if (data.timeSeries.length === 0) {
          throw new Error('No data available')
        }

        const snap = buildSnapshot(id, data.timeSeries)
        setSnapshot(snap)
      } catch (err) {
        console.warn(`[useMetricSnapshot] Failed to fetch ${id}, using mockData:`, err)

        if (!mounted) return

        // Fallback to appropriate mock data
        const mockData = isYahooMetric(id)
          ? mockYahooSnapshots[id as YahooMetricId]
          : isEcosMetric(id)
          ? mockEcosSnapshots[id as EcosMetricId]
          : mockSnapshots[id as FredMetricId]
        if (mockData) setSnapshot(mockData)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [id, period])

  return { snapshot, isLoading, error }
}

export function useMetricTimeSeries(
  id: FredMetricId | EcosMetricId | any,
  period: string = '3M'
): { timeSeries: TimeSeriesPoint[]; timezone?: string; isLoading: boolean; error: string | null } {
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([])
  const [timezone, setTimezone] = useState<string | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const apiEndpoint = isYahooMetric(id) ? 'yahoo' : isEcosMetric(id) ? 'ecos' : 'fred'
        const res = await fetch(`/api/${apiEndpoint}?metricId=${id}&period=${period}`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)

        const data: FredApiResponse | EcosApiResponse | YahooApiResponse = await res.json()

        if (!mounted) return

        if (data.timeSeries.length === 0) {
          throw new Error('No data available')
        }

        setTimeSeries(data.timeSeries)

        // Yahoo API 응답인 경우 timezone 정보 저장
        if ('timezone' in data) {
          setTimezone((data as YahooApiResponse).timezone)
        }
      } catch (err) {
        console.warn(`[useMetricTimeSeries] Failed to fetch ${id}:`, err)

        if (!mounted) return

        setTimeSeries([])
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      mounted = false
    }
  }, [id, period])

  return { timeSeries, timezone, isLoading, error }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMetricCurrentValue(metricId: any) {
  const [timezone, setTimezone] = useState<string | undefined>(undefined)
  const [yahooData, setYahooData] = useState<{ value: number; change: number; changePercent: number; updatedAt: string } | null>(null)

  // 분기별/연간 데이터는 더 긴 기간 사용
  const quarterlyMetrics = ['gdpUs', 'gdpKr'];
  const period = quarterlyMetrics.includes(metricId) ? '1Y' : '3M';

  const { snapshot } = useMetricSnapshot(metricId as FredMetricId, period)

  // Yahoo 지표인 경우 실시간 데이터 가져오기
  useEffect(() => {
    if (!isYahooMetric(metricId)) return

    fetch(`/api/yahoo?metricId=${metricId}&period=1D`)
      .then(res => res.json())
      .then((data: YahooApiResponse) => {
        if (data.timezone) {
          setTimezone(data.timezone)
        }
        // Yahoo는 previousClose 대비 변화량 계산
        if (data.realtime && data.previousClose) {
          const currentPrice = data.realtime.price
          const change = currentPrice - data.previousClose
          const changePercent = (change / data.previousClose) * 100
          setYahooData({
            value: currentPrice,
            change: Math.round(change * 10000) / 10000,  // 소수점 4자리까지 (환율 대응)
            changePercent: Math.round(changePercent * 100) / 100,
            updatedAt: data.realtime.time ? new Date(data.realtime.time * 1000).toISOString() : data.latestDate
          })
        }
      })
      .catch(() => {
        // 에러 시 기본 snapshot 사용
      })
  }, [metricId])

  // Yahoo 지표는 실시간 데이터 우선, 아니면 snapshot
  if (isYahooMetric(metricId) && yahooData) {
    return { ...yahooData, timezone }
  }

  return snapshot ? { value: snapshot.value, change: snapshot.change, changePercent: snapshot.changePercent, updatedAt: snapshot.updatedAt, timezone } : null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMetricsCurrentValues(metricIds: any[]) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [values, setValues] = useState<Record<string, any>>({})

  useEffect(() => {
    let mounted = true

    async function fetchAllMetrics() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: Record<string, any> = {}

      await Promise.all(
        metricIds.map(async (id) => {
          try {
            const apiEndpoint = isYahooMetric(id) ? 'yahoo' : isEcosMetric(id) ? 'ecos' : 'fred'
            const res = await fetch(`/api/${apiEndpoint}?metricId=${id}&period=3M`)

            if (!res.ok) throw new Error(`API error: ${res.status}`)

            const data: FredApiResponse | EcosApiResponse | YahooApiResponse = await res.json()

            if (data.timeSeries.length > 0) {
              const snap = buildSnapshot(id, data.timeSeries)
              result[id] = { value: snap.value, change: snap.change, changePercent: snap.changePercent }
            }
          } catch (err) {
            console.warn(`[useMetricsCurrentValues] Failed to fetch ${id}, using mockData:`, err)

            // Fallback to mock data
            const mockData = isYahooMetric(id)
              ? mockYahooSnapshots[id as YahooMetricId]
              : isEcosMetric(id)
              ? mockEcosSnapshots[id as EcosMetricId]
              : mockSnapshots[id as FredMetricId]

            if (mockData) {
              result[id] = { value: mockData.value, change: mockData.change, changePercent: mockData.changePercent }
            }
          }
        })
      )

      if (mounted) {
        setValues(result)
      }
    }

    if (metricIds.length > 0) {
      fetchAllMetrics()
    }

    return () => {
      mounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metricIds.join(',')])

  return values
}
