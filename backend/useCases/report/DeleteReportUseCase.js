const Report = require('../../models/Report');
const ReportValidation = require('../../helpers/reportValidation');
const logger = require('../../config/logger');

class DeleteReportUseCase {
  async execute(reportId, userId = null) {
    const idValid = ReportValidation.validateObjectId(reportId);
    if (!idValid.valid) throw new Error(idValid.message);

    const query = { _id: reportId };
    if (userId) query.userId = userId;

    const report = await Report.findOneAndDelete(query);
    if (!report) throw new Error('Relatório não encontrado');

    logger.info(`Report ${reportId} deleted`);
    return { message: 'Relatório removido com sucesso' };
  }
}

module.exports = new DeleteReportUseCase();
