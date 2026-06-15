const PaymentValidation = require('../../helpers/paymentValidation');
const Payment = require('../../models/Payment');
const CreatePaymentUseCase = require('../../useCases/payment/CreatePaymentUseCase');

jest.mock('../../services/PaymentGatewayService');

describe('Payment - Unit Tests', () => {
  describe('Validation', () => {
    test('validateAmount aceita valor válido', () => {
      const result = PaymentValidation.validateAmount(150);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(150);
    });
    test('validateAmount rejeita negativo', () => {
      expect(PaymentValidation.validateAmount(-10).valid).toBe(false);
    });
    test('validatePaymentMethod aceita pix', () => {
      expect(PaymentValidation.validatePaymentMethod('pix').valid).toBe(true);
    });
    test('validateCardDetails válido', () => {
      const details = { last4: '1234', brand: 'Visa', holderName: 'João' };
      const result = PaymentValidation.validateCardDetails(details, 'credit_card');
      expect(result.valid).toBe(true);
    });
  });

  describe('Payment Model', () => {
    test('markAsPaid altera status', () => {
      const p = new Payment({ amount: 100 });
      p.markAsPaid('tx123');
      expect(p.status).toBe('paid');
      expect(p.transactionId).toBe('tx123');
    });
  });

  describe('CreatePaymentUseCase', () => {
    test('cria pagamento pix com sucesso', async () => {
      const PaymentGateway = require('../../services/PaymentGatewayService');
      PaymentGateway.generatePix.mockResolvedValue({ code: 'code', qrCode: 'qr', expiresAt: new Date() });
      const saveMock = jest.fn().mockResolvedValue(true);
      Payment.prototype.save = saveMock;
      const result = await CreatePaymentUseCase.execute({
        userId: '507f1f77bcf86cd799439011',
        petId: '507f1f77bcf86cd799439012',
        amount: 50,
        paymentMethod: 'pix'
      });
      expect(result.success).toBe(true);
      expect(result.payment.paymentMethod).toBe('pix');
    });
  });
});
