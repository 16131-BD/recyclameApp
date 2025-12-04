import * as mongoose from 'mongoose';

export const CompanyRequest = new mongoose.Schema({
  // Datos de la empresa
  company_name: { type: String, required: true },
  ruc: { type: String, required: true },
  business_type: { type: String, required: true }, // GEN, TRA, TRE, REC
  address: { type: String },
  phone: { type: String },
  email: { type: String, required: true },
  website: { type: String },
  
  // Datos del representante legal
  legal_rep_name: { type: String },
  legal_rep_dni: { type: String },
  legal_rep_phone: { type: String },
  legal_rep_email: { type: String },
  
  // Datos de contacto comercial
  contact_name: { type: String },
  contact_phone: { type: String },
  contact_email: { type: String },
  
  // Documentación (URLs o referencias)
  doc_ruc: { type: String },
  doc_license: { type: String },
  doc_constitution: { type: String },
  
  // Estado y metadata
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejection_reason: { type: String },
  message: { type: String }, // Mensaje de la empresa solicitante
  
  // Timestamps
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date },
  reviewed_at: { type: Date },
  reviewed_by: { type: String }
});
