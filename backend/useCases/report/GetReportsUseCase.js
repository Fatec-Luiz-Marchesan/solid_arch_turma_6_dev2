const Report = require('../../models/Report');
const ReportValidation = require('../../helpers/reportValidation');

class GetReportsUseCase {
  async getUserReports(userId) {
    const idValid = ReportValidation.validateObjectId(userId);
    if (!idValid.valid) throw new Error(idValid.message);
    return await Report.findByUser(userId);
  }

  async getReportById(reportId, userId = null) {
    const idValid = ReportValidation.validateObjectId(reportId);
    if (!idValid.valid) throw new Error(idValid.message);

    const query = { _id: reportId };
    if (userId) query.userId = userId;

    const report = await Report.findOne(query);
    if (!report) throw new Error('Relatório não encontrado');
    return report;
  }

  async getStats(userId = null) {
    if (userId) {
      const idValid = ReportValidation.validateObjectId(userId);
      if (!idValid.valid) throw new Error(idValid.message);
    }
    return await Report.getStats(userId);
  }
}

module.exports = new GetReportsUseCase();
