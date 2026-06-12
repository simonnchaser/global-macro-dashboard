export function getObservationStart(period: string): string {
  if (period === 'MAX') return '1900-01-01'

  const months: Record<string, number> = {
    '1M': 1, '3M': 3, '6M': 6,
    '1Y': 12, '3Y': 36, '5Y': 60,
  }

  const now = new Date()
  now.setMonth(now.getMonth() - (months[period] ?? 3))
  return now.toISOString().split('T')[0]
}
