/**
 * API Route para la Base de Conocimiento Agronómica en Producción (`/api/conocimiento`)
 * - GET: Devuelve el estado del motor RAG, el corpus base (Bruce Bugbee USU + Athena Ag)
 *        y las reglas/apuntes guardados en MongoDB en producción.
 * - POST: Guarda o actualiza las reglas/apuntes adicionales en MongoDB para que
 *         el endpoint `/api/chat` las inyecte como referencia primaria en cada consulta a la IA.
 */

import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Conocimiento from '@/lib/models/Conocimiento';
import {
  METADATA_CORPUS_BUGBEE,
  PRINCIPIOS_CARDINALES_BUGBEE,
} from '@/lib/knowledge/agronomicKnowledgeBase';

const CLAVE_GLOBAL = 'corpus_custom_bugbee_athena';

export async function GET() {
  try {
    await connectDB();
    const doc = await Conocimiento.findOne({ clave: CLAVE_GLOBAL }).lean();

    return NextResponse.json({
      success: true,
      metadata: METADATA_CORPUS_BUGBEE,
      principiosCount: PRINCIPIOS_CARDINALES_BUGBEE.length,
      apuntesPersonalizadosDB: doc?.contenido || '',
      actualizadoEn: doc?.actualizadoEn || null,
      iaActivaEnServidor: Boolean(process.env.OPENAI_API_KEY),
      webhookN8nConfigurado: true,
    });
  } catch (error) {
    console.warn('Error al leer Conocimiento desde MongoDB:', error);
    return NextResponse.json({
      success: true,
      metadata: METADATA_CORPUS_BUGBEE,
      principiosCount: PRINCIPIOS_CARDINALES_BUGBEE.length,
      apuntesPersonalizadosDB: '',
      iaActivaEnServidor: Boolean(process.env.OPENAI_API_KEY),
      webhookN8nConfigurado: true,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const contenido = typeof body.contenido === 'string' ? body.contenido.trim() : '';

    await connectDB();
    const doc = await Conocimiento.findOneAndUpdate(
      { clave: CLAVE_GLOBAL },
      {
        clave: CLAVE_GLOBAL,
        titulo: 'Reglas y Apuntes Adicionales (Bruce Bugbee USU + Athena Ag)',
        fuente: 'Bruce Bugbee (USU) + Athena Ag',
        contenido,
        actualizadoEn: new Date().toISOString(),
        activo: true,
      },
      { upsert: true, new: true }
    ).lean();

    return NextResponse.json({
      success: true,
      apuntesPersonalizadosDB: doc?.contenido || '',
      actualizadoEn: doc?.actualizadoEn,
    });
  } catch (error) {
    console.error('Error al guardar en Base de Conocimiento MongoDB:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'No se pudo guardar en la base de datos de conocimiento',
      },
      { status: 500 }
    );
  }
}
