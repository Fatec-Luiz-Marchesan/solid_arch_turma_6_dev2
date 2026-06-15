const Settings = require('../../models/Settings');
const SettingsValidation = require('../../helpers/settingsValidation');
const logger = require('../../config/logger');

class UpdateSettingsUseCase {
  async execute(userId, updateData) {
    const objectId = SettingsValidation.toObjectId(userId);
    if (!objectId) {
      throw new Error('ID de usuário inválido');
    }

    const validation = SettingsValidation.validateUpdate(updateData);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const settings = await Settings.findOne({ userId: objectId });
    if (!settings) {
      throw new Error('Configurações não encontradas');
    }

    if (updateData.notifications) {
      settings.notifications = { ...settings.notifications, ...updateData.notifications };
    }
    if (updateData.privacy) {
      settings.privacy = { ...settings.privacy, ...updateData.privacy };
    }
    if (updateData.language) settings.language = updateData.language;
    if (updateData.theme) settings.theme = updateData.theme;
    if (updateData.timezone) settings.timezone = updateData.timezone;
    if (updateData.preferences) {
      settings.preferences = { ...settings.preferences, ...updateData.preferences };
    }

    await settings.save();
    logger.info(`Settings updated for user ${userId}`);
    return settings.toJSON();
  }
}

module.exports = new UpdateSettingsUseCase();
