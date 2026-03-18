/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ContactData {
  ID_contacto: string;
  Sede: string;
  Fecha_registro: string;
  Tiempo_respuesta_segundos: number;
  Tiempo_conversacion_segundos: number;
  Mensaje_correcto: number;
  Mensaje_incorrecto: number;
  Intent_detectado: string;
  Confianza_modelo: number;
  Escalado_humano: string;
  Numero_mensajes: number;
  Satisfaccion_usuario: number;
}

export interface DashboardStats {
  totalContacts: number;
  totalMessages: number;
  avgSatisfaction: number;
  humanEscalationRate: number;
  avgResponseTime: number;
  avgConversationTime: number;
  messageAccuracy: number;
  errorRate: number;
  avgConfidence: number;
  healthScore: number;
}

export interface SedeStats {
  name: string;
  contacts: number;
  accuracy: number;
  satisfaction: number;
  escalationRate: number;
  avgResponseTime: number;
  healthScore: number;
}

export interface IntentStats {
  name: string;
  count: number;
  accuracy: number;
  avgSatisfaction: number;
  errorCount: number;
}

export type DashboardMode = 'arena' | 'analytical';
export type AnalyticalTab = 'overview' | 'performance' | 'errors' | 'experience' | 'operations';

export interface Commercial {
  id: string;
  name: string;
  photoUrl: string;
  sede: string;
}

export interface Configuration {
  commercials: Commercial[];
  sedeImages: Record<string, string>;
}
