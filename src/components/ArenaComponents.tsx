/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Trophy, TrendingUp, TrendingDown, MapPin, AlertTriangle, CheckCircle2, Clock, Activity, User, Settings } from 'lucide-react';
import { SedeStats, DashboardStats, Commercial } from '../types';
import { cn } from '../lib/utils';

export function ArenaCommercials({ commercials }: { commercials: Commercial[] }) {
  if (!commercials || commercials.length === 0) return null;

  return (
    <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-8 backdrop-blur-xl">
      <h3 className="text-zinc-100 text-xl font-bold flex items-center gap-3 mb-6 uppercase tracking-wider">
        <User className="w-6 h-6 text-blue-500" />
        Equipo Comercial
      </h3>
      <div className="grid grid-cols-4 gap-4">
        {commercials.map((commercial) => (
          <div key={commercial.id} className="flex flex-col items-center gap-2 group">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-emerald-500 transition-all duration-300">
                {commercial.photoUrl ? (
                  <img 
                    src={commercial.photoUrl} 
                    alt={commercial.name} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                    <User className="w-8 h-8 text-zinc-600" />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center border-2 border-black">
                <span className="text-[10px] font-black text-white uppercase">{commercial.sede.substring(0, 2)}</span>
              </div>
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest text-center truncate w-full">
              {commercial.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArenaHeroKPI({ stats }: { stats: DashboardStats }) {
  const getStatusColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-zinc-900/50 rounded-3xl border border-white/5 backdrop-blur-xl">
      <h3 className="text-zinc-500 text-xl font-bold uppercase tracking-[0.2em] mb-4">Health Score Global</h3>
      <div className={cn("text-[12rem] font-black leading-none tracking-tighter tabular-nums", getStatusColor(stats.healthScore))}>
        {stats.healthScore}%
      </div>
      <div className="flex items-center gap-4 mt-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
          <TrendingUp className="w-5 h-5" />
          <span className="font-bold">+2.4% vs ayer</span>
        </div>
        <div className="text-zinc-400 font-medium">Objetivo: 85%</div>
      </div>
    </div>
  );
}

export function ArenaLeaderboard({ sedes, sedeImages }: { 
  sedes: SedeStats[], 
  sedeImages: Record<string, string>
}) {
  return (
    <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-8 backdrop-blur-xl h-full">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-zinc-100 text-2xl font-bold flex items-center gap-3">
          <Trophy className="w-8 h-8 text-amber-500" />
          Ranking por Sede
        </h3>
        <span className="text-zinc-500 font-mono">LIVE UPDATING</span>
      </div>
      <div className="space-y-4">
        {sedes.slice(0, 5).map((sede, index) => (
          <div 
            key={sede.name} 
            className={cn(
              "flex items-center justify-between p-5 rounded-2xl border transition-all duration-500 group relative",
              index === 0 ? "bg-amber-500/10 border-amber-500/30 scale-[1.02]" : "bg-white/5 border-white/5"
            )}
          >
            <div className="flex items-center gap-6">
              <span className={cn(
                "text-3xl font-black w-8",
                index === 0 ? "text-amber-500" : "text-zinc-600"
              )}>
                0{index + 1}
              </span>
              
              <div className="relative">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-800 border border-white/10">
                  {sedeImages[sede.name] ? (
                    <img 
                      src={sedeImages[sede.name]} 
                      alt={sede.name} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <MapPin className="w-8 h-8 text-zinc-600" />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold text-white">{sede.name}</h4>
                <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">{sede.contacts} contactos</p>
              </div>
            </div>
            <div className="text-right">
              <div className={cn(
                "text-2xl font-black tabular-nums",
                sede.healthScore >= 80 ? "text-emerald-500" : "text-amber-500"
              )}>
                {sede.healthScore}%
              </div>
              <div className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Performance</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArenaLiveStats({ stats }: { stats: DashboardStats }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-zinc-500 mb-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-widest">Accuracy</span>
        </div>
        <div className="text-4xl font-black text-white tabular-nums">{stats.messageAccuracy}%</div>
      </div>
      <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-zinc-500 mb-2">
          <Clock className="w-5 h-5 text-blue-500" />
          <span className="text-xs font-bold uppercase tracking-widest">Avg Response</span>
        </div>
        <div className="text-4xl font-black text-white tabular-nums">{stats.avgResponseTime}s</div>
      </div>
      <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-zinc-500 mb-2">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <span className="text-xs font-bold uppercase tracking-widest">Escalations</span>
        </div>
        <div className="text-4xl font-black text-white tabular-nums">{stats.humanEscalationRate}%</div>
      </div>
      <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3 text-zinc-500 mb-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-widest">Satisfaction</span>
        </div>
        <div className="text-4xl font-black text-white tabular-nums">{stats.avgSatisfaction}</div>
      </div>
    </div>
  );
}

export function ArenaGamification({ highlights }: { highlights: any }) {
  if (!highlights) return null;

  return (
    <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-8 backdrop-blur-xl">
      <h3 className="text-zinc-100 text-xl font-bold flex items-center gap-3 mb-6 uppercase tracking-wider">
        <Trophy className="w-6 h-6 text-amber-500" />
        Hitos del Día
      </h3>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500 border border-amber-500/30">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Ganador de Hoy</p>
            <p className="text-lg font-black text-white uppercase">{highlights.winner.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Mejor Respuesta</p>
            <p className="text-lg font-black text-white uppercase">{highlights.fastestResponse.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Racha de Precisión</p>
            <p className="text-lg font-black text-white uppercase">{highlights.mostSatisfied.name}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArenaPerformers({ highlights }: { highlights: any }) {
  if (!highlights) return null;

  return (
    <div className="bg-zinc-900/50 rounded-3xl border border-white/5 p-8 backdrop-blur-xl">
      <h3 className="text-zinc-100 text-xl font-bold flex items-center gap-3 mb-6 uppercase tracking-wider">
        <Activity className="w-6 h-6 text-emerald-500" />
        Extremos de Rendimiento
      </h3>
      <div className="grid grid-cols-2 gap-6">
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Top Performer</span>
          </div>
          <p className="text-xl font-black text-white uppercase truncate">{highlights.winner.name}</p>
          <p className="text-emerald-500 text-sm font-bold mt-1">{highlights.winner.healthScore}% Score</p>
        </div>
        <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <TrendingDown className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Bajo Rendimiento</span>
          </div>
          <p className="text-xl font-black text-white uppercase truncate">{highlights.underperformer.name}</p>
          <p className="text-rose-500 text-sm font-bold mt-1">{highlights.underperformer.healthScore}% Score</p>
        </div>
      </div>
    </div>
  );
}
