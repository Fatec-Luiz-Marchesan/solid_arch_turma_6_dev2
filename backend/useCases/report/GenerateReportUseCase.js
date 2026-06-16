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
    // Construção segura da query – apenas campos permitidos e valores validados
    const query = {};
    const allowedStatus = ['pending', 'paid', 'failed', 'refunded', 'canceled'];
    const allowedSpecies = ['dog', 'cat'];

    // Data inicial
    if (filters?.startDate) {
      const d = new Date(filters.startDate);
      if (!isNaN(d.getTime())) {
        query.createdAt = query.createdAt || {};
        query.createdAt.$gte = d;
      }
    }

    // Data final
    if (filters?.endDate) {
      const d = new Date(filters.endDate);
      if (!isNaN(d.getTime())) {
        query.createdAt = query.createdAt || {};
        query.createdAt.$lte = d;
      }
    }

    // Status (apenas para tipos que têm campo status)
    if (filters?.status && allowedStatus.includes(filters.status) && type !== 'payments') {
      query.status = filters.status;
    }

    // Espécie
    if (filters?.species && allowedSpecies.includes(filters.species)) {
      query.species = filters.species;
    }

    // Vacinação
    if (filters?.vaccinated !== undefined && filters?.vaccinated !== null) {
      query.vaccinated = filters.vaccinated === 'true' || filters.vaccinated === true;
    }

    // Status de pagamento (apenas para payments)
    if (filters?.paymentStatus && allowedStatus.includes(filters.paymentStatus) && type === 'payments') {
      query.status = filters.paymentStatus;
    }

    // Adoções: adopter não nulo
    if (type === 'adoptions') {
      query.adopter = { $ne: null };
    }

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

    const data = await Model.find(query).sort('-createdAt').lean();
    return data;
  }
}

module.exports = new GenerateReportUseCase();
