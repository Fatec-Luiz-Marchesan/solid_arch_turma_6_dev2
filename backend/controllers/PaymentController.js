const CreatePaymentUseCase = require('../useCases/payment/CreatePaymentUseCase');
const GetPaymentUseCase = require('../useCases/payment/GetPaymentUseCase');
const UpdatePaymentUseCase = require('../useCases/payment/UpdatePaymentUseCase');
const logger = require('../config/logger');
class PaymentController {
  async create(req, res) {
    try {
      const userId = req.userId;
      const { petId, amount, paymentMethod, cardDetails } = req.body;
      const result = await CreatePaymentUseCase.execute({ userId, petId, amount, paymentMethod, cardDetails });
      res.status(201).json(result);
    } catch (error) {
      logger.error(`Create payment error: ${error.message}`);
      res.status(400).json({ message: error.message });
    }
  }
  async getById(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const payment = await GetPaymentUseCase.getById(id, userId);
      res.status(200).json({ payment });
    } catch (error) {
      logger.error(`Get payment error: ${error.message}`);
      res.status(404).json({ message: error.message });
    }
  }
  async getUserPayments(req, res) {
    try {
      const userId = req.userId;
      const payments = await GetPaymentUseCase.getByUser(userId);
      res.status(200).json({ payments, count: payments.length });
    } catch (error) {
      logger.error(`Get user payments error: ${error.message}`);
      res.status(400).json({ message: error.message });
    }
  }
  async getByPet(req, res) {
    try {
      const { petId } = req.params;
      const payments = await GetPaymentUseCase.getByPet(petId);
      res.status(200).json({ payments, count: payments.length });
    } catch (error) {
      logger.error(`Get pet payments error: ${error.message}`);
      res.status(400).json({ message: error.message });
    }
  }
  async getStats(req, res) {
    try {
      const userId = req.userId;
      const stats = await GetPaymentUseCase.getStats(userId);
      res.status(200).json(stats);
    } catch (error) {
      logger.error(`Get stats error: ${error.message}`);
      res.status(400).json({ message: error.message });
    }
  }
  async cancel(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const payment = await UpdatePaymentUseCase.cancel(id, userId);
      res.status(200).json({ message: 'Pagamento cancelado com sucesso', payment });
    } catch (error) {
      logger.error(`Cancel payment error: ${error.message}`);
      res.status(400).json({ message: error.message });
    }
  }
  async refund(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const payment = await UpdatePaymentUseCase.updateStatus(id, 'refunded', userId);
      res.status(200).json({ message: 'Reembolso realizado com sucesso', payment });
    } catch (error) {
      logger.error(`Refund payment error: ${error.message}`);
      res.status(400).json({ message: error.message });
    }
  }
}
module.exports = new PaymentController();
