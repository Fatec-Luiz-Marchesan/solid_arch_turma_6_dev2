const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/SettingsController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter } = require('../middlewares/rateLimiter');

router.use(apiLimiter, authMiddleware);

router.post('/', SettingsController.create);
router.get('/', SettingsController.getByUserId);
router.get('/get-or-create', SettingsController.getOrCreate);
router.put('/', SettingsController.update);
router.delete('/', SettingsController.delete);

module.exports = router;
