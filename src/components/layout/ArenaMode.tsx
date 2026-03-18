import React, { useState } from 'react';
import { format } from 'date-fns';
import { Settings, LayoutDashboard, ShieldAlert, Settings2, X } from 'lucide-react';
import { DashboardMode, DashboardStats, SedeStats, Configuration, Commercial } from '../../types';
import { ArenaHeroKPI, ArenaLeaderboard, ArenaLiveStats, ArenaGamification, ArenaPerformers, ArenaCommercials } from '../ArenaComponents';
import { AlertOverlay } from '../AlertOverlay';

interface ArenaModeProps {
    stats: DashboardStats;
    sedeStats: SedeStats[];
    config: Configuration;
    setConfig: React.Dispatch<React.SetStateAction<Configuration>>;
    alerts: { id: string; contactId: string; sede: string }[];
    removeAlert: (id: string) => void;
    setMode: (mode: DashboardMode) => void;
    arenaHighlights: any;
}

export function ArenaMode({
    stats,
    sedeStats,
    config,
    setConfig,
    alerts,
    removeAlert,
    setMode,
    arenaHighlights
}: ArenaModeProps) {
    const [showSettings, setShowSettings] = useState(false);
    const [editingSede, setEditingSede] = useState<string | null>(null);
    const [newImageUrl, setNewImageUrl] = useState('');

    return (
        <div className="min-h-screen bg-black text-white p-10 overflow-hidden font-sans selection:bg-emerald-500/30">
            {/* Arena Header */}
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl shadow-emerald-900/40 border-2 border-emerald-500/20">
                        <img
                            src="https://pics.filmaffinity.com/WALL_E-667246709-large.jpg"
                            alt="Company Logo"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">Arena Comercial</h1>
                        <div className="flex items-center gap-3 text-zinc-500 mt-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-sm font-bold uppercase tracking-widest">Live Performance Feed</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <div className="text-3xl font-black tabular-nums">{format(new Date(), 'HH:mm:ss')}</div>
                        <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{format(new Date(), 'EEEE, MMMM do')}</div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowSettings(true)}
                            className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
                            title="Configuración Global de Imágenes"
                        >
                            <Settings className="w-8 h-8 text-zinc-400 group-hover:text-amber-500" />
                        </button>
                        <button
                            onClick={() => setMode('analytical')}
                            className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all group"
                            title="Modo Analítico"
                        >
                            <LayoutDashboard className="w-8 h-8 text-zinc-400 group-hover:text-white" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Arena Grid */}
            <div className="grid grid-cols-12 gap-8 h-[calc(100vh-200px)]">
                {/* Left Column: Leaderboard */}
                <div className="col-span-4">
                    <ArenaLeaderboard
                        sedes={sedeStats}
                        sedeImages={config.sedeImages}
                    />
                </div>

                {/* Center Column: Hero KPI & Live Stats */}
                <div className="col-span-5 flex flex-col gap-8">
                    <ArenaHeroKPI stats={stats} />
                    <ArenaLiveStats stats={stats} />
                </div>

                {/* Right Column: Alerts & Gamification */}
                <div className="col-span-3 flex flex-col gap-8">
                    <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-8 backdrop-blur-xl flex-1">
                        <h3 className="text-zinc-100 text-xl font-bold flex items-center gap-3 mb-6 uppercase tracking-wider">
                            <ShieldAlert className="w-6 h-6 text-rose-500" />
                            Alertas Críticas
                        </h3>
                        <div className="space-y-4">
                            {stats.errorRate > 10 && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500">
                                    <p className="text-xs font-bold uppercase tracking-widest mb-1">Error Rate Spike</p>
                                    <p className="text-sm font-medium">Tasa de error superior al 10% detectada.</p>
                                </div>
                            )}
                            {stats.avgResponseTime > 8 && (
                                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500">
                                    <p className="text-xs font-bold uppercase tracking-widest mb-1">Response Delay</p>
                                    <p className="text-sm font-medium">Tiempo de respuesta lento detectado.</p>
                                </div>
                            )}
                            {stats.humanEscalationRate > 20 && (
                                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-500">
                                    <p className="text-xs font-bold uppercase tracking-widest mb-1">High Escalation</p>
                                    <p className="text-sm font-medium">Volumen inusual de escalados humanos.</p>
                                </div>
                            )}
                            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500">
                                <p className="text-xs font-bold uppercase tracking-widest mb-1">System Health</p>
                                <p className="text-sm font-medium">Todos los nodos operando correctamente.</p>
                            </div>
                        </div>
                    </div>

                    <ArenaGamification highlights={arenaHighlights} />
                    <ArenaPerformers highlights={arenaHighlights} />
                    <ArenaCommercials commercials={config.commercials} />
                </div>
            </div>

            {/* Arena Footer */}
            <div className="fixed bottom-10 left-10 right-10 flex items-center justify-between text-zinc-600">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span className="text-xs font-bold uppercase tracking-widest">Database Connected</span>
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest">v2.4.0-STABLE</div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">TV Optimized</div>
                    <div className="px-3 py-1 bg-white/5 rounded-lg text-[10px] font-black uppercase tracking-[0.2em]">Auto-Refresh ON</div>
                </div>
            </div>

            {/* Settings Modal */}
            {showSettings && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowSettings(false)} />
                    <div className="relative bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 w-full max-w-2xl shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <Settings2 className="w-8 h-8 text-amber-500" />
                                Configuración de Imágenes
                            </h2>
                            <button
                                onClick={() => setShowSettings(false)}
                                className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {Object.entries(config.sedeImages).map(([sede, url]) => (
                                <div key={sede} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800">
                                            <img src={url} alt={sede} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-lg">{sede}</div>
                                            <div className="text-xs text-zinc-500 truncate">{url}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setEditingSede(sede);
                                            setNewImageUrl(url);
                                        }}
                                        className="px-4 py-2 bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-black rounded-xl font-bold transition-all text-sm ml-4"
                                    >
                                        Editar
                                    </button>
                                </div>
                            ))}
                        </div>

                        {editingSede && (
                            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingSede(null)} />
                                <div className="relative bg-zinc-800 border border-white/10 rounded-3xl p-8 w-full max-w-md shadow-2xl">
                                    <h3 className="text-xl font-bold mb-4">Editar Imagen: {editingSede}</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 block">URL de la Imagen</label>
                                            <input
                                                type="text"
                                                value={newImageUrl}
                                                onChange={(e) => setNewImageUrl(e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => setEditingSede(null)}
                                                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (editingSede) {
                                                        setConfig(prev => ({
                                                            ...prev,
                                                            sedeImages: {
                                                                ...prev.sedeImages,
                                                                [editingSede]: newImageUrl
                                                            }
                                                        }));
                                                        setEditingSede(null);
                                                    }
                                                }}
                                                className="flex-1 px-4 py-3 bg-amber-500 text-black rounded-xl font-bold hover:bg-amber-400 transition-colors"
                                            >
                                                Guardar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Global Alert Overlay */}
            <AlertOverlay alerts={alerts} onComplete={removeAlert} />
        </div>
    );
}
