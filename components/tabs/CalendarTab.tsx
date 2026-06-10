/**
 * Event Calendar 탭
 */

'use client';

interface CalendarEvent {
  id: string;
  type: 'FOMC' | 'CPI' | 'PCE' | 'BOK' | 'BOJ' | 'GDP' | 'NFP';
  date: string;
  title: string;
  currentValue?: number;
  expectedValue?: number;
  previousValue?: number;
}

const mockCalendarEvents: CalendarEvent[] = [
  {
    id: '1',
    type: 'FOMC',
    date: '2026-06-18',
    title: 'FOMC 회의',
    currentValue: 3.625,
    expectedValue: 3.625,
  },
  {
    id: '2',
    type: 'CPI',
    date: '2026-06-12',
    title: 'CPI 발표',
    previousValue: 3.3,
    expectedValue: 3.1,
  },
  {
    id: '3',
    type: 'PCE',
    date: '2026-06-28',
    title: 'PCE 물가지수',
    previousValue: 2.7,
    expectedValue: 2.8,
  },
  {
    id: '4',
    type: 'BOK',
    date: '2026-07-11',
    title: '금통위 회의',
    currentValue: 2.75,
  },
  {
    id: '5',
    type: 'NFP',
    date: '2026-07-05',
    title: '비농업 고용지표',
    previousValue: 185000,
    expectedValue: 190000,
  },
];

export default function CalendarTab() {
  // D-day 계산
  const getDday = (dateStr: string) => {
    const today = new Date('2026-06-10'); // 목 데이터 기준일
    const eventDate = new Date(dateStr);
    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 이벤트 타입별 색상
  const eventTypeColor: Record<string, string> = {
    FOMC: 'bg-red-900 text-red-200',
    CPI: 'bg-orange-900 text-orange-200',
    PCE: 'bg-yellow-900 text-yellow-200',
    BOK: 'bg-blue-900 text-blue-200',
    BOJ: 'bg-purple-900 text-purple-200',
    GDP: 'bg-green-900 text-green-200',
    NFP: 'bg-pink-900 text-pink-200',
  };

  return (
    <div className="pt-4 px-6 pb-8">
      {/* D-day 카운트다운 리스트 */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">다가오는 이벤트</h2>
        <div className="space-y-3">
          {mockCalendarEvents
            .sort((a, b) => getDday(a.date) - getDday(b.date))
            .map((event) => {
              const dday = getDday(event.date);
              return (
                <div
                  key={event.id}
                  className="bg-[#1e2530] border border-[#2d3748] rounded-xl p-4 shadow-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1 rounded text-xs font-semibold ${eventTypeColor[event.type]}`}>
                      {event.type}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-200">{event.title}</div>
                      <div className="text-sm text-slate-400">{event.date}</div>
                      {event.currentValue !== undefined && (
                        <div className="text-xs text-slate-500 mt-1">
                          현재: {event.currentValue.toLocaleString()}
                          {event.expectedValue !== undefined && ` → 예상: ${event.expectedValue.toLocaleString()}`}
                        </div>
                      )}
                      {event.previousValue !== undefined && event.expectedValue !== undefined && (
                        <div className="text-xs text-slate-500 mt-1">
                          이전: {event.previousValue.toLocaleString()} → 예상: {event.expectedValue.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`text-2xl font-mono font-bold ${
                    dday === 0 ? 'text-red-400' :
                    dday <= 3 ? 'text-orange-400' :
                    dday <= 7 ? 'text-yellow-400' :
                    'text-slate-400'
                  }`}>
                    {dday === 0 ? 'D-Day' : dday > 0 ? `D-${dday}` : `D+${Math.abs(dday)}`}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 캘린더 뷰 영역 (나중에 추가) */}
      <div className="bg-[#1e2530] border border-[#2d3748] rounded-xl p-5 shadow-lg">
        <div className="text-xs text-slate-400 uppercase tracking-wider mb-4">
          월별 캘린더 뷰
        </div>
        <div className="h-96 flex items-center justify-center text-slate-500">
          캘린더 컴포넌트 (나중에 추가 예정)
        </div>
      </div>
    </div>
  );
}
