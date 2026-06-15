const Payment = require('../../models/Payment');
const PaymentGateway = require('../../services/PaymentGatewayService');
const PaymentValidation = require('../../helpers/paymentValidation');
const logger = require('../../config/logger');

class CreatePaymentUseCase {
  async execute(data) {
    const { userId, petId, amount, paymentMethod, cardDetails } = data;
    const amountValid = PaymentValidation.validateAmount(amount);
    if (!amountValid.valid) throw new Error(amountValid.message);
    const methodValid = PaymentValidation.validatePaymentMethod(paymentMethod);
    if (!methodValid.valid) throw new Error(methodValid.message);
    const cardValid = PaymentValidation.validateCardDetails(cardDetails, paymentMethod);
    if (!cardValid.valid) throw new Error(cardValid.message);
    const payment = new Payment({ userId, petId, amount: amountValid.value, paymentMethod: methodValid.value, status: 'pending' });
    if (paymentMethod === 'pix') {
      const pix = await PaymentGateway.generatePix(amountValid.value);
      payment.pixDetails = pix;
    } else if (paymentMethod === 'boleto') {
      const boleto = await PaymentGateway.generateBoleto(amountValid.value);
      payment.boletoDetails = boleto;
    } else if (['credit_card', 'debit_card'].includes(paymentMethod)) {
      payment.cardDetails = { last4: cardDetails.last4, brand: cardDetails.brand, holderName: cardDetails.holderName };
    }
    await payment.save();
    if (!['pix', 'boleto'].includes(paymentMethod)) {
      const result = await PaymentGateway.processPayment(amountValid.value, paymentMethod, cardDetails);
      if (result.success) {
        payment.markAsPaid(result.transactionId);
        await payment.save();
      } else {
        payment.markAsFailed();
        await payment.save();
        throw new Error(result.error);
      }
    }
    logger.info(`Payment created: ${payment._id} for user ${userId}`);
    return {
      success: true,
      payment: {
        id: payment._id,
        amount: payment.amount,
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        pixDetails: payment.pixDetails,
        boletoDetails: payment.boletoDetails,
        createdAt: payment.createdAt
      }
    };
  }
}
module.exports = new CreatePaymentUseCase();
