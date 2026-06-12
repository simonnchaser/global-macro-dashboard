'use client'

import { useState, useEffect } from 'react'
import type { FredMetricId, MetricSnapshot, TimeSeriesPoint, FredApiResponse } from '@/lib/types/metrics'
import { mockSnapshots } from '@/lib/mock/mockData'

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
  id: FredMetricId,
  period: string = '3M'
): { snapshot: MetricSnapshot | null; isLoading: boolean; error: string | null } {
  const [snapshot, setSnapshot] = useState<MetricSnapshot | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/fred?metricId=${id}&period=${period}`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)

        const data: FredApiResponse = await res.json()

        if (!mounted) return

        if (data.timeSeries.length === 0) {
          throw new Error('No data available')
        }

        const snap = buildSnapshot(id, data.timeSeries)
        setSnapshot(snap)
      } catch (err) {
        console.warn(`[useMetricSnapshot] Failed to fetch ${id}, using mockData:`, err)

        if (!mounted) return

        setSnapshot(mockSnapshots[id])
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
  id: FredMetricId,
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
        const res = await fetch(`/api/fred?metricId=${id}&period=${period}`)
        if (!res.ok) throw new Error(`API error: ${res.status}`)

        const data: FredApiResponse = await res.json()

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
  const result: Record<string, any> = {}
  metricIds.forEach((id) => {
    if (mockSnapshots[id as FredMetricId]) {
      const snap = mockSnapshots[id as FredMetricId]
      result[id] = { value: snap.value, change: snap.change }
    }
  })
  return result
}
