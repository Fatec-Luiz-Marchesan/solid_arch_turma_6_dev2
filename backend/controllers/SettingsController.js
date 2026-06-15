const CreateSettingsUseCase = require('../useCases/settings/CreateSettingsUseCase');
const GetSettingsUseCase = require('../useCases/settings/GetSettingsUseCase');
const UpdateSettingsUseCase = require('../useCases/settings/UpdateSettingsUseCase');
const DeleteSettingsUseCase = require('../useCases/settings/DeleteSettingsUseCase');
const logger = require('../config/logger');

class SettingsController {
  async create(req, res) {
    try {
      const userId = req.userId;
      const settingsData = { ...req.body, userId };
      const settings = await CreateSettingsUseCase.execute(settingsData);
      res.status(201).json({ success: true, data: settings });
    } catch (error) {
      logger.error(`Create settings error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getByUserId(req, res) {
    try {
      const userId = req.userId;
      const settings = await GetSettingsUseCase.getByUserId(userId);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      logger.error(`Get settings error: ${error.message}`);
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getOrCreate(req, res) {
    try {
      const userId = req.userId;
      const settings = await GetSettingsUseCase.getOrCreate(userId);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      logger.error(`GetOrCreate settings error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async update(req, res) {
    try {
      const userId = req.userId;
      const settings = await UpdateSettingsUseCase.execute(userId, req.body);
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      logger.error(`Update settings error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const userId = req.userId;
      const result = await DeleteSettingsUseCase.execute(userId);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      logger.error(`Delete settings error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new SettingsController();
