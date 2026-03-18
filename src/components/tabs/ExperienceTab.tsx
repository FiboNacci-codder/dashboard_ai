import React from 'react';
import { Star } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card } from '../Card';
import { DashboardStats, SedeStats, ContactData } from '../../types';
import { cn } from '../../lib/utils';

interface ExperienceTabProps {
    stats: DashboardStats;
    sedeStats: SedeStats[];
    filteredData: ContactData[];
}

export function ExperienceTab({ stats, sedeStats, filteredData }: ExperienceTabProps) {
    // Simulate Cohort/Retention based on a fixed ratio for visual purpose
    const retentionData = [
        { name: 'Usuarios Recurrentes', value: Math.round(stats.totalContacts * 0.35) },
        { name: 'Usuarios Nuevos', value: Math.round(stats.totalContacts * 0.65) }
    ];

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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

                <Card title="Satisfacción por Sede" className="lg:col-span-2">
                    <div className="h-[300px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={sedeStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 700 }} />
                                <YAxis domain={[0, 5]} axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Bar dataKey="satisfaction" fill="#f59e0b" radius={[8, 8, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Tendencia de Satisfacción" subtitle="Evolución diaria del CSAT" className="lg:col-span-2">
                    <div className="h-[350px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={filteredData.slice(-30)}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                <XAxis dataKey="Fecha_registro" hide />
                                <YAxis domain={[0, 5]} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Line type="monotone" dataKey="Satisfaccion_usuario" stroke="#f59e0b" strokeWidth={3} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="Cohortes de Usuarios">
                    <div className="h-[350px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={retentionData}
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    <Cell fill="#3b82f6" />
                                    <Cell fill="#10b981" />
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}
