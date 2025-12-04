import * as mongoose from 'mongoose';

// Operation Types Schema para MongoDB
// Define los tipos de operaciones autorizadas en el sistema de reciclaje
export const OperationType = new mongoose.Schema({
  // Orden de visualización
  order: { type: Number, required: true },
  
  // Código único de la operación (REC, VAL, TRA, DIS, IMP)
  code: { type: String, required: true, unique: true, uppercase: true },
  
  // Nombre completo de la operación
  name: { type: String, required: true },
  
  // Descripción detallada
  description: { type: String },
  
  // Ícono (opcional, para UI)
  icon: { type: String },
  
  // Color para badges (opcional)
  color: { type: String },
  
  // Estado activo
  is_active: { type: Boolean, default: true },
  
  // Metadatos
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Pre-save hook
OperationType.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});
