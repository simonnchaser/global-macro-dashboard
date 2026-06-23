/**
 * 알람 생성/수정 모달
 */

'use client';

import { useState, useEffect } from 'react';
import type { MetricId, UserAlarm } from '@/lib/metrics/metricsTypes';
import { allMetrics } from '@/lib/metrics/metricsMeta';

interface AlarmModalProps {
  alarm?: UserAlarm; // 수정 모드일 때 기존 알람
  onSave: (alarm: Omit<UserAlarm, 'id'>) => void;
  onClose: () => void;
}

export default function AlarmModal({ alarm, onSave, onClose }: AlarmModalProps) {
  const [metricId, setMetricId] = useState<MetricId | ''>(alarm?.metricId || '');
  const [conditionType, setConditionType] = useState<'above' | 'below'>(
    alarm?.condition.type === 'above' || alarm?.condition.type === 'below'
      ? alarm.condition.type
      : 'above'
  );
  const [threshold, setThreshold] = useState(alarm?.condition.threshold?.toString() || '');

  // 모달이 열렸을 때 배경 스크롤 막기
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSave = () => {
    if (!metricId || !threshold) {
      alert('지표와 기준값을 모두 입력해주세요');
      return;
    }

    const metric = allMetrics.find((m) => m.id === metricId);
    if (!metric) return;

    onSave({
      metricId,
      metricLabel: metric.label,
      condition: {
        type: conditionType,
        threshold: parseFloat(threshold),
      },
      level: 'info',
      memo: '',
      createdAt: new Date().toISOString(),
      isActive: alarm?.isActive ?? true,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-[#1e2530] rounded-xl shadow-2xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-[#2d3748]">
          <h2 className="text-xl font-semibold text-slate-200">
            {alarm ? '알람 수정' : '알람 추가'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 폼 */}
        <div className="p-6 space-y-4">
          {/* 지표 선택 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              지표
            </label>
            <select
              value={metricId}
              onChange={(e) => setMetricId(e.target.value as MetricId)}
              className="w-full bg-[#0f1117] border border-[#2d3748] rounded px-3 py-2 text-slate-200 focus:border-[#3b82f6] focus:outline-none"
            >
              <option value="">지표를 선택하세요</option>
              {allMetrics.map((metric) => (
                <option key={metric.id} value={metric.id}>
                  {metric.label} ({metric.labelKo})
                </option>
              ))}
            </select>
          </div>

          {/* 조건 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              조건
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setConditionType('above')}
                className={`flex-1 px-4 py-2 rounded border transition-colors ${
                  conditionType === 'above'
                    ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                    : 'bg-[#0f1117] border-[#2d3748] text-slate-400 hover:border-[#3b82f6]'
                }`}
              >
                이상 (≥)
              </button>
              <button
                onClick={() => setConditionType('below')}
                className={`flex-1 px-4 py-2 rounded border transition-colors ${
                  conditionType === 'below'
                    ? 'bg-[#3b82f6] border-[#3b82f6] text-white'
                    : 'bg-[#0f1117] border-[#2d3748] text-slate-400 hover:border-[#3b82f6]'
                }`}
              >
                이하 (≤)
              </button>
            </div>
          </div>

          {/* 기준값 */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              기준값
            </label>
            <input
              type="number"
              step="any"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              placeholder="예: 30"
              className="w-full bg-[#0f1117] border border-[#2d3748] rounded px-3 py-2 text-slate-200 focus:border-[#3b82f6] focus:outline-none"
            />
          </div>

          {/* 미리보기 */}
          {metricId && threshold && (
            <div className="bg-[#0f1117] border border-[#2d3748] rounded p-3 text-sm text-slate-300">
              <div className="font-semibold mb-1">알람 조건:</div>
              <div>
                {allMetrics.find((m) => m.id === metricId)?.label}{' '}
                {conditionType === 'above' ? '≥' : '≤'} {threshold}
              </div>
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 p-6 border-t border-[#2d3748]">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[#1e2530] hover:bg-[#0f1117] text-slate-300 border border-[#2d3748] rounded transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded transition-colors"
          >
            {alarm ? '수정' : '추가'}
          </button>
        </div>
      </div>
    </div>
  );
}
