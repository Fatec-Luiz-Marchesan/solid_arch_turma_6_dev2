const GenerateReportUseCase = require('../useCases/report/GenerateReportUseCase');
const GetReportsUseCase = require('../useCases/report/GetReportsUseCase');
const DeleteReportUseCase = require('../useCases/report/DeleteReportUseCase');
const ExportReportUseCase = require('../useCases/report/ExportReportUseCase');
const logger = require('../config/logger');

class ReportController {
  async generate(req, res) {
    try {
      const userId = req.userId;
      const result = await GenerateReportUseCase.execute(userId, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      logger.error(`Generate report error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getUserReports(req, res) {
    try {
      const userId = req.userId;
      const reports = await GetReportsUseCase.getUserReports(userId);
      res.status(200).json({ success: true, data: reports, count: reports.length });
    } catch (error) {
      logger.error(`Get reports error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getReportById(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const report = await GetReportsUseCase.getReportById(id, userId);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      logger.error(`Get report error: ${error.message}`);
      res.status(404).json({ success: false, message: error.message });
    }
  }

  async getStats(req, res) {
    try {
      const userId = req.userId;
      const stats = await GetReportsUseCase.getStats(userId);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      logger.error(`Get stats error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const result = await DeleteReportUseCase.execute(id, userId);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      logger.error(`Delete report error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async export(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const report = await ExportReportUseCase.execute(id, userId);
      res.status(200).json({ success: true, data: report });
    } catch (error) {
      logger.error(`Export report error: ${error.message}`);
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new ReportController();
