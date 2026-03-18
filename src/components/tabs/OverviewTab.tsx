import React from 'react';
import { MessageSquare, CheckCircle2, Star, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell, Legend } from 'recharts';
import { Card, StatCard } from '../Card';
import { DashboardStats, SedeStats, ContactData } from '../../types';

interface OverviewTabProps {
    stats: DashboardStats;
    sedeStats: SedeStats[];
    filteredData: ContactData[];
}

export function OverviewTab({ stats, sedeStats, filteredData }: OverviewTabProps) {
    // Simulate Heatmap data for activity by hour
    const activityByHour = Array.from({ length: 24 }).map((_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        intensity: Math.floor(Math.random() * 100) + 20
    }));

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard label="Total Conversaciones" value={stats.totalContacts} icon={<MessageSquare className="w-6 h-6" />} />
                <StatCard label="Accuracy" value={`${stats.messageAccuracy}%`} icon={<CheckCircle2 className="w-6 h-6" />} />
                <StatCard label="Satisfacción Media" value={stats.avgSatisfaction} icon={<Star className="w-6 h-6" />} />
                <StatCard label="Health Score" value={`${stats.healthScore}%`} icon={<Activity className="w-6 h-6" />} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Volumen y Accuracy por Sede" subtitle="Mensajes correctos vs incorrectos">
                    <div className="h-[350px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sedeStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                <Legend />
                                <Bar dataKey="contacts" name="Correctos" stackId="a" fill="#10b981" radius={[0, 0, 4, 4]} barSize={50} />
                                <Bar
                                    dataKey={(d) => Math.round(d.contacts * (100 - d.accuracy) / 100)}
                                    name="Incorrectos"
                                    stackId="a"
                                    fill="#ef4444"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Mapa de Calor de Actividad" subtitle="Volumen de interacción por hora (Simulado)">
                    <div className="h-[350px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={activityByHour}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} interval={2} />
                                <YAxis axisLine={false} tickLine={false} hide />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} labelStyle={{ color: '#000', fontWeight: 'bold' }} />
                                <Bar dataKey="intensity" fill="#18181b" radius={[4, 4, 0, 0]}>
                                    {activityByHour.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.intensity > 80 ? '#3b82f6' : entry.intensity > 50 ? '#93c5fd' : '#e0e7ff'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card title="Tendencia de Rendimiento" subtitle="Evolución del Health Score">
                <div className="h-[350px] w-full mt-6">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={filteredData.slice(-20)}>
                            <defs>
                                <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
    );
}
