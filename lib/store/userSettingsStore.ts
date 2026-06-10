/**
 * Zustand: 사용자 설정 전역 관리
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserSettings, MetricId, UserAlarm } from '../metrics/metricsTypes';

interface UserSettingsStore extends UserSettings {
  // 핀 지표 관리
  addPinnedMetric: (metricId: MetricId) => void;
  removePinnedMetric: (metricId: MetricId) => void;
  reorderPinnedMetrics: (metricIds: MetricId[]) => void;

  // 차트 비교 관리
  addCompareChart: (metricId: MetricId) => void;
  removeCompareChart: (metricId: MetricId) => void;

  // 알람 관리
  addAlarm: (alarm: Omit<UserAlarm, 'id'>) => void;
  updateAlarm: (alarmId: string, alarm: Omit<UserAlarm, 'id'>) => void;
  removeAlarm: (alarmId: string) => void;
  toggleAlarm: (alarmId: string) => void;

  // 차트 기간
  setDefaultChartPeriod: (period: '1M' | '3M' | '6M' | '1Y') => void;
}

export const useUserSettings = create<UserSettingsStore>()(
  persist(
    (set) => ({
      // 초기값
      pinnedMetrics: ['hyOas', 'netLiquidity', 'usdKrw', 'spread2y10y'],
      compareCharts: [],
      alarms: [],
      defaultChartPeriod: '3M',

      // 핀 지표 관리
      addPinnedMetric: (metricId) =>
        set((state) => ({
          pinnedMetrics: [...state.pinnedMetrics, metricId],
        })),

      removePinnedMetric: (metricId) =>
        set((state) => ({
          pinnedMetrics: state.pinnedMetrics.filter((id) => id !== metricId),
        })),

      reorderPinnedMetrics: (metricIds) =>
        set({ pinnedMetrics: metricIds }),

      // 차트 비교 관리
      addCompareChart: (metricId) =>
        set((state) => ({
          compareCharts: [...state.compareCharts, metricId].slice(0, 6), // 최대 6개
        })),

      removeCompareChart: (metricId) =>
        set((state) => ({
          compareCharts: state.compareCharts.filter((id) => id !== metricId),
        })),

      // 알람 관리
      addAlarm: (alarm) =>
        set((state) => ({
          alarms: [
            ...state.alarms,
            {
              ...alarm,
              id: `alarm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            },
          ],
        })),

      updateAlarm: (alarmId, alarm) =>
        set((state) => ({
          alarms: state.alarms.map((a) =>
            a.id === alarmId ? { ...alarm, id: alarmId } : a
          ),
        })),

      removeAlarm: (alarmId) =>
        set((state) => ({
          alarms: state.alarms.filter((a) => a.id !== alarmId),
        })),

      toggleAlarm: (alarmId) =>
        set((state) => ({
          alarms: state.alarms.map((a) =>
            a.id === alarmId ? { ...a, isActive: !a.isActive } : a
          ),
        })),

      // 차트 기간
      setDefaultChartPeriod: (period) =>
        set({ defaultChartPeriod: period }),
    }),
    {
      name: 'macro-dashboard-settings', // localStorage 키
    }
  )
);
