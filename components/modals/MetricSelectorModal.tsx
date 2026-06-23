/**
 * 지표 선택 모달
 * 용도: 핀 추가, 차트 비교 추가, 알람 설정 등
 */

'use client';

import { useEffect } from 'react';
import type { MetricId, TabId } from '@/lib/metrics/metricsTypes';
import { allMetrics } from '@/lib/metrics/metricsMeta';

interface MetricSelectorModalProps {
  title: string;
  onSelect: (metricId: MetricId) => void;
  onClose: () => void;
  selectedMetrics?: MetricId[]; // 이미 선택된 지표들 (체크 표시용)
}

export default function MetricSelectorModal({
  title,
  onSelect,
  onClose,
  selectedMetrics = [],
}: MetricSelectorModalProps) {
  // 모달이 열렸을 때 배경 스크롤 막기
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);
  // 탭별로 지표 그룹화
  const metricsByTab: Record<TabId, typeof allMetrics> = {
    stocks: [],
    bonds: [],
    fx: [],
    liquidity: [],
    economic: [],
    calendar: [],
    compare: [],
    alarms: [],
  };

  allMetrics.forEach((metric) => {
    if (metric.tab in metricsByTab) {
      metricsByTab[metric.tab].push(metric);
    }
  });

  const tabLabels: Record<TabId, string> = {
    stocks: '증시',
    bonds: '금리·채권',
    fx: '환율·원자재',
    liquidity: '유동성·크레딧',
    economic: '경제지표',
    calendar: 'Event Calendar',
    compare: '차트 비교',
    alarms: '내 알람',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="bg-[#1e2530] rounded-xl shadow-2xl max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-[#2d3748] sticky top-0 bg-[#1e2530] z-10">
          <h2 className="text-xl font-semibold text-slate-200">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 지표 목록 */}
        <div className="p-6 space-y-6">
          {(['stocks', 'bonds', 'fx', 'liquidity', 'economic'] as TabId[]).map((tabId) => {
            const metrics = metricsByTab[tabId];
            if (metrics.length === 0) return null;

            return (
              <div key={tabId}>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">{tabLabels[tabId]}</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {metrics.map((metric) => {
                    const isSelected = selectedMetrics.includes(metric.id);
                    return (
                      <button
                        key={metric.id}
                        onClick={() => onSelect(metric.id)}
                        className={`p-3 rounded-lg border text-left transition-colors ${
                          isSelected
                            ? 'bg-[#3b82f6]/20 border-[#3b82f6] text-[#3b82f6]'
                            : 'bg-[#0f1117] border-[#2d3748] text-slate-300 hover:border-[#3b82f6]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-medium">{metric.label}</div>
                          {isSelected && (
                            <svg className="w-4 h-4 text-[#3b82f6]" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">{metric.labelKo}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
