const Payment = require('../../models/Payment');
const PaymentGateway = require('../../services/PaymentGatewayService');
const PaymentValidation = require('../../helpers/paymentValidation');
const logger = require('../../config/logger');
class UpdatePaymentUseCase {
  async updateStatus(paymentId, status, userId = null) {
    const idValid = PaymentValidation.validateObjectId(paymentId);
    if (!idValid.valid) throw new Error(idValid.message);
    const query = { _id: paymentId };
    if (userId) query.userId = userId;
    const payment = await Payment.findOne(query);
    if (!payment) throw new Error('Pagamento não encontrado');
    switch (status) {
      case 'paid':
        const result = await PaymentGateway.processPayment(payment.amount, payment.paymentMethod);
        if (result.success) payment.markAsPaid(result.transactionId);
        else { payment.markAsFailed(); throw new Error(result.error); }
        break;
      case 'refunded':
        await PaymentGateway.refund(payment.transactionId);
        payment.markAsRefunded();
        break;
      case 'canceled':
        payment.markAsCanceled();
        break;
      case 'failed':
        payment.markAsFailed();
        break;
      default: throw new Error('Status inválido');
    }
    await payment.save();
    logger.info(`Payment ${paymentId} status updated to ${status}`);
    return payment;
  }
  async cancel(paymentId, userId = null) {
    return this.updateStatus(paymentId, 'canceled', userId);
  }
}
module.exports = new UpdatePaymentUseCase();
