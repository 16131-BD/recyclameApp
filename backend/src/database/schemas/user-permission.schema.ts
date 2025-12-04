import * as mongoose from 'mongoose';

// User Permissions Schema para MongoDB
// Almacena los permisos de módulos para usuarios secundarios
export const UserPermission = new mongoose.Schema({
  // Usuario (referencia a PostgreSQL users)
  user_id: { type: Number, required: true, unique: true },
  user_code: { type: String },
  user_name: { type: String },
  
  // Empresa del usuario
  company_id: { type: Number, index: true },
  
  // ============================================
  // PERMISOS POR MÓDULO (lo que puede VER en el menú)
  // ============================================
  modules: {
    dashboard: { type: Boolean, default: true },
    companies: { type: Boolean, default: false },
    users: { type: Boolean, default: false },
    residues: { type: Boolean, default: true },
    plants: { type: Boolean, default: true },
    operations: { type: Boolean, default: true },
    affiliation_requests: { type: Boolean, default: false },
    company_requests: { type: Boolean, default: false },
    settings: { type: Boolean, default: false }
  },
  
  // ============================================
  // RESTRICCIONES
  // ============================================
  restrictions: {
    can_approve_affiliations: { type: Boolean, default: false },
    can_manage_permissions: { type: Boolean, default: false }
  },
  
  // Metadatos
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Pre-save hook
UserPermission.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});
