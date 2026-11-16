/**
 * Modelo de Mongoose para la Base de Conocimiento Agronómica (MongoDB en Producción)
 * Permite almacenar y consultar reglas, protocolos y apuntes de Dr. Bruce Bugbee (USU)
 * y Athena Ag, así como la configuración del motor RAG en la base de datos de producción.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ReglaConocimiento {
  id?: string;
  clave: string;
  titulo: string;
  fuente: string;
  contenido: string;
  openAiApiKey?: string;
  actualizadoEn: string;
  actualizadoPor?: string;
  activo: boolean;
}

export interface ConocimientoDocument extends Omit<ReglaConocimiento, 'id'>, Document {
  _id: mongoose.Types.ObjectId;
}

const ConocimientoSchema = new Schema<ConocimientoDocument>(
  {
    clave: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    titulo: {
      type: String,
      required: true,
      trim: true,
    },
    fuente: {
      type: String,
      default: 'Bruce Bugbee (USU) + Athena Ag',
      trim: true,
    },
    contenido: {
      type: String,
      default: '',
      maxlength: 20000,
    },
    openAiApiKey: {
      type: String,
      default: '',
      trim: true,
    },
    actualizadoEn: {
      type: String,
      default: () => new Date().toISOString(),
    },
    actualizadoPor: {
      type: String,
      trim: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: false,
    collection: 'conocimiento_agronomico',
  }
);

const Conocimiento: Model<ConocimientoDocument> =
  mongoose.models.Conocimiento ||
  mongoose.model<ConocimientoDocument>('Conocimiento', ConocimientoSchema);

export default Conocimiento;
