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
    const query = {};
    const startDate = filters?.startDate ? new Date(filters.startDate) : null;
    const endDate = filters?.endDate ? new Date(filters.endDate) : null;

    if (startDate && endDate) {
      query.createdAt = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.createdAt = { $gte: startDate };
    } else if (endDate) {
      query.createdAt = { $lte: endDate };
    }

    if (filters?.status) query.status = filters.status;
    if (filters?.species) query.species = filters.species;
    if (filters?.vaccinated !== undefined) query.vaccinated = filters.vaccinated === 'true';
    if (filters?.paymentStatus) query.status = filters.paymentStatus;

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
        query.adopter = { $ne: null };
        break;
      default:
        return [];
    }

    const data = await Model.find(query).sort('-createdAt').lean();
    return data;
  }
}

module.exports = new GenerateReportUseCase();
