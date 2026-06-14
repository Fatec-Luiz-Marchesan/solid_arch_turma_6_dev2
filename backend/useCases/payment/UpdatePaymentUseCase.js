const Payment = require('../../models/Payment');
const PaymentService = require('../../services/PaymentService');
const PaymentValidator = require('../../helpers/paymentValidator');
const logger = require('../../config/logger');

class UpdatePaymentUseCase {
  async updateStatus(paymentId, status, userId = null) {
    const idValidation = PaymentValidator.validateObjectId(paymentId);
    if (!idValidation.valid) {
      throw new Error(idValidation.message);
    }

    const statusValidation = PaymentValidator.validateStatus(status);
    if (!statusValidation.valid) {
      throw new Error(statusValidation.message);
    }

    const query = { _id: paymentId };
    if (userId) {
      query.userId = userId;
    }

    const payment = await Payment.findOne(query);
    if (!payment) {
      throw new Error('Pagamento não encontrado');
    }

    if (status === 'paid') {
      const result = await PaymentService.processPayment(payment.amount, payment.paymentMethod);
      if (result.success) {
        payment.status = 'paid';
        payment.transactionId = result.transactionId;
        payment.paidAt = new Date();
      } else {
        payment.status = 'failed';
        throw new Error('Falha ao processar pagamento');
      }
    } else if (status === 'refunded') {
      await PaymentService.refundPayment(payment.transactionId);
      payment.status = 'refunded';
      payment.refundedAt = new Date();
    } else if (status === 'canceled') {
      payment.status = 'canceled';
      payment.canceledAt = new Date();
    } else if (status === 'failed') {
      payment.status = 'failed';
    }

    await payment.save();
    logger.info(`Payment status updated: ${paymentId} -> ${status}`);

    return payment;
  }

  async cancelPayment(paymentId, userId = null) {
    return this.updateStatus(paymentId, 'canceled', userId);
  }
}

module.exports = new UpdatePaymentUseCase();
