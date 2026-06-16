const Report = require('../../models/Report');
const Pet = require('../../models/Pet');
const Payment = require('../../models/Payment');
const Vaccine = require('../../models/Vaccine');
const Location = require('../../models/Location');
const Diet = require('../../models/Diet');
const ReportValidation = require('../../helpers/reportValidation');
const logger = require('../../config/logger');

class GenerateReportUseCase {
  async execute(userId, reportData) {
    const nameValidation = ReportValidation.validateName(reportData.name);
    if (!nameValidation.valid) throw new Error(nameValidation.message);

    const typeValidation = ReportValidation.validateType(reportData.type);
    if (!typeValidation.valid) throw new Error(typeValidation.message);

    const formatValidation = ReportValidation.validateFormat(reportData.format);
    if (!formatValidation.valid) throw new Error(formatValidation.message);

    const datesValidation = ReportValidation.validateDates(
      reportData.filters?.startDate,
      reportData.filters?.endDate
    );
    if (!datesValidation.valid) throw new Error(datesValidation.message);

    const report = new Report({
      userId,
      name: nameValidation.value,
      type: typeValidation.value,
      format: formatValidation.value,
      filters: reportData.filters || {},
      status: 'pending'
    });

    await report.save();

    try {
      report.markAsProcessing();
      await report.save();

      const data = await this.fetchData(typeValidation.value, reportData.filters);
      
      report.markAsCompleted(data, data.length);
      await report.save();

      logger.info(`Report ${report._id} generated for user ${userId}`);
      return report.toJSON();
    } catch (error) {
      report.markAsFailed();
      await report.save();
      logger.error(`Report generation failed: ${error.message}`);
      throw new Error('Falha ao gerar relatório');
    }
  }

  async fetchData(type, filters) {
    // Inicializa query vazia
    const query = {};

    // Se não houver filtros, retorna todos os dados (com segurança)
    if (!filters || typeof filters !== 'object') {
      return this.getEmptyData(type);
    }

    // Listas de valores permitidos para validação
    const allowedStatus = ['pending', 'paid', 'failed', 'refunded', 'canceled'];
    const allowedSpecies = ['dog', 'cat'];
    const allowedPaymentStatus = ['pending', 'paid', 'failed', 'refunded', 'canceled'];

    // --- Validação e sanitização de cada campo ---

    // Datas
    const startDate = filters.startDate ? new Date(filters.startDate) : null;
    const endDate = filters.endDate ? new Date(filters.endDate) : null;

    if (startDate && !isNaN(startDate.getTime())) {
      query.createdAt = query.createdAt || {};
      query.createdAt.$gte = startDate;
    }
    if (endDate && !isNaN(endDate.getTime())) {
      query.createdAt = query.createdAt || {};
      query.createdAt.$lte = endDate;
    }

    // Status (apenas para tipos que não são payments, pois payments usam paymentStatus)
    if (filters.status && typeof filters.status === 'string') {
      const statusValue = filters.status.trim();
      if (allowedStatus.includes(statusValue) && type !== 'payments') {
        query.status = statusValue;
      }
    }

    // Espécie
    if (filters.species && typeof filters.species === 'string') {
      const speciesValue = filters.species.trim();
      if (allowedSpecies.includes(speciesValue)) {
        query.species = speciesValue;
      }
    }

    // Vacinação (booleano)
    if (filters.vaccinated !== undefined && filters.vaccinated !== null) {
      const vaccinatedValue = filters.vaccinated === 'true' || filters.vaccinated === true;
      query.vaccinated = vaccinatedValue;
    }

    // Status de pagamento (apenas para payments)
    if (type === 'payments' && filters.paymentStatus && typeof filters.paymentStatus === 'string') {
      const paymentStatusValue = filters.paymentStatus.trim();
      if (allowedPaymentStatus.includes(paymentStatusValue)) {
        query.status = paymentStatusValue;
      }
    }

    // Adoções: adopter não nulo
    if (type === 'adoptions') {
      query.adopter = { $ne: null };
    }

    // Seleciona o modelo adequado
    let Model;
    switch (type) {
      case 'pets':
        Model = Pet;
        break;
      case 'payments':
        Model = Payment;
        break;
      case 'vaccines':
        Model = Vaccine;
        break;
      case 'locations':
        Model = Location;
        break;
      case 'diets':
        Model = Diet;
        break;
      case 'adoptions':
        Model = Pet;
        break;
      default:
        return [];
    }

    // Executa a query com segurança (apenas campos validados)
    const data = await Model.find(query).sort('-createdAt').lean();
    return data;
  }

  // Método auxiliar para retornar dados vazios quando não há modelo
  async getEmptyData(type) {
    return [];
  }
}

module.exports = new GenerateReportUseCase();
