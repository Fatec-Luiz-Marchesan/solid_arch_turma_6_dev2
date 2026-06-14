const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/', PaymentController.create);
router.get('/', PaymentController.getByUser);
router.get('/stats', PaymentController.getStats);
router.get('/:id', PaymentController.getById);
router.get('/pet/:petId', PaymentController.getByPet);
router.post('/:id/cancel', PaymentController.cancel);
router.post('/:id/refund', PaymentController.refund);
router.post('/webhook', PaymentController.webhook);

module.exports = router;
