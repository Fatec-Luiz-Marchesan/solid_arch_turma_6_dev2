class ReportValidation {
  static validateName(name) {
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return { valid: false, message: 'Nome do relatório é obrigatório' };
    }
    if (name.trim().length > 100) {
      return { valid: false, message: 'Nome deve ter no máximo 100 caracteres' };
    }
    return { valid: true, value: name.trim() };
  }

  static validateType(type) {
    const validTypes = ['pets', 'adoptions', 'vaccines', 'locations', 'diets', 'payments'];
    if (!type || !validTypes.includes(type)) {
      return { valid: false, message: 'Tipo de relatório inválido' };
    }
    return { valid: true, value: type };
  }

  static validateFormat(format) {
    const validFormats = ['json', 'csv', 'pdf'];
    if (format && !validFormats.includes(format)) {
      return { valid: false, message: 'Formato inválido' };
    }
    return { valid: true, value: format || 'json' };
  }

  static validateDates(startDate, endDate) {
    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return { valid: false, message: 'Data inicial inválida' };
      }
    }
    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return { valid: false, message: 'Data final inválida' };
      }
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return { valid: false, message: 'Data inicial não pode ser posterior à data final' };
    }
    return { valid: true };
  }

  static validateObjectId(id) {
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return { valid: false, message: 'ID inválido' };
    }
    return { valid: true };
  }
}

module.exports = ReportValidation;
