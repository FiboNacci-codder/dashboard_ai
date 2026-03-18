import React from 'react';
import { LayoutDashboard, Monitor, RefreshCw, Download } from 'lucide-react';
import { DashboardMode, AnalyticalTab } from '../../types';
import { cn } from '../../lib/utils';

interface HeaderProps {
    activeTab: AnalyticalTab;
    mode: DashboardMode;
    setMode: (mode: DashboardMode) => void;
    triggerRefresh: () => void;
    loading: boolean;
}

export function Header({ activeTab, mode, setMode, triggerRefresh, loading }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-8 py-5">
            <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-zinc-900 capitalize">
                        {activeTab.replace('_', ' ')}
                    </h1>
                    <p className="text-sm text-zinc-500 font-medium">Operational & Strategic Insights</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-zinc-100 p-1 rounded-xl flex items-center">
                        <button
                            onClick={() => setMode('analytical')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                mode === 'analytical' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Analítico
                        </button>
                        <button
                            onClick={() => setMode('arena')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                                mode === 'arena' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            <Monitor className="w-4 h-4" />
                            Modo Arena
                        </button>
                    </div>
                    <div className="h-8 w-px bg-zinc-200 mx-2" />
                    <button
                        onClick={triggerRefresh}
                        className="p-3 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all border border-zinc-200 bg-white"
                    >
                        <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200">
                        <Download className="w-4 h-4" />
                        <span>Export Data</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
