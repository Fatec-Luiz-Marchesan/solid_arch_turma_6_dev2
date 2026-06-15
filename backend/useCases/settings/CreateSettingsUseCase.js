const Settings = require('../../models/Settings');
const SettingsValidation = require('../../helpers/settingsValidation');
const logger = require('../../config/logger');
const mongoose = require('mongoose');

class CreateSettingsUseCase {
  async execute(data) {
    // Sanitiza userId e converte para ObjectId
    const userId = SettingsValidation.toObjectId(data.userId);
    if (!userId) {
      throw new Error('ID de usuário inválido');
    }

    const validation = SettingsValidation.validateCreate(data);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    // Query usando ObjectId (seguro)
    const existing = await Settings.findOne({ userId });
    if (existing) {
      throw new Error('Configurações já existem para este usuário');
    }

    const settings = new Settings({
      userId,
      notifications: data.notifications || { email: true, push: true, sms: false },
      privacy: data.privacy || { profileVisibility: 'public', showEmail: false, showPhone: true },
      language: data.language || 'pt-BR',
      theme: data.theme || 'light',
      timezone: data.timezone || 'America/Sao_Paulo',
      preferences: data.preferences || { receivePromotions: false, receiveNewsletter: true }
    });

    await settings.save();
    logger.info(`Settings created for user ${data.userId}`);
    return settings.toJSON();
  }
}

module.exports = new CreateSettingsUseCase();
