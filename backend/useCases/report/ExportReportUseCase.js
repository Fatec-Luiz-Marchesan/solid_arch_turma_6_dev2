const Report = require('../../models/Report');
const ReportValidation = require('../../helpers/reportValidation');
const logger = require('../../config/logger');

class ExportReportUseCase {
  async execute(reportId, userId = null) {
    const idValid = ReportValidation.validateObjectId(reportId);
    if (!idValid.valid) throw new Error(idValid.message);

    const query = { _id: reportId };
    if (userId) query.userId = userId;

    const report = await Report.findOne(query);
    if (!report) throw new Error('Relatório não encontrado');

    if (report.status !== 'completed') {
      throw new Error('Relatório ainda não está pronto para exportação');
    }

    logger.info(`Report ${reportId} exported`);

    return {
      id: report._id,
      name: report.name,
      type: report.type,
      format: report.format,
      data: report.data,
      totalRecords: report.totalRecords,
      generatedAt: report.generatedAt
    };
  }
}

module.exports = new ExportReportUseCase();
