import * as mongoose from 'mongoose';

export const Request = new mongoose.Schema({
  name: { type: String, required: true },
  path: { type: String, required: true },
  type: { type: String },
  size: { type: Number },
  status: { type: Boolean, default: true },
  create_at: { type: Date, default: Date.now }
});