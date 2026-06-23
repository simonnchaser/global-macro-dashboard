

'use client';

/**
 * Global Macro Dashboard v2 - Main Page
 * "Frame을 만든다" - 사용자가 스스로 시나리오를 구축할 수 있는 프레임
 */

import { useState } from 'react';
import type { TabId, MetricId } from '@/lib/metrics/metricsTypes';
import TopBar from '@/components/layout/TopBar';
import TabNav from '@/components/layout/TabNav';
import StocksTab from '@/components/tabs/StocksTab';
import BondsTab from '@/components/tabs/BondsTab';
import FxCommoditiesTab from '@/components/tabs/FxCommoditiesTab';
import LiquidityTab from '@/components/tabs/LiquidityTab';
import EconomicTab from '@/components/tabs/EconomicTab';
import CalendarTab from '@/components/tabs/CalendarTab';
import CompareTab from '@/components/tabs/CompareTab';
import AlarmsTab from '@/components/tabs/AlarmsTab';
import ChartModal from '@/components/modals/ChartModal';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('stocks');
  const [selectedMetric, setSelectedMetric] = useState<MetricId | null>(null);

  const handleMetricClick = (metricId: MetricId) => {
    setSelectedMetric(metricId);
  };

  const handleCloseModal = () => {
    setSelectedMetric(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stocks':
        return <StocksTab onMetricClick={handleMetricClick} />;
      case 'bonds':
        return <BondsTab onMetricClick={handleMetricClick} />;
      case 'fx':
        return <FxCommoditiesTab onMetricClick={handleMetricClick} />;
      case 'liquidity':
        return <LiquidityTab onMetricClick={handleMetricClick} />;
      case 'economic':
        return <EconomicTab onMetricClick={handleMetricClick} />;
      case 'calendar':
        return <CalendarTab />;
      case 'compare':
        return <CompareTab />;
      case 'alarms':
        return <AlarmsTab />;
      default:
        return <StocksTab onMetricClick={handleMetricClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1117]">
      {/* 상단 고정바 - 사용자 핀 지표 */}
      <TopBar />

      {/* 탭 네비게이션 - 7개 탭 */}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* 탭 콘텐츠 */}
      <main className="pt-[110px]">
        {renderTabContent()}
      </main>

      {/* 차트 모달 */}
      {selectedMetric && (
        <ChartModal metricId={selectedMetric} onClose={handleCloseModal} />
      )}
    </div>
  );
}
