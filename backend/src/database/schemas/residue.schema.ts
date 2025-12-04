import * as mongoose from 'mongoose';

export const Residue = new mongoose.Schema({
  company_id: { type: Number, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  residue_type: { type: Number, required: true },
  status_type: { type: Number },
  unit_measurement: { type: Number },
  quantity: { type: Number, required: true, default: 0 },
  waste_generation_date: { type: Date, default: Date.now },
  status: { type: Number },
  plant_id: { type: Number },
  user_operator: { type: Number },
  operations_history: [{
    authorized_operation: { type: mongoose.Schema.ObjectId, ref: 'authorized_operations'},
    previous_status: Number,
    current_status: Number,
    observation: String,
    performed_by: Number,
    performed_at: { type: Date, default: Date.now }
  }],
  documents: [{
    type: { type: String },
    url: String,
    uploaded_at: { type: Date, default: Date.now }
  }],  
  created_by: { type: Number },
  updated_by: { type: Number },
  status_active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

Residue.index({ company_id: 1, status: 1 });
Residue.index({ company_id: 1, residue_type: 1 });
Residue.index({ plant_id: 1, status: 1 });
