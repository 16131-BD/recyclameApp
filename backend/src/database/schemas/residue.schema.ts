import * as mongoose from 'mongoose';

// Residue Schema para MongoDB
// Migrado desde PostgreSQL para soportar el proceso de operaciones
export const Residue = new mongoose.Schema({
  // Identificador único de empresa (referencia a PostgreSQL companies)
  company_id: { type: Number, required: true, index: true },
  
  // Información del residuo
  name: { type: String, required: true },
  description: { type: String },
  
  // Tipo de residuo (referencia a types en PostgreSQL: residue_type)
  residue_type: { type: Number, required: true },
  residue_type_name: { type: String }, // Desnormalizado para consultas rápidas
  
  // Estado físico del residuo (Sólido, Líquido, etc.)
  status_type: { type: Number },
  status_type_name: { type: String },
  
  // Unidad de medida
  unit_measurement: { type: Number },
  unit_measurement_name: { type: String },
  
  // Cantidad
  quantity: { type: Number, required: true, default: 0 },
  
  // Fecha de generación del residuo
  waste_generation_date: { type: Date, default: Date.now },
  
  // Estado actual del residuo (Pendiente, En Proceso, Completado, etc.)
  status: { type: Number, default: 13 }, // 13 = Pendiente por defecto
  status_name: { type: String, default: 'Pendiente' },
  
  // Planta asignada (referencia a PostgreSQL plants)
  plant_id: { type: Number },
  plant_name: { type: String },
  
  // Usuario operador asignado (referencia a PostgreSQL users)
  user_operator: { type: Number },
  user_operator_name: { type: String },
  
  // Historial de operaciones (embebido para consulta rápida)
  operations_history: [{
    previous_status: Number,
    current_status: Number,
    observation: String,
    performed_by: Number,
    performed_at: { type: Date, default: Date.now }
  }],
  
  // Documentos adjuntos
  documents: [{
    type: { type: String }, // foto, certificado, guia, etc.
    url: String,
    uploaded_at: { type: Date, default: Date.now }
  }],
  
  // Metadatos
  created_by: { type: Number },
  updated_by: { type: Number },
  status_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Índices compuestos para búsquedas frecuentes
Residue.index({ company_id: 1, status: 1 });
Residue.index({ company_id: 1, residue_type: 1 });
Residue.index({ plant_id: 1, status: 1 });
