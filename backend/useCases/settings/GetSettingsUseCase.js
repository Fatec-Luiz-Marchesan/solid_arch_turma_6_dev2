const Settings = require('../../models/Settings');
const SettingsValidation = require('../../helpers/settingsValidation');

class GetSettingsUseCase {
  async getByUserId(userId) {
    if (!SettingsValidation.validateObjectId(userId)) {
      throw new Error('ID de usuário inválido');
    }
    const settings = await Settings.findOne({ userId });
    if (!settings) {
      throw new Error('Configurações não encontradas');
    }
    return settings.toJSON();
  }

  async getOrCreate(userId) {
    if (!SettingsValidation.validateObjectId(userId)) {
      throw new Error('ID de usuário inválido');
    }
    const settings = await Settings.getOrCreate(userId);
    return settings.toJSON();
  }
}

module.exports = new GetSettingsUseCase();
