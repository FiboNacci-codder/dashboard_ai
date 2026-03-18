import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, AreaChart, Area } from 'recharts';
import { Card } from '../Card';
import { DashboardStats, SedeStats, ContactData } from '../../types';

interface OperationsTabProps {
    stats: DashboardStats;
    sedeStats: SedeStats[];
    filteredData: ContactData[];
}

export function OperationsTab({ stats, sedeStats, filteredData }: OperationsTabProps) {
    // Simulate Cost Saved based on human escalation rate (Assuming $15 USD / hour and avg 10 min per issue)
    const COST_PER_TICKET = 2.5; // $2.5 dollars per human interaction
    const totalResolvedByBot = Math.round(stats.totalContacts * ((100 - stats.humanEscalationRate) / 100));
    const estimatedCostSaved = totalResolvedByBot * COST_PER_TICKET;

    // Simulate SLA Compliance (Percentage of contacts with response time < 10s)
    const slaCompliance = filteredData.length > 0
        ? (filteredData.filter(d => d.Tiempo_respuesta_segundos < 10).length / filteredData.length) * 100
        : 0;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Resumen Operativo y Financiero">
                    <div className="grid grid-cols-2 gap-6 mt-6">
                        <div className="p-8 bg-emerald-50 rounded-3xl border border-emerald-200">
                            <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2">Costo Ahorrado</p>
                            <div className="text-4xl font-black text-emerald-900">
                                ${estimatedCostSaved.toLocaleString()}
                            </div>
                        </div>
                        <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-200">
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">SLA Compliance &lt; 10s</p>
                            <div className="text-4xl font-black text-zinc-900">{slaCompliance.toFixed(1)}%</div>
                        </div>
                        <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-200">
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Total Escalados</p>
                            <div className="text-4xl font-black text-zinc-900">
                                {Math.round(stats.totalContacts * (stats.humanEscalationRate / 100))}
                            </div>
                        </div>
                        <div className="p-8 bg-zinc-50 rounded-3xl border border-zinc-200">
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-widest mb-2">Tasa de Escalado</p>
                            <div className="text-4xl font-black text-zinc-900">{stats.humanEscalationRate}%</div>
                        </div>
                    </div>
                </Card>

                <Card title="Tasa de Escalado por Sede">
                    <div className="h-[350px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={sedeStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Line type="monotone" dataKey="escalationRate" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} />
                            </LineChart>
                        </ResponsiveContainer>
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
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                            <Legend />
                            <Bar dataKey="avgResponseTime" name="Tiempo Respuesta (s)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="avgConversationTime" name="Tiempo Conversación (s)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
}
