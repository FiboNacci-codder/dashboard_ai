import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Card } from '../Card';
import { DashboardStats, IntentStats } from '../../types';

interface PerformanceTabProps {
    stats: DashboardStats;
    intentStats: IntentStats[];
}

export function PerformanceTab({ stats, intentStats }: PerformanceTabProps) {
    const commonPhrases = [
        { text: "quiero comprar", weight: 95 },
        { text: "duda con pedido", weight: 80 },
        { text: "hablar con humano", weight: 75 },
        { text: "horario atencion", weight: 60 },
        { text: "medios de pago", weight: 55 },
        { text: "problema factura", weight: 45 },
        { text: "como funciona", weight: 40 },
        { text: "descuento", weight: 35 }
    ];

    return (
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card title="Volumen de Mensajes por Intent" className="lg:col-span-2">
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

                <Card title="Frases Frecuentes (Simulado)">
                    <div className="flex flex-wrap gap-3 mt-6 content-start items-center justify-center h-[350px] p-4">
                        {commonPhrases.map((phrase, idx) => (
                            <span
                                key={idx}
                                className="px-3 py-1 bg-zinc-100 rounded-full text-zinc-800 font-bold transition-transform hover:scale-110 cursor-default"
                                style={{
                                    fontSize: `${Math.max(0.75, phrase.weight / 50)}rem`,
                                    opacity: Math.max(0.4, phrase.weight / 100)
                                }}
                            >
                                {phrase.text}
                            </span>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
