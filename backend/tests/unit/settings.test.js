const Settings = require('../../models/Settings');
const SettingsValidation = require('../../helpers/settingsValidation');
const CreateSettingsUseCase = require('../../useCases/settings/CreateSettingsUseCase');
const GetSettingsUseCase = require('../../useCases/settings/GetSettingsUseCase');
const UpdateSettingsUseCase = require('../../useCases/settings/UpdateSettingsUseCase');
const DeleteSettingsUseCase = require('../../useCases/settings/DeleteSettingsUseCase');

jest.mock('../../models/Settings');
jest.mock('../../config/logger');

describe('Settings - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation', () => {
    test('validateNotificationSettings retorna true para objeto válido', () => {
      expect(SettingsValidation.validateNotificationSettings({ email: true, push: false })).toBe(true);
    });
    test('validateNotificationSettings retorna false para chave inválida', () => {
      expect(SettingsValidation.validateNotificationSettings({ invalid: true })).toBe(false);
    });
    test('validatePrivacySettings retorna true para objeto válido', () => {
      expect(SettingsValidation.validatePrivacySettings({ profileVisibility: 'public', showEmail: false })).toBe(true);
    });
    test('validatePrivacySettings retorna false para valor inválido', () => {
      expect(SettingsValidation.validatePrivacySettings({ profileVisibility: 'invalid' })).toBe(false);
    });
    test('validateLanguage retorna true para idioma válido', () => {
      expect(SettingsValidation.validateLanguage('pt-BR')).toBe(true);
    });
    test('validateTheme retorna true para tema válido', () => {
      expect(SettingsValidation.validateTheme('dark')).toBe(true);
    });
  });

  describe('CreateSettingsUseCase', () => {
    test('cria configurações com sucesso', async () => {
      const mockSave = jest.fn().mockResolvedValue(true);
      const mockToJSON = jest.fn().mockReturnValue({ userId: 'u1' });
      Settings.mockImplementation(() => ({ save: mockSave, toJSON: mockToJSON }));
      Settings.findOne.mockResolvedValue(null);
      const result = await CreateSettingsUseCase.execute({ userId: '507f1f77bcf86cd799439011' });
      expect(result).toHaveProperty('userId', 'u1');
    });

    test('lança erro se usuário já tem configurações', async () => {
      Settings.findOne.mockResolvedValue({ userId: 'u1' });
      await expect(CreateSettingsUseCase.execute({ userId: '507f1f77bcf86cd799439011' }))
        .rejects.toThrow('Configurações já existem para este usuário');
    });
  });

  describe('GetSettingsUseCase', () => {
    test('busca por userId com sucesso', async () => {
      Settings.findOne.mockResolvedValue({ toJSON: () => ({ userId: 'u1' }) });
      const result = await GetSettingsUseCase.getByUserId('507f1f77bcf86cd799439011');
      expect(result).toHaveProperty('userId', 'u1');
    });
    test('lança erro se não encontrado', async () => {
      Settings.findOne.mockResolvedValue(null);
      await expect(GetSettingsUseCase.getByUserId('507f1f77bcf86cd799439011'))
        .rejects.toThrow('Configurações não encontradas');
    });
  });

  describe('UpdateSettingsUseCase', () => {
    test('atualiza configurações com sucesso', async () => {
      const mockSettings = {
        notifications: { email: true },
        privacy: { profileVisibility: 'public' },
        save: jest.fn().mockResolvedValue(true),
        toJSON: () => ({ userId: 'u1', notifications: { email: false } })
      };
      Settings.findOne.mockResolvedValue(mockSettings);
      const result = await UpdateSettingsUseCase.execute('507f1f77bcf86cd799439011', { notifications: { email: false } });
      expect(result.notifications.email).toBe(false);
    });
  });

  describe('DeleteSettingsUseCase', () => {
    test('deleta configurações com sucesso', async () => {
      Settings.findOneAndDelete.mockResolvedValue({ userId: 'u1' });
      const result = await DeleteSettingsUseCase.execute('507f1f77bcf86cd799439011');
      expect(result.message).toBe('Configurações removidas com sucesso');
    });
  });
});
