import React, { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { DashboardMode, AnalyticalTab } from './types';
import { useDashboardData } from './hooks/useDashboardData';

// Layout Components
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { GlobalFilters } from './components/layout/GlobalFilters';
import { ArenaMode } from './components/layout/ArenaMode';

// Tabs Components
import { OverviewTab } from './components/tabs/OverviewTab';
import { PerformanceTab } from './components/tabs/PerformanceTab';
import { ErrorsTab } from './components/tabs/ErrorsTab';
import { ExperienceTab } from './components/tabs/ExperienceTab';
import { OperationsTab } from './components/tabs/OperationsTab';
import { AlertOverlay } from './components/AlertOverlay';

import { cn } from './lib/utils';

export default function App() {
  const [mode, setMode] = useState<DashboardMode>('analytical');
  const [activeTab, setActiveTab] = useState<AnalyticalTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const {
    data,
    loading,
    error,
    config,
    setConfig,
    alerts,
    removeAlert,
    triggerRefresh,

    selectedSede, setSelectedSede,
    selectedIntent, setSelectedIntent,
    dateRange, setDateRange,
    customStartDate, setCustomStartDate,
    customEndDate, setCustomEndDate,

    sedes,
    intents,
    filteredData,
    stats,
    sedeStats,
    intentStats,
    arenaHighlights
  } = useDashboardData();

  // Auto-refresh for Arena Mode logic can be handled here or inside the hook.
  // We handle it here directly reading `mode` to keep hook universal.
  useEffect(() => {
    if (mode === 'arena') {
      const interval = setInterval(() => {
        triggerRefresh();
      }, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [mode, triggerRefresh]);

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <Activity className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-zinc-400 font-bold uppercase tracking-[0.3em] animate-pulse">Initializing System</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">
        <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-2xl max-w-lg text-center">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Error Loading Data</h2>
          <p className="text-rose-400">{error}</p>
        </div>
      </div>
    );
  }

  if (mode === 'arena') {
    return (
      <ArenaMode
        stats={stats}
        sedeStats={sedeStats}
        config={config}
        setConfig={setConfig}
        alerts={alerts}
        removeAlert={removeAlert}
        setMode={setMode}
        arenaHighlights={arenaHighlights}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 transition-all duration-300 flex flex-col",
        isSidebarOpen ? "ml-72" : "ml-20"
      )}>
        {/* Analytical Header */}
        <Header
          activeTab={activeTab}
          mode={mode}
          setMode={setMode}
          triggerRefresh={triggerRefresh}
          loading={loading}
        />

        <main className="max-w-[1600px] mx-auto px-8 py-10 w-full">
          {/* Global Filters */}
          <GlobalFilters
            sedes={sedes}
            intents={intents}
            selectedSede={selectedSede} setSelectedSede={setSelectedSede}
            selectedIntent={selectedIntent} setSelectedIntent={setSelectedIntent}
            dateRange={dateRange} setDateRange={setDateRange}
            customStartDate={customStartDate} setCustomStartDate={setCustomStartDate}
            customEndDate={customEndDate} setCustomEndDate={setCustomEndDate}
          />

          {/* Tab Content */}
          <div className="space-y-10">
            {activeTab === 'overview' && (
              <OverviewTab stats={stats} sedeStats={sedeStats} filteredData={filteredData} />
            )}

            {activeTab === 'performance' && (
              <PerformanceTab stats={stats} intentStats={intentStats} />
            )}

            {activeTab === 'errors' && (
              <ErrorsTab stats={stats} sedeStats={sedeStats} intentStats={intentStats} filteredData={filteredData} />
            )}

            {activeTab === 'experience' && (
              <ExperienceTab stats={stats} sedeStats={sedeStats} filteredData={filteredData} />
            )}

            {activeTab === 'operations' && (
              <OperationsTab stats={stats} sedeStats={sedeStats} filteredData={filteredData} />
            )}
          </div>
        </main>

        {/* Analytical Footer */}
        <footer className="max-w-[1600px] mx-auto px-8 py-16 border-t border-zinc-200 mt-20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-4 opacity-40 grayscale">
              <Activity className="w-8 h-8" />
              <span className="text-xl font-black tracking-tighter uppercase">Campaign Analytics v2.4</span>
            </div>
            <p className="text-sm text-zinc-400 font-medium italic">© 2026 Analytics Corp. Real-time data synchronization active.</p>
            <div className="flex items-center gap-8">
              <span className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest cursor-pointer">Docs</span>
              <span className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest cursor-pointer">Support</span>
              <span className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest cursor-pointer">Privacy</span>
            </div>
          </div>
        </footer>

        {/* Global Alert Overlay */}
        <AlertOverlay alerts={alerts} onComplete={removeAlert} />
      </div>
    </div>
  );
}
