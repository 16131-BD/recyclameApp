import * as mongoose from 'mongoose';

// Operaciones Autorizadas Schema para MongoDB
// Esta tabla registra las operaciones que cada usuario puede realizar
// según su rol y empresa
export const AuthorizedOperation = new mongoose.Schema({
  // Identificador de la operación autorizada
  code: { type: String, required: true, unique: true },
  
  // Empresa a la que pertenece la autorización (0 = todas las empresas para ADMIN)
  company_id: { type: Number, required: true, index: true },
  
  // Usuario autorizado (referencia a PostgreSQL users)
  user_id: { type: Number, required: true, index: true },
  user_code: { type: String },
  user_name: { type: String },
  
  // Tipo de usuario (9=Admin, 10=Operador, 11=Supervisor)
  user_type: { type: Number, required: true },
  
  // Entidad sobre la que puede operar
  entity: { 
    type: String, 
    required: true,
    enum: ['companies', 'users', 'plants', 'residues', 'operations_detail', 'types', 'authorized_operations']
  },
  
  // Acciones permitidas
  actions: {
    read: { type: Boolean, default: false },
    create: { type: Boolean, default: false },
    update: { type: Boolean, default: false },
    delete: { type: Boolean, default: false }
  },
  
  // Restricciones adicionales
  restrictions: {
    // Solo puede ver datos de su empresa
    own_company_only: { type: Boolean, default: true },
    // Solo puede ver sus propios registros
    own_records_only: { type: Boolean, default: false },
    // Campos que puede ver (vacío = todos)
    visible_fields: [String],
    // Campos que puede editar (vacío = todos permitidos)
    editable_fields: [String]
  },
  
  // Vigencia de la autorización
  valid_from: { type: Date, default: Date.now },
  valid_until: { type: Date },
  
  // Metadatos
  granted_by: { type: Number }, // Usuario que otorgó el permiso
  status: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Índices
AuthorizedOperation.index({ user_id: 1, entity: 1 });
AuthorizedOperation.index({ company_id: 1, user_type: 1 });
