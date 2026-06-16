const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/ReportController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimiter');

router.use(apiLimiter, authMiddleware);

router.post('/', ReportController.generate);
router.get('/', ReportController.getUserReports);
router.get('/stats', ReportController.getStats);
router.get('/:id', ReportController.getReportById);
router.get('/:id/export', ReportController.export);
router.delete('/:id', ReportController.delete);

module.exports = router;
