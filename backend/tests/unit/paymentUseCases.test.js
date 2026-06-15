const CreatePaymentUseCase = require('../../useCases/payment/CreatePaymentUseCase');
const GetPaymentUseCase = require('../../useCases/payment/GetPaymentUseCase');
const UpdatePaymentUseCase = require('../../useCases/payment/UpdatePaymentUseCase');
const Payment = require('../../models/Payment');
const PaymentGateway = require('../../services/PaymentGatewayService');
const PaymentValidation = require('../../helpers/paymentValidation');

jest.mock('../../models/Payment');
jest.mock('../../services/PaymentGatewayService');
jest.mock('../../helpers/paymentValidation');

describe('Payment Use Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('CreatePaymentUseCase - sucesso com pix', async () => {
    const mockPayment = { save: jest.fn(), _id: 'p1' };
    Payment.mockImplementation(() => mockPayment);
    PaymentValidation.validateAmount.mockReturnValue({ valid: true, value: 100 });
    PaymentValidation.validatePaymentMethod.mockReturnValue({ valid: true, value: 'pix' });
    PaymentValidation.validateCardDetails.mockReturnValue({ valid: true });
    PaymentGateway.generatePix.mockResolvedValue({ code: 'c', qrCode: 'q', expiresAt: new Date() });
    const result = await CreatePaymentUseCase.execute({
      userId: 'u1', petId: 'p1', amount: 100, paymentMethod: 'pix'
    });
    expect(result.success).toBe(true);
  });

  test('CreatePaymentUseCase - falha na validação de valor', async () => {
    PaymentValidation.validateAmount.mockReturnValue({ valid: false, message: 'Valor inválido' });
    await expect(CreatePaymentUseCase.execute({ amount: -5 })).rejects.toThrow('Valor inválido');
  });

  test('GetPaymentUseCase - getById sucesso', async () => {
    PaymentValidation.validateObjectId.mockReturnValue({ valid: true });
    Payment.findOne.mockResolvedValue({ _id: '123' });
    const result = await GetPaymentUseCase.getById('507f1f77bcf86cd799439011');
    expect(result._id).toBe('123');
  });

  test('GetPaymentUseCase - getById não encontrado', async () => {
    PaymentValidation.validateObjectId.mockReturnValue({ valid: true });
    Payment.findOne.mockResolvedValue(null);
    await expect(GetPaymentUseCase.getById('507f1f77bcf86cd799439011')).rejects.toThrow('Pagamento não encontrado');
  });

  test('UpdatePaymentUseCase - cancelar pagamento', async () => {
    PaymentValidation.validateObjectId.mockReturnValue({ valid: true });
    const mockPayment = { markAsCanceled: jest.fn(), save: jest.fn() };
    Payment.findOne.mockResolvedValue(mockPayment);
    const result = await UpdatePaymentUseCase.cancel('507f1f77bcf86cd799439011');
    expect(mockPayment.markAsCanceled).toHaveBeenCalled();
    expect(result).toBe(mockPayment);
  });
});
