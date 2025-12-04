import * as mongoose from 'mongoose';

// Solicitudes de Afiliación Schema para MongoDB
// Esta colección almacena las solicitudes de usuarios secundarios
// que desean unirse a una empresa existente
export const AffiliationRequest = new mongoose.Schema({
  // Código único de la solicitud
  code: { type: String, required: true, unique: true },
  
  // Empresa a la que solicita unirse (referencia a PostgreSQL companies)
  company_id: { type: Number, required: true, index: true },
  company_name: { type: String }, // Desnormalizado para consultas rápidas
  company_code: { type: String },
  
  // Datos del solicitante
  applicant: {
    names: { type: String, required: true },
    last_names: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    dni: { type: String },
    birth_date: { type: Date },
    gender: { type: Boolean }, // true = masculino, false = femenino
  },
  
  // Tipo de usuario solicitado (referencia a types en PostgreSQL)
  requested_user_type: { type: Number }, // 10 = Operador, 11 = Supervisor
  requested_user_type_name: { type: String },
  
  // Mensaje del solicitante
  message: { type: String },
  
  // Documentos adjuntos (opcional)
  documents: [{
    name: { type: String },
    url: { type: String },
    type: { type: String }, // dni, cv, certificado, etc.
    uploaded_at: { type: Date, default: Date.now }
  }],
  
  // Estado de la solicitud
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
    index: true
  },
  
  // Razón de rechazo (si aplica)
  rejection_reason: { type: String },
  
  // Usuario creado (si fue aprobada) - referencia a PostgreSQL users
  created_user_id: { type: Number },
  created_user_code: { type: String },
  
  // Permisos asignados al aprobar (referencia a authorized_operations)
  assigned_permissions_id: { type: String }, // ObjectId de authorized_operations
  
  // Metadatos de revisión
  reviewed_by: { type: Number }, // ID del usuario que revisó (admin/principal)
  reviewed_by_name: { type: String },
  reviewed_at: { type: Date },
  
  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Índices compuestos para búsquedas frecuentes
AffiliationRequest.index({ company_id: 1, status: 1 });
AffiliationRequest.index({ 'applicant.email': 1 });
AffiliationRequest.index({ status: 1, created_at: -1 });

// Pre-save hook para generar código único
AffiliationRequest.pre('save', function(next) {
  if (!this.code) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.code = `AF-${timestamp}-${random}`;
  }
  this.updated_at = new Date();
  next();
});
