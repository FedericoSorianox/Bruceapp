/**
 * API Route para la Base de Conocimiento Agronómica en Producción (`/api/conocimiento`)
 * - GET: Devuelve el estado del motor RAG, el corpus base (Bruce Bugbee USU + Athena Ag),
 *        las reglas/apuntes guardados en MongoDB y si hay una API Key de OpenAI activa.
 * - POST: Guarda o actualiza las reglas/apuntes adicionales y (opcionalmente) la API Key de OpenAI
 *         en MongoDB para que `/api/chat` funcione en producción sin depender de archivos `.env` locales.
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
    const tieneKeyEnv = Boolean(process.env.OPENAI_API_KEY);
    const tieneKeyDB = Boolean(doc?.openAiApiKey && doc.openAiApiKey.startsWith('sk-'));

    return NextResponse.json({
      success: true,
      metadata: METADATA_CORPUS_BUGBEE,
      principiosCount: PRINCIPIOS_CARDINALES_BUGBEE.length,
      apuntesPersonalizadosDB: doc?.contenido || '',
      actualizadoEn: doc?.actualizadoEn || null,
      iaActivaEnServidor: tieneKeyEnv || tieneKeyDB,
      fuenteKey: tieneKeyDB ? 'mongodb' : tieneKeyEnv ? 'env' : 'ninguna',
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
      fuenteKey: process.env.OPENAI_API_KEY ? 'env' : 'ninguna',
      webhookN8nConfigurado: true,
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectDB();

    const updateFields: Record<string, unknown> = {
      clave: CLAVE_GLOBAL,
      titulo: 'Reglas y Apuntes Adicionales (Bruce Bugbee USU + Athena Ag)',
      fuente: 'Bruce Bugbee (USU) + Athena Ag',
      actualizadoEn: new Date().toISOString(),
      activo: true,
    };

    if (typeof body.contenido === 'string') {
      updateFields.contenido = body.contenido.trim();
    }

    if (typeof body.openAiApiKey === 'string' && body.openAiApiKey.trim().length > 0) {
      updateFields.openAiApiKey = body.openAiApiKey.trim();
    }

    const doc = await Conocimiento.findOneAndUpdate(
      { clave: CLAVE_GLOBAL },
      { $set: updateFields },
      { upsert: true, new: true }
    ).lean();

    const tieneKeyEnv = Boolean(process.env.OPENAI_API_KEY);
    const tieneKeyDB = Boolean(doc?.openAiApiKey && doc.openAiApiKey.startsWith('sk-'));

    return NextResponse.json({
      success: true,
      apuntesPersonalizadosDB: doc?.contenido || '',
      iaActivaEnServidor: tieneKeyEnv || tieneKeyDB,
      fuenteKey: tieneKeyDB ? 'mongodb' : tieneKeyEnv ? 'env' : 'ninguna',
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
