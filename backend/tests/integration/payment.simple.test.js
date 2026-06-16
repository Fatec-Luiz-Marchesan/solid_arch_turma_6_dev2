const PaymentController = require('../../controllers/PaymentController');
const CreatePaymentUseCase = require('../../useCases/payment/CreatePaymentUseCase');
const GetPaymentUseCase = require('../../useCases/payment/GetPaymentUseCase');
const UpdatePaymentUseCase = require('../../useCases/payment/UpdatePaymentUseCase');

jest.mock('../../useCases/payment/CreatePaymentUseCase');
jest.mock('../../useCases/payment/GetPaymentUseCase');
jest.mock('../../useCases/payment/UpdatePaymentUseCase');

describe('Payment Controller Tests (Mocked Use Cases)', () => {
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

  test('create - deve retornar 201', async () => {
    req.body = { petId: 'p1', amount: 100, paymentMethod: 'pix' };
    CreatePaymentUseCase.execute.mockResolvedValue({ success: true, payment: { id: 'pay123' } });
    await PaymentController.create(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ success: true, payment: { id: 'pay123' } });
  });

  test('create - deve retornar 400 com valor inválido', async () => {
    req.body = { petId: 'p1', amount: -10, paymentMethod: 'pix' };
    CreatePaymentUseCase.execute.mockRejectedValue(new Error('Valor mínimo é R$ 0,01'));
    await PaymentController.create(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('getUserPayments - deve retornar 200', async () => {
    const mockPayments = [{ _id: '1', amount: 100 }];
    GetPaymentUseCase.getByUser.mockResolvedValue(mockPayments);
    await PaymentController.getUserPayments(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ payments: mockPayments, count: 1 });
  });

  test('getById - deve retornar 200', async () => {
    req.params = { id: 'pay123' };
    GetPaymentUseCase.getById.mockResolvedValue({ _id: 'pay123', amount: 50 });
    await PaymentController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ payment: { _id: 'pay123', amount: 50 } });
  });

  test('getById - deve retornar 404', async () => {
    req.params = { id: 'pay123' };
    GetPaymentUseCase.getById.mockRejectedValue(new Error('Pagamento não encontrado'));
    await PaymentController.getById(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Pagamento não encontrado' });
  });

  test('cancel - deve retornar 200', async () => {
    req.params = { id: 'pay123' };
    UpdatePaymentUseCase.cancel.mockResolvedValue({ _id: 'pay123', status: 'canceled' });
    await PaymentController.cancel(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Pagamento cancelado com sucesso',
      payment: { _id: 'pay123', status: 'canceled' }
    });
  });

  test('refund - deve retornar 200', async () => {
    req.params = { id: 'pay123' };
    UpdatePaymentUseCase.updateStatus.mockResolvedValue({ _id: 'pay123', status: 'refunded' });
    await PaymentController.refund(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Reembolso realizado com sucesso',
      payment: { _id: 'pay123', status: 'refunded' }
    });
  });
});
