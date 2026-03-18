/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ContactData, DashboardStats, SedeStats, IntentStats } from '../types';

export function calculateDashboardStats(data: ContactData[]): DashboardStats {
  if (data.length === 0) {
    return {
      totalContacts: 0,
      totalMessages: 0,
      avgSatisfaction: 0,
      humanEscalationRate: 0,
      avgResponseTime: 0,
      avgConversationTime: 0,
      messageAccuracy: 0,
      errorRate: 0,
      avgConfidence: 0,
      healthScore: 0
    };
  }

  const total = data.length;
  const sumSatisfaction = data.reduce((acc, curr) => acc + curr.Satisfaccion_usuario, 0);
  const escalations = data.filter(item => item.Escalado_humano === 'Sí').length;
  const sumResponseTime = data.reduce((acc, curr) => acc + curr.Tiempo_respuesta_segundos, 0);
  const sumConvTime = data.reduce((acc, curr) => acc + curr.Tiempo_conversacion_segundos, 0);
  const correctMessages = data.reduce((acc, curr) => acc + curr.Mensaje_correcto, 0);
  const incorrectMessages = data.reduce((acc, curr) => acc + curr.Mensaje_incorrecto, 0);
  const totalMessages = correctMessages + incorrectMessages;
  const sumConfidence = data.reduce((acc, curr) => acc + (isNaN(curr.Confianza_modelo) ? 0 : curr.Confianza_modelo), 0);

  const accuracy = totalMessages > 0 ? (correctMessages / totalMessages) * 100 : 0;
  const satisfactionNorm = (sumSatisfaction / total) / 5 * 100;
  const responseTimeScore = Math.max(0, 100 - (sumResponseTime / total) * 5); // Simple penalty for slow response
  const escalationPenalty = (1 - escalations / total) * 100;

  // Health Score: Weighted average of key metrics
  const healthScore = (accuracy * 0.4) + (satisfactionNorm * 0.3) + (responseTimeScore * 0.15) + (escalationPenalty * 0.15);

  return {
    totalContacts: total,
    totalMessages,
    avgSatisfaction: Number((sumSatisfaction / total).toFixed(2)),
    humanEscalationRate: Number(((escalations / total) * 100).toFixed(1)),
    avgResponseTime: Number((sumResponseTime / total).toFixed(1)),
    avgConversationTime: Number((sumConvTime / total).toFixed(1)),
    messageAccuracy: Number(accuracy.toFixed(1)),
    errorRate: totalMessages > 0 ? Number(((incorrectMessages / totalMessages) * 100).toFixed(1)) : 0,
    avgConfidence: Number((sumConfidence / total).toFixed(1)),
    healthScore: Number(healthScore.toFixed(1))
  };
}

export function calculateSedeStats(data: ContactData[]): SedeStats[] {
  const sedes: Record<string, ContactData[]> = {};
  data.forEach(item => {
    if (!sedes[item.Sede]) sedes[item.Sede] = [];
    sedes[item.Sede].push(item);
  });

  return Object.entries(sedes).map(([name, items]) => {
    const stats = calculateDashboardStats(items);
    return {
      name,
      contacts: items.length,
      accuracy: stats.messageAccuracy,
      satisfaction: stats.avgSatisfaction,
      escalationRate: stats.humanEscalationRate,
      avgResponseTime: stats.avgResponseTime,
      healthScore: stats.healthScore
    };
  }).sort((a, b) => b.healthScore - a.healthScore);
}

export function calculateIntentStats(data: ContactData[]): IntentStats[] {
  const intents: Record<string, ContactData[]> = {};
  data.forEach(item => {
    if (!intents[item.Intent_detectado]) intents[item.Intent_detectado] = [];
    intents[item.Intent_detectado].push(item);
  });

  return Object.entries(intents).map(([name, items]) => {
    const correct = items.reduce((acc, curr) => acc + curr.Mensaje_correcto, 0);
    const incorrect = items.reduce((acc, curr) => acc + curr.Mensaje_incorrecto, 0);
    const totalMsg = correct + incorrect;
    const sumSat = items.reduce((acc, curr) => acc + curr.Satisfaccion_usuario, 0);

    return {
      name,
      count: items.length,
      accuracy: totalMsg > 0 ? Number(((correct / totalMsg) * 100).toFixed(1)) : 0,
      avgSatisfaction: Number((sumSat / items.length).toFixed(2)),
      errorCount: incorrect
    };
  }).sort((a, b) => b.count - a.count);
}

export function getArenaHighlights(sedeStats: SedeStats[]) {
  if (sedeStats.length === 0) return null;

  const topSede = sedeStats[0];
  const worstSede = sedeStats[sedeStats.length - 1];
  
  // Find sede with best improvement (simulated for now or based on satisfaction vs accuracy)
  const mostSatisfied = [...sedeStats].sort((a, b) => b.satisfaction - a.satisfaction)[0];
  const fastestResponse = [...sedeStats].sort((a, b) => a.avgResponseTime - b.avgResponseTime)[0];

  return {
    winner: topSede,
    mostSatisfied,
    fastestResponse,
    underperformer: worstSede
  };
}
