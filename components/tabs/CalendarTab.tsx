/**
 * Event Calendar 탭 - 예정된 경제 지표 발표 일정
 */

'use client';

import { useMemo, useState } from 'react';
import { scheduledEvents, type ScheduledEvent } from '@/lib/data/scheduledEvents';
import { getMetricMeta } from '@/lib/metrics/metricsMeta';
import ChartModal from '@/components/modals/ChartModal';
import type { MetricId } from '@/lib/types/metrics';

export default function CalendarTab() {
  const [selectedMetricId, setSelectedMetricId] = useState<MetricId | null>(null);

  // 오늘부터 3개월 후까지의 이벤트 필터링
  const events = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);
    threeMonthsLater.setHours(23, 59, 59, 999);

    return scheduledEvents.filter(event => {
      const eventDate = new Date(event.releaseDate);
      return eventDate >= today && eventDate <= threeMonthsLater;
    }).sort((a, b) =>
      new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
    );
  }, []);

  // D-day 계산
  const getDday = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDate = new Date(dateStr);
    eventDate.setHours(0, 0, 0, 0);

    const diffTime = eventDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // 이벤트 타입 추출
  const getEventType = (event: ScheduledEvent): string => {
    if (event.title.includes('FOMC') || event.title.includes('Fed Rate')) return 'FOMC';
    if (event.title.includes('CPI')) return 'CPI';
    if (event.title.includes('PPI')) return 'PPI';
    if (event.title.includes('PCE')) return 'PCE';
    if (event.title.includes('GDP')) return 'GDP';
    if (event.title.includes('Nonfarm') || event.title.includes('NFP')) return 'NFP';
    if (event.title.includes('BOK') || event.title.includes('Monetary Policy')) return 'BOK';
    if (event.title.includes('BOJ')) return 'BOJ';
    if (event.title.includes('ECB')) return 'ECB';
    return 'Other';
  };

  // 이벤트 타입별 색상
  const eventTypeColor: Record<string, string> = {
    FOMC: 'bg-red-900 text-red-200',
    CPI: 'bg-orange-900 text-orange-200',
    PPI: 'bg-amber-900 text-amber-200',
    PCE: 'bg-yellow-900 text-yellow-200',
    BOK: 'bg-blue-900 text-blue-200',
    BOJ: 'bg-purple-900 text-purple-200',
    ECB: 'bg-indigo-900 text-indigo-200',
    GDP: 'bg-green-900 text-green-200',
    NFP: 'bg-pink-900 text-pink-200',
    Other: 'bg-slate-700 text-slate-300',
  };

  // 국가별 국기
  const getCountryFlag = (country: string): string => {
    const flags: Record<string, string> = {
      US: '🇺🇸',
      KR: '🇰🇷',
      CN: '🇨🇳',
      JP: '🇯🇵',
      EU: '🇪🇺',
      GB: '🇬🇧',
    };
    return flags[country] || '🌍';
  };

  return (
    <>
      <div className="pt-4 px-6 pb-8">
        {/* D-day 카운트다운 리스트 */}
        <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">
          다가오는 주요 경제 이벤트 ({events.length}개)
        </h2>

        {events.length === 0 ? (
          <div className="bg-[#1e2530] border border-[#2d3748] rounded-xl p-8 text-center text-slate-400">
            예정된 주요 경제 이벤트가 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const dday = getDday(event.releaseDate);
              const eventType = getEventType(event);
              const meta = getMetricMeta(event.metricId as any);

              return (
                <div
                  key={event.id}
                  onClick={() => setSelectedMetricId(event.metricId as MetricId)}
                  className="bg-[#1e2530] border border-[#2d3748] rounded-xl p-4 shadow-lg flex items-center justify-between cursor-pointer hover:bg-[#252e3d] hover:border-[#3d4857] transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getCountryFlag(event.country)}</span>
                      <div className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap ${eventTypeColor[eventType]}`}>
                        {eventType}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-200 truncate">{event.titleKo}</div>
                      <div className="text-sm text-slate-400">
                        {new Date(event.releaseDate).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short'
                        })}
                        {event.releaseTime && event.timezone && (
                          <span className="ml-2 text-xs text-slate-500">
                            {event.releaseTime} {event.timezone}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex gap-3 flex-wrap">
                        {event.previous && (
                          <span>이전: <span className="font-mono">{event.previous}</span></span>
                        )}
                        {event.estimate && (
                          <span>예상: <span className="font-mono">{event.estimate}</span></span>
                        )}
                      </div>
                      {meta && (
                        <div className="text-xs text-slate-600 mt-1">
                          대시보드 지표: {meta.label}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`text-2xl font-mono font-bold whitespace-nowrap ml-4 ${
                    dday === 0 ? 'text-red-400' :
                    dday === 1 ? 'text-orange-400' :
                    dday <= 3 ? 'text-yellow-400' :
                    dday <= 7 ? 'text-green-400' :
                    'text-slate-400'
                  }`}>
                    {dday === 0 ? 'D-Day' : dday > 0 ? `D-${dday}` : `D+${Math.abs(dday)}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 정보 */}
      <div className="bg-[#1e2530] border border-[#2d3748] rounded-xl p-5 shadow-lg">
        <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">
          데이터 출처
        </div>
        <div className="text-sm text-slate-300">
          공식 발표 일정 (Fed, BLS, 한국은행, 통계청)
        </div>
        <div className="text-xs text-slate-500 mt-1">
          대시보드 지표와 연동된 High impact 이벤트만 표시
        </div>
        <div className="text-xs text-slate-500 mt-2">
          📅 정기 발표 일정: FOMC (연 8회), CPI/PCE (매월), NFP (매월 첫 금요일), GDP (분기), BOK (연 8회)
        </div>
      </div>
    </div>

      {/* 차트 모달 */}
      {selectedMetricId && (
        <ChartModal
          metricId={selectedMetricId}
          onClose={() => setSelectedMetricId(null)}
        />
      )}
    </>
  );
}
