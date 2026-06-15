const Payment = require('../../models/Payment');
const PaymentValidation = require('../../helpers/paymentValidation');
class GetPaymentUseCase {
  async getById(paymentId, userId = null) {
    const idValid = PaymentValidation.validateObjectId(paymentId);
    if (!idValid.valid) throw new Error(idValid.message);
    const query = { _id: paymentId };
    if (userId) query.userId = userId;
    const payment = await Payment.findOne(query);
    if (!payment) throw new Error('Pagamento não encontrado');
    return payment;
  }
  async getByUser(userId) {
    const idValid = PaymentValidation.validateObjectId(userId);
    if (!idValid.valid) throw new Error(idValid.message);
    return await Payment.findByUser(userId);
  }
  async getByPet(petId) {
    const idValid = PaymentValidation.validateObjectId(petId);
    if (!idValid.valid) throw new Error(idValid.message);
    return await Payment.findByPet(petId);
  }
  async getStats(userId = null) {
    if (userId) {
      const idValid = PaymentValidation.validateObjectId(userId);
      if (!idValid.valid) throw new Error(idValid.message);
    }
    return await Payment.getStats(userId);
  }
}
module.exports = new GetPaymentUseCase();
