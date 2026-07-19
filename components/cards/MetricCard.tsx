/**
 * 클릭 가능한 지표 카드
 */

'use client';

import type { MetricId } from '@/lib/metrics/metricsTypes';
import { getMetricMeta } from '@/lib/metrics/metricsMeta';
import { useMetricCurrentValue } from '@/lib/hooks/useMetrics';
import { getChangeColor, getValueColor } from '@/lib/utils/colorUtils';
import { useUserSettings } from '@/lib/store/userSettingsStore';

interface MetricCardProps {
  metricId: MetricId;
  onClick?: () => void;
}

// 국기 이모지 매핑
function getCountryFlag(label: string): string {
  if (label.includes('(US)')) return '🇺🇸';
  if (label.includes('(KR)')) return '🇰🇷';
  if (label.includes('(JP)')) return '🇯🇵';
  if (label.includes('(Global)')) return '🌍';
  return '';
}

export default function MetricCard({ metricId, onClick }: MetricCardProps) {
  const meta = getMetricMeta(metricId);
  const rawData = useMetricCurrentValue(metricId);
  const { alarms } = useUserSettings();

  if (!meta || !rawData) return null;

  // 이미 성장률/비율로 표시되는 지표는 변화율(%) 제거
  const isPercentageMetric = meta.unit === '%' || meta.unit === '% QoQ' || meta.unit === '% YoY';
  const data = {
    ...rawData,
    changePercent: isPercentageMetric ? undefined : rawData.changePercent,
  };

  // 색상 로직: colorUtils 사용
  const valueColor = getValueColor(data.change);
  const changeColor = getChangeColor(data.change);

  // 알람 발동 여부 확인
  const checkAlarmTriggered = () => {
    const activeAlarms = alarms.filter(a => a.metricId === metricId && a.isActive);

    return activeAlarms.some(alarm => {
      const { condition } = alarm;
      const value = data.value;

      switch (condition.type) {
        case 'above':
          return value > condition.threshold;
        case 'below':
          return value < condition.threshold;
        case 'crossUp':
        case 'crossDown':
          // crossUp/Down은 이전 값과 비교가 필요하므로 여기서는 단순 비교
          return condition.type === 'crossUp'
            ? value > condition.threshold
            : value < condition.threshold;
        default:
          return false;
      }
    });
  };

  const isAlarmTriggered = checkAlarmTriggered();

  // 보더 색상: 알람 발동 > 2Y-10Y 음수 > 기본
  const borderColor = isAlarmTriggered
    ? 'border-red-500 animate-pulse'
    : metricId === 'spread2y10y' && data.value < 0
    ? 'border-orange-500'
    : 'border-[#2d3748]';

  // 모든 지표에 날짜 표시 (updatedAt이 있는 경우)
  const showDate = !!data.updatedAt;

  // 날짜 포맷팅 (YYYY-MM-DD → YYYY-MM-DD 또는 YYYY년 MM월)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';

    // YYYY-MM-DD 형식이면 그대로 사용
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateStr;
    }

    return dateStr;
  };

  const flag = getCountryFlag(meta.label);

  return (
    <div
      onClick={onClick}
      className={`bg-[#1e2530] border ${borderColor} rounded-xl p-5 shadow-lg cursor-pointer hover:border-[#3b82f6] transition-colors`}
    >
      <div className="text-xs text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        {flag && <span className="text-sm">{flag}</span>}
        <span>{meta.label}</span>
      </div>
      <div className={`text-2xl font-mono font-semibold ${valueColor} mb-1`}>
        {data.value.toLocaleString()}{meta.unit}
      </div>
      {data.change !== null && (
        <div className={`text-xs font-mono ${changeColor} flex items-center gap-1`}>
          <span>{data.change > 0 ? '+' : ''}{data.change.toFixed(meta.decimals ?? 2)}</span>
          {data.changePercent !== undefined && (
            <span className={`px-2 py-0.5 rounded font-semibold ${
              data.changePercent > 0
                ? 'bg-green-500/30 text-green-300'
                : data.changePercent < 0
                  ? 'bg-red-500/30 text-red-300'
                  : 'bg-slate-500/30 text-slate-300'
            }`}>
              {data.changePercent > 0 ? '+' : ''}{data.changePercent.toFixed(2)}%
            </span>
          )}
        </div>
      )}
      {showDate && data.updatedAt && (
        <div className="text-[10px] text-slate-500 mt-2">
          {formatDate(data.updatedAt)} 기준
          {data.timezone && ` (${data.timezone})`}
        </div>
      )}
    </div>
  );
}
