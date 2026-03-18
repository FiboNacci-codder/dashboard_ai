import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis } from 'recharts';
import { Card } from '../Card';
import { DashboardStats, SedeStats, IntentStats, ContactData } from '../../types';
import { cn } from '../../lib/utils';
import { format, parseISO } from 'date-fns';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

interface ErrorsTabProps {
    stats: DashboardStats;
    sedeStats: SedeStats[];
    intentStats: IntentStats[];
    filteredData: ContactData[];
}

export function ErrorsTab({ stats, sedeStats, intentStats, filteredData }: ErrorsTabProps) {
    const recentErrors = filteredData
        .filter(d => d.Mensaje_incorrecto === 1)
        .sort((a, b) => new Date(b.Fecha_registro).getTime() - new Date(a.Fecha_registro).getTime())
        .slice(0, 10);

    const scatterData = filteredData.map(d => ({
        time: d.Tiempo_respuesta_segundos,
        error: d.Mensaje_incorrecto,
        name: d.ID_contacto
    }));

    return (
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

                <Card title="Tasa de Error vs Tiempo de Respuesta" subtitle="Detectar cuello de botella por saturación">
                    <div className="h-[400px] w-full mt-6">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                                <XAxis type="number" dataKey="time" name="Tiempo Rsp. (s)" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <YAxis type="number" dataKey="error" name="Error" domain={[0, 1]} ticks={[0, 1]} tickFormatter={(val) => val === 1 ? 'Error' : 'Correcto'} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <ZAxis type="category" dataKey="name" name="ID" />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '16px', border: 'none' }} />
                                <Scatter name="Contactos" data={scatterData} fill="#ef4444" opacity={0.6} shape="circle" />
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card title="Logs de Errores Recientes" subtitle="Últimas 10 conversaciones donde el bot falló">
                <div className="overflow-x-auto mt-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-100">
                                <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-400">ID Contacto</th>
                                <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-400">Fecha</th>
                                <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-400">Sede</th>
                                <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-400">Intent Detectado</th>
                                <th className="pb-4 text-xs font-black uppercase tracking-widest text-zinc-400">Confianza</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentErrors.map((err) => (
                                <tr key={err.ID_contacto} className="border-b border-zinc-50 hover:bg-rose-50/30 transition-colors">
                                    <td className="py-4 font-mono text-xs text-zinc-600 font-bold">{err.ID_contacto}</td>
                                    <td className="py-4 text-sm text-zinc-600">{format(parseISO(err.Fecha_registro), 'MMM dd, HH:mm')}</td>
                                    <td className="py-4 text-sm font-bold text-zinc-900">{err.Sede}</td>
                                    <td className="py-4">
                                        <span className="px-2 py-1 bg-zinc-100 rounded-md text-xs font-black capitalize">
                                            {err.Intent_detectado.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="py-4 text-sm font-bold text-rose-600">{err.Confianza_modelo}%</td>
                                </tr>
                            ))}
                            {recentErrors.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-zinc-400 font-bold">
                                        No hay errores recientes en este rango.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
