/**
 * 내 알람 탭 - 알람 CRUD + ON/OFF 토글
 */

'use client';

import { useState } from 'react';
import { useUserSettings } from '@/lib/store/userSettingsStore';
import { useMetricCurrentValue } from '@/lib/hooks/useMetrics';
import AlarmModal from '@/components/modals/AlarmModal';
import type { UserAlarm, MetricId } from '@/lib/metrics/metricsTypes';

// 개별 알람 카드
function AlarmCard({ alarm }: { alarm: UserAlarm }) {
  const { toggleAlarm, removeAlarm, updateAlarm } = useUserSettings();
  const currentData = useMetricCurrentValue(alarm.metricId);
  const [showEditModal, setShowEditModal] = useState(false);

  if (!currentData) return null;

  // 알람 조건 체크
  const isTriggered =
    (alarm.condition.type === 'above' && currentData.value >= alarm.condition.threshold) ||
    (alarm.condition.type === 'below' && currentData.value <= alarm.condition.threshold);

  return (
    <>
      <div
        className={`bg-[#1e2530] border rounded-xl p-5 shadow-lg ${
          alarm.isActive && isTriggered
            ? 'border-red-500 bg-red-950/20'
            : 'border-[#2d3748]'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="text-lg font-semibold text-slate-200">{alarm.metricLabel}</div>
            <div className="text-sm text-slate-400 mt-1">
              현재값: <span className="font-mono font-semibold text-slate-200">{currentData.value.toLocaleString()}</span>
            </div>
          </div>

          {/* ON/OFF 토글 */}
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={alarm.isActive}
              onChange={() => toggleAlarm(alarm.id)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3b82f6]"></div>
          </label>
        </div>

        {/* 알람 조건 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-slate-400">조건:</span>
          <span className="text-sm font-mono text-slate-200">
            {alarm.condition.type === 'above' ? '≥' : '≤'} {alarm.condition.threshold}
          </span>
          {alarm.isActive && isTriggered && (
            <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded font-semibold animate-pulse">
              알람 발동!
            </span>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex-1 px-3 py-1.5 bg-[#0f1117] hover:bg-[#1e2530] text-slate-300 border border-[#2d3748] rounded text-sm transition-colors"
          >
            수정
          </button>
          <button
            onClick={() => {
              if (confirm('이 알람을 삭제하시겠습니까?')) {
                removeAlarm(alarm.id);
              }
            }}
            className="flex-1 px-3 py-1.5 bg-red-900 hover:bg-red-800 text-red-200 border border-red-700 rounded text-sm transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

      {/* 수정 모달 */}
      {showEditModal && (
        <AlarmModal
          alarm={alarm}
          onSave={(updatedAlarm) => {
            updateAlarm(alarm.id, updatedAlarm);
            setShowEditModal(false);
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}

export default function AlarmsTab() {
  const { alarms, addAlarm } = useUserSettings();
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="pt-4 px-6 pb-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-200">⚙️ 내 알람</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded text-sm font-medium"
        >
          + 알람 추가
        </button>
      </div>

      {alarms.length === 0 ? (
        <div className="bg-[#1e2530] border border-[#2d3748] rounded-xl p-12 text-center">
          <div className="text-4xl mb-4">🔔</div>
          <div className="text-slate-400 mb-4">설정된 알람이 없습니다</div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded text-sm font-medium"
          >
            + 첫 번째 알람 추가
          </button>
        </div>
      ) : (
        <>
          {/* 알람 목록 */}
          <div className="space-y-4">
            {alarms.map((alarm) => (
              <AlarmCard key={alarm.id} alarm={alarm} />
            ))}
          </div>
        </>
      )}

      {/* 알람 조건 예시 */}
      <div className="mt-6 bg-[#1e2530] border border-[#2d3748] rounded-xl p-5 shadow-lg">
        <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">
          알람 조건 예시
        </div>
        <div className="space-y-2 text-sm text-slate-300">
          <div>• VIX ≥ 30 → <span className="text-red-400">시장 공포 지수 상승</span></div>
          <div>• HY OAS ≥ 500 → <span className="text-red-400">크레딧 스프레드 확대</span></div>
          <div>• 2Y-10Y Spread ≤ 0 → <span className="text-yellow-400">장단기 금리 역전 (침체 신호)</span></div>
          <div>• PMI ≤ 50 → <span className="text-red-400">경기 위축</span></div>
        </div>
      </div>

      {/* 알람 추가 모달 */}
      {showAddModal && (
        <AlarmModal
          onSave={(newAlarm) => {
            addAlarm(newAlarm);
            setShowAddModal(false);
          }}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
