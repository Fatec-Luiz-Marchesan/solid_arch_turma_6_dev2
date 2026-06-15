class SettingsValidation {
  static validateNotificationSettings(notifications) {
    if (!notifications) return true;
    const allowed = ['email', 'push', 'sms'];
    for (const key of Object.keys(notifications)) {
      if (!allowed.includes(key)) return false;
      if (typeof notifications[key] !== 'boolean') return false;
    }
    return true;
  }

  static validatePrivacySettings(privacy) {
    if (!privacy) return true;
    const allowed = ['profileVisibility', 'showEmail', 'showPhone'];
    for (const key of Object.keys(privacy)) {
      if (!allowed.includes(key)) return false;
      if (key === 'profileVisibility') {
        if (!['public', 'private', 'contacts'].includes(privacy[key])) return false;
      } else if (typeof privacy[key] !== 'boolean') return false;
    }
    return true;
  }

  static validateLanguage(lang) {
    return lang && ['pt-BR', 'en-US', 'es-ES'].includes(lang);
  }

  static validateTheme(theme) {
    return theme && ['light', 'dark', 'auto'].includes(theme);
  }

  static validateTimezone(tz) {
    return tz && typeof tz === 'string' && tz.length > 0;
  }

  static validatePreferences(prefs) {
    if (!prefs) return true;
    if (prefs.receivePromotions !== undefined && typeof prefs.receivePromotions !== 'boolean') return false;
    if (prefs.receiveNewsletter !== undefined && typeof prefs.receiveNewsletter !== 'boolean') return false;
    return true;
  }

  static validateCreate(data) {
    const errors = [];
    if (!data.userId) errors.push('userId é obrigatório');
    if (!this.validateNotificationSettings(data.notifications)) errors.push('Configurações de notificação inválidas');
    if (!this.validatePrivacySettings(data.privacy)) errors.push('Configurações de privacidade inválidas');
    if (data.language && !this.validateLanguage(data.language)) errors.push('Idioma inválido');
    if (data.theme && !this.validateTheme(data.theme)) errors.push('Tema inválido');
    if (data.timezone && !this.validateTimezone(data.timezone)) errors.push('Fuso horário inválido');
    if (!this.validatePreferences(data.preferences)) errors.push('Preferências inválidas');
    return { isValid: errors.length === 0, errors };
  }

  static validateUpdate(data) {
    const errors = [];
    if (!this.validateNotificationSettings(data.notifications)) errors.push('Configurações de notificação inválidas');
    if (!this.validatePrivacySettings(data.privacy)) errors.push('Configurações de privacidade inválidas');
    if (data.language && !this.validateLanguage(data.language)) errors.push('Idioma inválido');
    if (data.theme && !this.validateTheme(data.theme)) errors.push('Tema inválido');
    if (data.timezone && !this.validateTimezone(data.timezone)) errors.push('Fuso horário inválido');
    if (!this.validatePreferences(data.preferences)) errors.push('Preferências inválidas');
    return { isValid: errors.length === 0, errors };
  }

  static validateObjectId(id) {
    return id && /^[0-9a-fA-F]{24}$/.test(id);
  }
}

module.exports = SettingsValidation;
