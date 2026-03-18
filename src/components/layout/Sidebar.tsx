import React from 'react';
import { Menu, X, LayoutDashboard, Zap, ShieldAlert, Smile, Settings2 } from 'lucide-react';
import { AnalyticalTab } from '../../types';
import { cn } from '../../lib/utils';

interface SidebarProps {
    isSidebarOpen: boolean;
    setIsSidebarOpen: (isOpen: boolean) => void;
    activeTab: AnalyticalTab;
    setActiveTab: (tab: AnalyticalTab) => void;
}

export function Sidebar({ isSidebarOpen, setIsSidebarOpen, activeTab, setActiveTab }: SidebarProps) {
    const tabs = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'performance', label: 'Performance', icon: Zap },
        { id: 'errors', label: 'Errores y Fallas', icon: ShieldAlert },
        { id: 'experience', label: 'User Experience', icon: Smile },
        { id: 'operations', label: 'Operaciones', icon: Settings2 },
    ];

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-50 bg-zinc-900 text-white transition-all duration-300 flex flex-col shadow-2xl shadow-zinc-950/50",
                isSidebarOpen ? "w-72" : "w-20"
            )}
        >
            <div className="p-6 flex items-center justify-between border-b border-white/5">
                {isSidebarOpen ? (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-emerald-500/20">
                            <img
                                src="https://pics.filmaffinity.com/WALL_E-667246709-large.jpg"
                                alt="Logo"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                            />
                        </div>
                        <span className="text-lg font-black tracking-tighter uppercase italic">Analytics</span>
                    </div>
                ) : (
                    <div className="w-10 h-10 rounded-xl overflow-hidden mx-auto">
                        <img
                            src="https://pics.filmaffinity.com/WALL_E-667246709-large.jpg"
                            alt="Logo"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                )}
            </div>

            <nav className="flex-1 py-8 px-4 space-y-2 overflow-y-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as AnalyticalTab)}
                        className={cn(
                            "w-full flex items-center gap-4 px-4 py-4 rounded-2xl font-bold transition-all group relative",
                            activeTab === tab.id
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                        )}
                    >
                        <tab.icon className={cn("w-6 h-6 shrink-0", activeTab === tab.id ? "text-white" : "text-zinc-500 group-hover:text-zinc-300")} />
                        {isSidebarOpen && <span className="truncate">{tab.label}</span>}
                        {!isSidebarOpen && activeTab === tab.id && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-emerald-500 rounded-l-full" />
                        )}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-white/5">
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="w-full flex items-center justify-center p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-zinc-500 hover:text-white"
                >
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>
        </aside>
    );
}
