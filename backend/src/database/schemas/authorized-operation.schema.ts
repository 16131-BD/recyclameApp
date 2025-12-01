import * as mongoose from 'mongoose';

export const AuthorizedOperation = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String },
  description: { type: String },
  category: { type: String },
  is_required: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  status: { type: Boolean, default: true },
  created_by: { type: Number },
  updated_by: { type: Number },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});
