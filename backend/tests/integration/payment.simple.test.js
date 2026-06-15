const PaymentController = require('../../controllers/PaymentController');
const Payment = require('../../models/Payment');
const PaymentGateway = require('../../services/PaymentGatewayService');
const PaymentValidation = require('../../helpers/paymentValidation');

jest.mock('../../models/Payment');
jest.mock('../../services/PaymentGatewayService');
jest.mock('../../helpers/paymentValidation');

describe('Payment Controller Tests (Mocked)', () => {
  let req, res;

  beforeEach(() => {
    req = {
      userId: '507f1f77bcf86cd799439011',
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  test('create - deve retornar 201 ao criar pagamento PIX', async () => {
    req.body = {
      petId: '507f1f77bcf86cd799439012',
      amount: 100,
      paymentMethod: 'pix'
    };

    const mockPayment = {
      _id: 'payment123',
      save: jest.fn().mockResolvedValue(true),
      pixDetails: { code: 'code', qrCode: 'qr', expiresAt: new Date() }
    };
    Payment.mockImplementation(() => mockPayment);
    PaymentGateway.generatePix.mockResolvedValue({ code: 'code', qrCode: 'qr', expiresAt: new Date() });
    PaymentValidation.validateAmount.mockReturnValue({ valid: true, value: 100 });
    PaymentValidation.validatePaymentMethod.mockReturnValue({ valid: true, value: 'pix' });
    PaymentValidation.validateCardDetails.mockReturnValue({ valid: true });

    await PaymentController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  test('create - deve retornar 400 para valor inválido', async () => {
    req.body = {
      petId: '507f1f77bcf86cd799439012',
      amount: -10,
      paymentMethod: 'pix'
    };
    PaymentValidation.validateAmount.mockReturnValue({ valid: false, message: 'Valor mínimo é R$ 0,01' });

    await PaymentController.create(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Valor mínimo é R$ 0,01' });
  });

  test('getUserPayments - deve retornar lista de pagamentos', async () => {
    Payment.findByUser = jest.fn().mockResolvedValue([{ _id: '1', amount: 100 }]);
    await PaymentController.getUserPayments(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ payments: [{ _id: '1', amount: 100 }], count: 1 });
  });

  test('getById - deve retornar pagamento por ID', async () => {
    req.params = { id: '507f1f77bcf86cd799439011' };
    Payment.findOne = jest.fn().mockResolvedValue({ _id: '123', amount: 200 });
    await PaymentController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ payment: { _id: '123', amount: 200 } });
  });

  test('getById - deve retornar 404 se não encontrado', async () => {
    req.params = { id: '507f1f77bcf86cd799439011' };
    Payment.findOne = jest.fn().mockResolvedValue(null);
    await PaymentController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pagamento não encontrado' });
  });

  test('cancel - deve cancelar pagamento', async () => {
    req.params = { id: '507f1f77bcf86cd799439011' };
    const mockPayment = { markAsCanceled: jest.fn(), save: jest.fn() };
    Payment.findOne = jest.fn().mockResolvedValue(mockPayment);
    await PaymentController.cancel(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pagamento cancelado com sucesso', payment: mockPayment });
  });
});
