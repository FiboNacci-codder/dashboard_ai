/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Papa from 'papaparse';
import { ContactData } from '../types';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1VjqYS0EYTHK0zzdbAN1BlSjfFfXjIet8QcYTUPR9rDA/export?format=csv';

export async function fetchSheetData(): Promise<ContactData[]> {
  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch sheet data');
    }
    const csvString = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Map and validate the results
          const data = results.data.map((row: any) => ({
            ID_contacto: String(row.ID_contacto),
            Sede: String(row.Sede),
            Fecha_registro: String(row.Fecha_registro),
            Tiempo_respuesta_segundos: Number(row.Tiempo_respuesta_segundos),
            Tiempo_conversacion_segundos: Number(row.Tiempo_conversacion_segundos),
            Mensaje_correcto: Number(row.Mensaje_correcto),
            Mensaje_incorrecto: Number(row.Mensaje_incorrecto),
            Intent_detectado: String(row.Intent_detectado),
            Confianza_modelo: Number(row.Confianza_modelo),
            Escalado_humano: String(row.Escalado_humano),
            Numero_mensajes: Number(row.Numero_mensajes),
            Satisfaccion_usuario: Number(row.Satisfaccion_usuario),
          }));
          resolve(data);
        },
        error: (error: any) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}
