const Payment = require('../../models/Payment');
const PaymentValidator = require('../../helpers/paymentValidator');
const logger = require('../../config/logger');

class GetPaymentUseCase {
  async getById(paymentId, userId = null) {
    const idValidation = PaymentValidator.validateObjectId(paymentId);
    if (!idValidation.valid) {
      throw new Error(idValidation.message);
    }

    const query = { _id: paymentId };
    if (userId) {
      query.userId = userId;
    }

    const payment = await Payment.findOne(query);
    if (!payment) {
      throw new Error('Pagamento não encontrado');
    }

    return payment;
  }

  async getByUser(userId) {
    const idValidation = PaymentValidator.validateObjectId(userId);
    if (!idValidation.valid) {
      throw new Error(idValidation.message);
    }

    const payments = await Payment.findByUser(userId);
    return payments;
  }

  async getByPet(petId) {
    const idValidation = PaymentValidator.validateObjectId(petId);
    if (!idValidation.valid) {
      throw new Error(idValidation.message);
    }

    const payments = await Payment.findByPet(petId);
    return payments;
  }

  async getStats(userId = null) {
    if (userId) {
      const idValidation = PaymentValidator.validateObjectId(userId);
      if (!idValidation.valid) {
        throw new Error(idValidation.message);
      }
    }

    const stats = await Payment.getStats(userId);
    return stats;
  }
}

module.exports = new GetPaymentUseCase();
