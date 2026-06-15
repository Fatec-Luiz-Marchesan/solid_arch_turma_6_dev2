const Settings = require('../../models/Settings');
const SettingsValidation = require('../../helpers/settingsValidation');
const logger = require('../../config/logger');

class DeleteSettingsUseCase {
  async execute(userId) {
    const objectId = SettingsValidation.toObjectId(userId);
    if (!objectId) {
      throw new Error('ID de usuário inválido');
    }
    const settings = await Settings.findOneAndDelete({ userId: objectId });
    if (!settings) {
      throw new Error('Configurações não encontradas');
    }
    logger.info(`Settings deleted for user ${userId}`);
    return { message: 'Configurações removidas com sucesso' };
  }
}

module.exports = new DeleteSettingsUseCase();
