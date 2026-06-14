const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter, authLimiter } = require('../middlewares/rateLimiter');

// Rotas com rate limiting
router.post('/', authMiddleware, apiLimiter, PaymentController.create);
router.get('/', authMiddleware, apiLimiter, PaymentController.getByUser);
router.get('/stats', authMiddleware, apiLimiter, PaymentController.getStats);
router.get('/:id', authMiddleware, apiLimiter, PaymentController.getById);
router.get('/pet/:petId', authMiddleware, apiLimiter, PaymentController.getByPet);
router.post('/:id/cancel', authMiddleware, apiLimiter, PaymentController.cancel);
router.post('/:id/refund', authMiddleware, apiLimiter, PaymentController.refund);

// Webhook tem rate limit mais restritivo
router.post('/webhook', authLimiter, PaymentController.webhook);

module.exports = router;
