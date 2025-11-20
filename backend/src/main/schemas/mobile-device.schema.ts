import * as mongoose from 'mongoose';

export const MobileDevice = new mongoose.Schema({
  os: { type: String },
  maccaddress: { type: String },
  user: { type: Number },
  status: { type: Boolean, default: true },
  create_at: { type: Date, default: Date.now }
});