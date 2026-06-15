const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const authMiddleware = require('../middlewares/authMiddleware');
const { apiLimiter, authLimiter } = require('../middlewares/rateLimiter');

// Webhook tem rate limit restritivo (sem auth)
router.post('/webhook', authLimiter, PaymentController.webhook);

// Rotas protegidas: primeiro apiLimiter, depois authMiddleware
router.post('/', apiLimiter, authMiddleware, PaymentController.create);
router.get('/', apiLimiter, authMiddleware, PaymentController.getByUser);
router.get('/stats', apiLimiter, authMiddleware, PaymentController.getStats);
router.get('/:id', apiLimiter, authMiddleware, PaymentController.getById);
router.get('/pet/:petId', apiLimiter, authMiddleware, PaymentController.getByPet);
router.post('/:id/cancel', apiLimiter, authMiddleware, PaymentController.cancel);
router.post('/:id/refund', apiLimiter, authMiddleware, PaymentController.refund);

module.exports = router;
