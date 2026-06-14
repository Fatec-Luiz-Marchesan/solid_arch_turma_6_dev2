const Payment = require('../../models/Payment');
const PaymentService = require('../../services/PaymentService');
const PaymentValidator = require('../../helpers/paymentValidator');
const logger = require('../../config/logger');

class CreatePaymentUseCase {
  async execute(paymentData) {
    try {
      const { petId, userId, amount, paymentMethod, cardDetails } = paymentData;

      const amountValidation = PaymentValidator.validateAmount(amount);
      if (!amountValidation.valid) {
        throw new Error(amountValidation.message);
      }

      const methodValidation = PaymentValidator.validatePaymentMethod(paymentMethod);
      if (!methodValidation.valid) {
        throw new Error(methodValidation.message);
      }

      const cardValidation = PaymentValidator.validateCardDetails(cardDetails, paymentMethod);
      if (!cardValidation.valid) {
        throw new Error(cardValidation.message);
      }

      const payment = new Payment({
        petId,
        userId,
        amount: amountValidation.value,
        paymentMethod: methodValidation.value,
        status: 'pending'
      });

      if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
        payment.cardDetails = {
          last4: cardDetails.last4,
          brand: cardDetails.brand,
          holderName: cardDetails.holderName
        };
      } else if (paymentMethod === 'pix') {
        const pixData = await PaymentService.generatePixPayment(amountValidation.value);
        payment.pixDetails = pixData;
      } else if (paymentMethod === 'boleto') {
        const boletoData = await PaymentService.generateBoletoPayment(amountValidation.value);
        payment.boletoDetails = boletoData;
      }

      await payment.save();

      const paymentResult = await PaymentService.processPayment(
        amountValidation.value,
        paymentMethod,
        cardDetails
      );

      if (paymentResult.success) {
        payment.status = 'paid';
        payment.transactionId = paymentResult.transactionId;
        payment.paidAt = new Date();
        await payment.save();
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
    } catch (error) {
      logger.error(`CreatePaymentUseCase error: ${error.message}`);
      throw error;
    }
  }
}

module.exports = new CreatePaymentUseCase();
