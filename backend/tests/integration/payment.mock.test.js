const request = require('supertest');
const express = require('express');
const PaymentController = require('../../controllers/PaymentController');
const Payment = require('../../models/Payment');

jest.mock('../../models/Payment');
jest.mock('../../services/PaymentGatewayService');
jest.mock('../../helpers/paymentValidation');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.userId = '507f1f77bcf86cd799439011';
  next();
});

const router = express.Router();
router.post('/', PaymentController.create);
router.get('/', PaymentController.getUserPayments);
router.get('/:id', PaymentController.getById);
app.use('/api/payments', router);

describe('Payment Integration (Mocked DB)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/payments - deve retornar 201 ao criar pagamento PIX', async () => {
    const mockPayment = {
      _id: 'payment123',
      save: jest.fn().mockResolvedValue(true),
      markAsPaid: jest.fn(),
      status: 'pending'
    };
    Payment.mockImplementation(() => mockPayment);
    const PaymentGateway = require('../../services/PaymentGatewayService');
    PaymentGateway.generatePix.mockResolvedValue({ code: 'code', qrCode: 'qr', expiresAt: new Date() });

    const res = await request(app)
      .post('/api/payments')
      .send({ petId: '507f1f77bcf86cd799439012', amount: 100, paymentMethod: 'pix' });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('POST /api/payments - deve retornar 400 com valor inválido', async () => {
    const res = await request(app)
      .post('/api/payments')
      .send({ petId: '507f1f77bcf86cd799439012', amount: -10, paymentMethod: 'pix' });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Valor mínimo');
  });

  test('GET /api/payments - deve retornar lista de pagamentos', async () => {
    Payment.findByUser = jest.fn().mockResolvedValue([{ _id: '1', amount: 100 }]);
    const res = await request(app).get('/api/payments');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.payments)).toBe(true);
    expect(res.body.count).toBe(1);
  });

  test('GET /api/payments/:id - deve retornar pagamento por ID', async () => {
    Payment.findOne = jest.fn().mockResolvedValue({ _id: '123', amount: 200 });
    const res = await request(app).get('/api/payments/507f1f77bcf86cd799439011');
    expect(res.status).toBe(200);
    expect(res.body.payment).toBeDefined();
  });

  test('GET /api/payments/:id - deve retornar 404 se não encontrado', async () => {
    Payment.findOne = jest.fn().mockResolvedValue(null);
    const res = await request(app).get('/api/payments/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
  });
});
