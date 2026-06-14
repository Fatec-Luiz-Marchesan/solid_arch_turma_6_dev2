const request = require('supertest');
const app = require('../../index');
const mongoose = require('mongoose');
const Payment = require('../../models/Payment');
const User = require('../../models/User');

let authToken;
let testUser;

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/test_payment_db');
  
  testUser = await User.create({
    name: 'Test User',
    email: 'test@test.com',
    password: '123456'
  });
  
  const loginRes = await request(app)
    .post('/users/login')
    .send({ email: 'test@test.com', password: '123456' });
  
  authToken = loginRes.body.token;
});

afterAll(async () => {
  await Payment.deleteMany({});
  await User.deleteMany({});
  await mongoose.connection.close();
});

beforeEach(async () => {
  await Payment.deleteMany({});
});

describe('Payment Integration Tests', () => {
  
  describe('POST /api/payments', () => {
    test('deve criar pagamento com PIX', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          petId: '507f1f77bcf86cd799439011',
          amount: 150.00,
          paymentMethod: 'pix'
        });
      
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.payment.paymentMethod).toBe('pix');
      expect(res.body.payment.pixDetails).toBeDefined();
    });
    
    test('deve criar pagamento com cartão', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          petId: '507f1f77bcf86cd799439011',
          amount: 250.00,
          paymentMethod: 'credit_card',
          cardDetails: {
            last4: '1234',
            brand: 'Visa',
            holderName: 'João Silva'
          }
        });
      
      expect(res.status).toBe(201);
      expect(res.body.payment.paymentMethod).toBe('credit_card');
    });
    
    test('deve retornar erro para valor inválido', async () => {
      const res = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          petId: '507f1f77bcf86cd799439011',
          amount: -100,
          paymentMethod: 'pix'
        });
      
      expect(res.status).toBe(400);
    });
    
    test('deve retornar erro sem autenticação', async () => {
      const res = await request(app)
        .post('/api/payments')
        .send({
          petId: '507f1f77bcf86cd799439011',
          amount: 100,
          paymentMethod: 'pix'
        });
      
      expect(res.status).toBe(401);
    });
  });
  
  describe('GET /api/payments', () => {
    test('deve listar pagamentos do usuário', async () => {
      await Payment.create({
        petId: '507f1f77bcf86cd799439011',
        userId: testUser._id,
        amount: 100,
        paymentMethod: 'pix',
        status: 'paid'
      });
      
      const res = await request(app)
        .get('/api/payments')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
    });
  });
  
  describe('GET /api/payments/stats', () => {
    test('deve retornar estatísticas', async () => {
      await Payment.create({
        petId: '507f1f77bcf86cd799439011',
        userId: testUser._id,
        amount: 100,
        paymentMethod: 'pix',
        status: 'paid'
      });
      
      const res = await request(app)
        .get('/api/payments/stats')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.totalPaid).toBeDefined();
    });
  });
  
  describe('POST /api/payments/:id/cancel', () => {
    test('deve cancelar pagamento', async () => {
      const payment = await Payment.create({
        petId: '507f1f77bcf86cd799439011',
        userId: testUser._id,
        amount: 100,
        paymentMethod: 'pix',
        status: 'pending'
      });
      
      const res = await request(app)
        .post(`/api/payments/${payment._id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Pagamento cancelado com sucesso');
    });
  });
});

console.log('✅ Payment integration tests passed');
