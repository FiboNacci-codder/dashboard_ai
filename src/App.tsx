/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { 
  Menu,
  X,
  UserPlus,
  Trash2,
  Image as ImageIcon,
  Users, 
  MessageSquare, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  Download, 
  RefreshCw,
  ChevronDown,
  Activity,
  MapPin,
  Calendar,
  CheckCircle2,
  Star,
  Monitor,
  LayoutDashboard,
  Trophy,
  Zap,
  ShieldAlert,
  Smile,
  Settings2,
  Settings,
  Maximize2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { format, parseISO, isWithinInterval, subDays } from 'date-fns';
import { fetchSheetData } from './services/sheetService';
import { ContactData, DashboardMode, AnalyticalTab, Commercial, Configuration } from './types';
import { Card, StatCard } from './components/Card';
import { ArenaHeroKPI, ArenaLeaderboard, ArenaLiveStats, ArenaGamification, ArenaPerformers, ArenaCommercials } from './components/ArenaComponents';
import { calculateDashboardStats, calculateSedeStats, calculateIntentStats, getArenaHighlights } from './utils/dataProcessing';
import { cn } from './lib/utils';
import { AlertOverlay } from './components/AlertOverlay';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function App() {
  const [data, setData] = useState<ContactData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [mode, setMode] = useState<DashboardMode>('analytical');
  const [activeTab, setActiveTab] = useState<AnalyticalTab>('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Configuration State
  const [config, setConfig] = useState<Configuration>(() => {
    const saved = localStorage.getItem('dashboard_config');
    const defaultSedeImages = {
      'Trujillo': 'https://picsum.photos/seed/trujillo/200',
      'Arequipa': 'https://picsum.photos/seed/arequipa/200',
      'Puno': 'https://picsum.photos/seed/puno/200',
      'Cusco': 'https://picsum.photos/seed/cusco/200',
      'Lima': 'https://picsum.photos/seed/lima/200'
    };
    
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        sedeImages: parsed.sedeImages || defaultSedeImages
      };
    }
    
    return {
      commercials: [
        { id: '1', name: 'Carlos Ruiz', photoUrl: 'https://picsum.photos/seed/carlos/200', sede: 'Madrid' },
        { id: '2', name: 'Elena Sanz', photoUrl: 'https://picsum.photos/seed/elena/200', sede: 'Barcelona' },
        { id: '3', name: 'Marcos Gil', photoUrl: 'https://picsum.photos/seed/marcos/200', sede: 'Valencia' },
        { id: '4', name: 'Lucia Rey', photoUrl: 'https://picsum.photos/seed/lucia/200', sede: 'Sevilla' },
      ],
      sedeImages: defaultSedeImages
    };
  });

  useEffect(() => {
    localStorage.setItem('dashboard_config', JSON.stringify(config));
  }, [config]);

  // Filters
  const [selectedSede, setSelectedSede] = useState<string>('All');
  const [selectedIntent, setSelectedIntent] = useState<string>('All');
  const [dateRange, setDateRange] = useState<string>('All');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [editingSede, setEditingSede] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Notifications State
  const [alerts, setAlerts] = useState<{ id: string; contactId: string; sede: string }[]>([]);
  const previousDataIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (data.length > 0) {
      // On first load, just populate the set to avoid initial flood of alerts
      if (previousDataIds.current.size === 0) {
        data.forEach(item => previousDataIds.current.add(item.ID_contacto));
        return;
      }

      // Find new items that weren't in the previous sync
      const newItems = data.filter(item => !previousDataIds.current.has(item.ID_contacto));
      
      // Check for Mensaje_incorrecto === 1 in the new items
      newItems.forEach(item => {
        if (item.Mensaje_incorrecto === 1) {
          setAlerts(prev => [...prev, { 
            id: Math.random().toString(36).substring(2, 9), 
            contactId: item.ID_contacto, 
            sede: item.Sede 
          }]);
        }
        // Add to the set so we don't alert for this ID again
        previousDataIds.current.add(item.ID_contacto);
      });
    }
  }, [data]);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Auto-refresh for Arena Mode
  useEffect(() => {
    if (mode === 'arena') {
      const interval = setInterval(() => {
        setRefreshKey(prev => prev + 1);
      }, 30000); // Refresh every 30 seconds in Arena mode
      return () => clearInterval(interval);
    }
  }, [mode]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const sheetData = await fetchSheetData();
        setData(sheetData);
        setError(null);
      } catch (err) {
        setError('Failed to load data from Google Sheets.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshKey]);

  // Derived data
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSede = selectedSede === 'All' || item.Sede === selectedSede;
      const matchesIntent = selectedIntent === 'All' || item.Intent_detectado === selectedIntent;
      
      let matchesDate = true;
      if (dateRange !== 'All') {
        const date = parseISO(item.Fecha_registro);
        const now = new Date();
        if (dateRange === 'Last 7 Days') {
          matchesDate = isWithinInterval(date, { start: subDays(now, 7), end: now });
        } else if (dateRange === 'Last 30 Days') {
          matchesDate = isWithinInterval(date, { start: subDays(now, 30), end: now });
        } else if (dateRange === 'Custom' && customStartDate && customEndDate) {
          matchesDate = isWithinInterval(date, { 
            start: parseISO(customStartDate), 
            end: parseISO(customEndDate) 
          });
        }
      }
      
      return matchesSede && matchesIntent && matchesDate;
    });
  }, [data, selectedSede, selectedIntent, dateRange]);

  const stats = useMemo(() => calculateDashboardStats(filteredData), [filteredData]);
  const sedeStats = useMemo(() => calculateSedeStats(filteredData), [filteredData]);
  const intentStats = useMemo(() => calculateIntentStats(filteredData), [filteredData]);
  const arenaHighlights = useMemo(() => getArenaHighlights(sedeStats), [sedeStats]);

  const sedes = useMemo(() => ['All', ...new Set(data.map(item => item.Sede))], [data]);
  const intents = useMemo(() => ['All', ...new Set(data.map(item => item.Intent_detectado))], [data]);

  if (loading && data.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <Activity className="w-8 h-8 text-emerald-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-zinc-400 font-bold uppercase tracking-[0.3em] animate-pulse">Initializing Arena</p>
        </div>
      </div>
    );
  }

  if (mode === 'arena') {
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

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans flex">
      {/* Sidebar Navigation */}
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
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'performance', label: 'Performance', icon: Zap },
            { id: 'errors', label: 'Errores y Fallas', icon: ShieldAlert },
            { id: 'experience', label: 'User Experience', icon: Smile },
            { id: 'operations', label: 'Operaciones', icon: Settings2 },
          ].map((tab) => (
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

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 transition-all duration-300 flex flex-col",
        isSidebarOpen ? "ml-72" : "ml-20"
      )}>
        {/* Analytical Header */}
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
                onClick={() => setRefreshKey(prev => prev + 1)}
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

        <main className="max-w-[1600px] mx-auto px-8 py-10 w-full">
          {/* Global Filters */}
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

          {/* Tab Content */}
          <div className="space-y-10">
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Conversaciones" value={stats.totalContacts} icon={<MessageSquare className="w-6 h-6" />} />
                <StatCard label="Accuracy" value={`${stats.messageAccuracy}%`} icon={<CheckCircle2 className="w-6 h-6" />} />
                <StatCard label="Satisfacción Media" value={stats.avgSatisfaction} icon={<Star className="w-6 h-6" />} />
                <StatCard label="Health Score" value={`${stats.healthScore}%`} icon={<Activity className="w-6 h-6" />} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Volumen por Sede" subtitle="Distribución geográfica de contactos">
                  <div className="h-[350px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sedeStats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="contacts" fill="#18181b" radius={[8, 8, 0, 0]} barSize={50} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card title="Tendencia de Rendimiento" subtitle="Evolución del Health Score">
                  <div className="h-[350px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={filteredData.slice(-20)}>
                        <defs>
                          <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                        <XAxis dataKey="Fecha_registro" hide />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                        <Area type="monotone" dataKey="Confianza_modelo" stroke="#10b981" strokeWidth={3} fill="url(#colorHealth)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Accuracy por Intent" className="lg:col-span-2">
                  <div className="h-[400px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={intentStats} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f1f1" />
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} width={120} />
                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                        <Bar dataKey="accuracy" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <div className="space-y-8">
                  <Card title="Confianza Media">
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="text-6xl font-black text-zinc-900">{stats.avgConfidence}%</div>
                      <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2">Model Confidence</p>
                    </div>
                  </Card>
                  <Card title="Eficiencia de Respuesta">
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="text-6xl font-black text-zinc-900">{stats.avgResponseTime}s</div>
                      <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2">Avg Response Time</p>
                    </div>
                  </Card>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Volumen de Mensajes por Intent">
                  <div className="h-[350px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={intentStats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card title="Distribución de Escalado">
                  <div className="h-[350px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Resuelto por Bot', value: 100 - stats.humanEscalationRate },
                            { name: 'Escalado Humano', value: stats.humanEscalationRate }
                          ]}
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          <Cell fill="#10b981" />
                          <Cell fill="#f59e0b" />
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Intents con más Errores" subtitle="Volumen de mensajes incorrectos">
                  <div className="h-[400px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={intentStats.filter(i => i.errorCount > 0)}
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="errorCount"
                          nameKey="name"
                        >
                          {intentStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card title="Tasa de Error por Sede">
                  <div className="space-y-6 mt-6">
                    {sedeStats.map(sede => (
                      <div key={sede.name}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-bold">{sede.name}</span>
                          <span className="text-sm font-black text-rose-600">{(100 - sede.accuracy).toFixed(1)}%</span>
                        </div>
                        <div className="w-full h-3 bg-zinc-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-rose-500 rounded-full" 
                            style={{ width: `${100 - sede.accuracy}%` }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
              
              <Card title="Detalle de Errores por Intent">
                <div className="overflow-x-auto mt-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-100">
                        <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-400">Intent</th>
                        <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-400">Total Contactos</th>
                        <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-400">Mensajes Incorrectos</th>
                        <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-400">Accuracy</th>
                        <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-400">Impacto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {intentStats.map((intent) => (
                        <tr key={intent.name} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                          <td className="py-4 font-bold text-zinc-900 capitalize">{intent.name.replace('_', ' ')}</td>
                          <td className="py-4 text-sm text-zinc-600">{intent.count}</td>
                          <td className="py-4 text-sm font-bold text-rose-600">{intent.errorCount}</td>
                          <td className="py-4">
                            <span className={cn(
                              "px-2 py-1 rounded-md text-xs font-black",
                              intent.accuracy > 90 ? "bg-emerald-100 text-emerald-700" : 
                              intent.accuracy > 70 ? "bg-amber-100 text-amber-700" : 
                              "bg-rose-100 text-rose-700"
                            )}>
                              {intent.accuracy}%
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="w-24 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-zinc-900" 
                                style={{ width: `${(intent.errorCount / stats.totalMessages) * 1000}%` }} 
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Satisfacción por Sede">
                  <div className="h-[400px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={sedeStats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                        <YAxis domain={[0, 5]} axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Bar dataKey="satisfaction" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card title="Distribución de Satisfacción">
                  <div className="flex flex-col items-center justify-center h-full py-10">
                    <div className="flex items-center gap-2 mb-8">
                      {[1, 2, 3, 4, 5].map(star => (
                        <Star 
                          key={star} 
                          className={cn(
                            "w-12 h-12",
                            star <= Math.round(stats.avgSatisfaction) ? "text-amber-400 fill-amber-400" : "text-zinc-200"
                          )} 
                        />
                      ))}
                    </div>
                    <div className="text-center">
                      <div className="text-7xl font-black text-zinc-900">{stats.avgSatisfaction}</div>
                      <p className="text-zinc-500 font-bold uppercase tracking-widest mt-2 text-xl">Average Rating</p>
                    </div>
                  </div>
                </Card>
              </div>

              <Card title="Tendencia de Satisfacción" subtitle="Evolución diaria del CSAT">
                <div className="h-[350px] w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={filteredData.slice(-30)}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis dataKey="Fecha_registro" hide />
                      <YAxis domain={[0, 5]} axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="Satisfaccion_usuario" stroke="#f59e0b" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'operations' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Tasa de Escalado por Sede">
                  <div className="h-[400px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sedeStats}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                        <YAxis axisLine={false} tickLine={false} />
                        <Tooltip />
                        <Line type="monotone" dataKey="escalationRate" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
                <Card title="Resumen Operativo">
                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-200">
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Total Escalados</p>
                      <div className="text-4xl font-black text-zinc-900">
                        {Math.round(stats.totalContacts * (stats.humanEscalationRate / 100))}
                      </div>
                    </div>
                    <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-200">
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Escalation Rate</p>
                      <div className="text-4xl font-black text-zinc-900">{stats.humanEscalationRate}%</div>
                    </div>
                    <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-200">
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Avg Conv Time</p>
                      <div className="text-4xl font-black text-zinc-900">{stats.avgConversationTime}s</div>
                    </div>
                    <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-200">
                      <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Messages/Conv</p>
                      <div className="text-4xl font-black text-zinc-900">
                        {(stats.totalMessages / stats.totalContacts).toFixed(1)}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              <Card title="Eficiencia Operativa: Tiempo de Conversación vs Respuesta">
                <div className="h-[400px] w-full mt-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={sedeStats}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} />
                      <YAxis axisLine={false} tickLine={false} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="avgResponseTime" name="Tiempo Respuesta (s)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="avgConversationTime" name="Tiempo Conversación (s)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>
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
            <a href="#" className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest">Docs</a>
            <a href="#" className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest">Support</a>
            <a href="#" className="text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors uppercase tracking-widest">Privacy</a>
          </div>
        </div>
      </footer>

      {/* Global Alert Overlay */}
      <AlertOverlay alerts={alerts} onComplete={removeAlert} />
    </div>
  </div>
);
}
