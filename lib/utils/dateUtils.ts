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

// ECOS 날짜 → 'YYYY-MM-DD'
export function ecosTimeToISO(time: string, cycle: string): string {
  if (cycle === 'D') {
    // 20260110 → 2026-01-10
    return `${time.slice(0,4)}-${time.slice(4,6)}-${time.slice(6,8)}`
  }
  if (cycle === 'M') {
    // 202601 → 2026-01-01 (월의 첫날로 통일)
    return `${time.slice(0,4)}-${time.slice(4,6)}-01`
  }
  if (cycle === 'Q') {
    // 2026Q1 → 2026-01-01
    const quarter = parseInt(time.slice(5))
    const month = String((quarter - 1) * 3 + 1).padStart(2, '0')
    return `${time.slice(0,4)}-${month}-01`
  }
  return time
}

// 기간별 startTime/endTime 계산 — ECOS 형식으로
export function getEcosDateRange(
  period: string,
  cycle: string
): { startTime: string; endTime: string } {
  const now = new Date()
  const endYear = now.getFullYear()
  const endMonth = now.getMonth() + 1

  // 종료날짜
  const endTime = cycle === 'D'
    ? `${endYear}${String(endMonth).padStart(2,'0')}31`
    : cycle === 'M'
    ? `${endYear}${String(endMonth).padStart(2,'0')}`
    : String(endYear)

  // 시작날짜 — period에서 역산
  const monthsBack: Record<string, number> = {
    '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '3Y': 36, '5Y': 60
  }
  const startDate = new Date(now)

  if (period === 'MAX') {
    const startTime = cycle === 'D' ? '19000101'
      : cycle === 'M' ? '190001'
      : '1900'
    return { startTime, endTime }
  }

  // CPI YoY% 계산을 위해 13개월 추가 확보
  const extraMonths = cycle === 'M' ? 13 : 0
  startDate.setMonth(startDate.getMonth() - (monthsBack[period] ?? 3) - extraMonths)

  const sy = startDate.getFullYear()
  const sm = startDate.getMonth() + 1

  const startTime = cycle === 'D'
    ? `${sy}${String(sm).padStart(2,'0')}01`
    : cycle === 'M'
    ? `${sy}${String(sm).padStart(2,'0')}`
    : String(sy)

  return { startTime, endTime }
}
