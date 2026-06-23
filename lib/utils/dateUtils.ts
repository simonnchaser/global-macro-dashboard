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

// Yahoo Finance Unix timestamp → 날짜 변환
export function yahooTimestampToDate(timestamp: number, includeTime: boolean = false): string | number {
  if (includeTime) {
    // 1분봉용: Unix timestamp 숫자로 반환
    return timestamp
  }
  // 일봉용: UTC 기준 날짜 변환
  const date = new Date(timestamp * 1000)
  return date.toISOString().split('T')[0]  // 'YYYY-MM-DD'
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
    : cycle === 'Q'
    ? `${endYear}Q${Math.ceil(endMonth / 3)}`  // 분기: 2026Q2
    : String(endYear)

  // 시작날짜 — period에서 역산
  const monthsBack: Record<string, number> = {
    '1M': 1, '3M': 3, '6M': 6, '1Y': 12, '3Y': 36, '5Y': 60
  }
  const startDate = new Date(now)

  if (period === 'MAX') {
    // ECOS API 10,000건 제한 고려: 최근 데이터 우선
    // 일별(D): 최근 30년, 월별(M): 최근 100년, 분기(Q): 최근 200년
    const maxStartYear = cycle === 'D' ? endYear - 30
      : cycle === 'M' ? endYear - 100
      : cycle === 'Q' ? endYear - 200
      : endYear - 100

    const startTime = cycle === 'D' ? `${maxStartYear}0101`
      : cycle === 'M' ? `${maxStartYear}01`
      : cycle === 'Q' ? `${maxStartYear}Q1`
      : String(maxStartYear)
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
    : cycle === 'Q'
    ? `${sy}Q${Math.ceil(sm / 3)}`  // 분기: 2023Q1
    : String(sy)

  return { startTime, endTime }
}
