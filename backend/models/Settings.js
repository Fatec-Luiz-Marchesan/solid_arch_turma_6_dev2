const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório'],
    unique: true
  },
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'contacts'],
      default: 'public'
    },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: true }
  },
  language: {
    type: String,
    enum: ['pt-BR', 'en-US', 'es-ES'],
    default: 'pt-BR'
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'auto'],
    default: 'light'
  },
  timezone: {
    type: String,
    default: 'America/Sao_Paulo'
  },
  preferences: {
    receivePromotions: { type: Boolean, default: false },
    receiveNewsletter: { type: Boolean, default: true }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  } }
});

settingsSchema.statics.findByUserId = function(userId) {
  return this.findOne({ userId });
};

settingsSchema.statics.getOrCreate = async function(userId) {
  let settings = await this.findOne({ userId });
  if (!settings) {
    settings = await this.create({ userId });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);
