/**
 * 탭 네비게이션 - 7개 탭
 */

'use client';

import type { TabId } from '@/lib/metrics/metricsTypes';

interface TabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string }[] = [
  { id: 'stocks', label: '증시' },
  { id: 'bonds', label: '금리·채권' },
  { id: 'fx', label: '환율·원자재' },
  { id: 'liquidity', label: '유동성·크레딧' },
  { id: 'economic', label: '경제지표' },
  { id: 'calendar', label: 'Event Calendar' },
  { id: 'compare', label: '📊 차트 비교' },
  { id: 'alarms', label: '⚙️ 내 알람' },
];

export default function TabNav({ activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="sticky top-[60px] z-40 bg-[#1e2530] border-b border-[#2d3748]">
      <div className="px-6 flex items-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-5 py-3 text-sm font-medium transition-colors relative ${
              activeTab === tab.id
                ? 'text-[#3b82f6]'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3b82f6]" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
