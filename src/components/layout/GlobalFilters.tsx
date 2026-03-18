import React from 'react';
import { Settings2 } from 'lucide-react';

interface GlobalFiltersProps {
    sedes: string[];
    intents: string[];
    selectedSede: string;
    setSelectedSede: (val: string) => void;
    selectedIntent: string;
    setSelectedIntent: (val: string) => void;
    dateRange: string;
    setDateRange: (val: string) => void;
    customStartDate: string;
    setCustomStartDate: (val: string) => void;
    customEndDate: string;
    setCustomEndDate: (val: string) => void;
}

export function GlobalFilters({
    sedes,
    intents,
    selectedSede, setSelectedSede,
    selectedIntent, setSelectedIntent,
    dateRange, setDateRange,
    customStartDate, setCustomStartDate,
    customEndDate, setCustomEndDate
}: GlobalFiltersProps) {
    return (
        <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm mb-10 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-100 rounded-lg">
                    <Settings2 className="w-5 h-5 text-zinc-500" />
                </div>
                <span className="text-sm font-black uppercase tracking-widest text-zinc-400">Filtros Globales</span>
            </div>

            <div className="flex-1 flex flex-wrap items-center gap-4">
                <select
                    value={selectedSede}
                    onChange={(e) => setSelectedSede(e.target.value)}
                    className="px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-zinc-900/5 outline-none cursor-pointer"
                >
                    {sedes.map(s => <option key={s} value={s}>Sede: {s}</option>)}
                </select>

                <select
                    value={selectedIntent}
                    onChange={(e) => setSelectedIntent(e.target.value)}
                    className="px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-zinc-900/5 outline-none cursor-pointer"
                >
                    {intents.map(i => <option key={i} value={i}>Intent: {i}</option>)}
                </select>

                <div className="flex items-center gap-2">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-zinc-900/5 outline-none cursor-pointer"
                    >
                        <option value="All">All Time</option>
                        <option value="Last 7 Days">Last 7 Days</option>
                        <option value="Last 30 Days">Last 30 Days</option>
                        <option value="Custom">Custom Range</option>
                    </select>

                    {dateRange === 'Custom' && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                            <input
                                type="date"
                                value={customStartDate}
                                onChange={(e) => setCustomStartDate(e.target.value)}
                                className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none"
                            />
                            <span className="text-zinc-400 font-bold">to</span>
                            <input
                                type="date"
                                value={customEndDate}
                                onChange={(e) => setCustomEndDate(e.target.value)}
                                className="px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none"
                            />
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={() => {
                    setSelectedSede('All');
                    setSelectedIntent('All');
                    setDateRange('All');
                    setCustomStartDate('');
                    setCustomEndDate('');
                }}
                className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors"
            >
                Limpiar Filtros
            </button>
        </div>
    );
}
