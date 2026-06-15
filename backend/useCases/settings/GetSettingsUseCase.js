const Settings = require('../../models/Settings');
const SettingsValidation = require('../../helpers/settingsValidation');

class GetSettingsUseCase {
  async getByUserId(userId) {
    const objectId = SettingsValidation.toObjectId(userId);
    if (!objectId) {
      throw new Error('ID de usuário inválido');
    }
    const settings = await Settings.findOne({ userId: objectId });
    if (!settings) {
      throw new Error('Configurações não encontradas');
    }
    return settings.toJSON();
  }

  async getOrCreate(userId) {
    const objectId = SettingsValidation.toObjectId(userId);
    if (!objectId) {
      throw new Error('ID de usuário inválido');
    }
    const settings = await Settings.getOrCreate(objectId);
    return settings.toJSON();
  }
}

module.exports = new GetSettingsUseCase();
