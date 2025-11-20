import * as mongoose from 'mongoose';

export const Affiliation = new mongoose.Schema({
  user: { type: Number, required: true },
  documents: {},
  refs: {},
  affiliation_state: { type: String, },
  status: { type: Boolean, default: true },
  create_at: { type: Date, default: Date.now }
});