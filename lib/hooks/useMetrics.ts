'use client'

import { useState, useEffect } from 'react'
import type { FredMetricId, MetricSnapshot, TimeSeriesPoint, FredApiResponse, EcosMetricId, EcosMetricSnapshot, EcosApiResponse } from '@/lib/types/metrics'
import { mockSnapshots, mockEcosSnapshots } from '@/lib/mock/mockData'
import { ECOS_CALCULATED } from '@/lib/api/ecos'

// 지표 ID가 ECOS인지 판단
function isEcosMetric(id: string): id is EcosMetricId {
  const ecosMetrics: EcosMetricId[] = [
    'bokRate', 'kr3y', 'kr10y', 'cpiKr', 'unemploymentKr',
    'krCorpAA', 'krCorpBBB', 'krFxReserves', 'krIgSpread', 'krHySpread'
  ]
  return ecosMetrics.includes(id as EcosMetricId)
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
    updatedAt:     latest.time,
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
        const apiEndpoint = isEcosMetric(id) ? 'ecos' : 'fred'
        const res = await fetch(`/api/${apiEndpoint}?metricId=${id}&period=${period}`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)

        const data: FredApiResponse | EcosApiResponse = await res.json()

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
        const mockData = isEcosMetric(id) ? mockEcosSnapshots[id as EcosMetricId] : mockSnapshots[id as FredMetricId]
        setSnapshot(mockData)
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
): { timeSeries: TimeSeriesPoint[]; isLoading: boolean; error: string | null } {
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const apiEndpoint = isEcosMetric(id) ? 'ecos' : 'fred'
        const res = await fetch(`/api/${apiEndpoint}?metricId=${id}&period=${period}`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)

        const data: FredApiResponse | EcosApiResponse = await res.json()

        if (!mounted) return

        if (data.timeSeries.length === 0) {
          throw new Error('No data available')
        }

        setTimeSeries(data.timeSeries)
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

  return { timeSeries, isLoading, error }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useMetricCurrentValue(metricId: any) {
  const { snapshot } = useMetricSnapshot(metricId as FredMetricId, '3M')
  return snapshot ? { value: snapshot.value, change: snapshot.change, updatedAt: snapshot.updatedAt } : null
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
            const apiEndpoint = isEcosMetric(id) ? 'ecos' : 'fred'
            const res = await fetch(`/api/${apiEndpoint}?metricId=${id}&period=3M`)

            if (!res.ok) throw new Error(`API error: ${res.status}`)

            const data: FredApiResponse | EcosApiResponse = await res.json()

            if (data.timeSeries.length > 0) {
              const snap = buildSnapshot(id, data.timeSeries)
              result[id] = { value: snap.value, change: snap.change }
            }
          } catch (err) {
            console.warn(`[useMetricsCurrentValues] Failed to fetch ${id}, using mockData:`, err)

            // Fallback to mock data
            const mockData = isEcosMetric(id)
              ? mockEcosSnapshots[id as EcosMetricId]
              : mockSnapshots[id as FredMetricId]

            if (mockData) {
              result[id] = { value: mockData.value, change: mockData.change }
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
