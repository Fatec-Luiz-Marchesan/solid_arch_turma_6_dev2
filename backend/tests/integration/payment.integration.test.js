const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../index');
const User = require('../../models/User');
const Pet = require('../../models/Pet');
const Payment = require('../../models/Payment');
const { generateToken } = require('../../helpers/create-user-token');

let authToken;
let userId;
let testPetId;

beforeEach(async () => {
  const user = new User({
    name: 'Payment Tester',
    email: `payment_${Date.now()}@test.com`,
    password: 'hashed123'
  });
  await user.save();
  userId = user._id;
  authToken = generateToken(user);

  const pet = new Pet({
    name: 'Rex',
    species: 'dog',
    userId: userId,
    available: true
  });
  await pet.save();
  testPetId = pet._id;
});

afterEach(async () => {
  await User.deleteMany({});
  await Pet.deleteMany({});
  await Payment.deleteMany({});
});

describe('Payment Integration Tests', () => {
  test('POST /api/payments - deve criar pagamento pendente', async () => {
    const payload = {
      petId: testPetId,
      amount: 150.00,
      paymentMethod: 'credit_card',
      cardDetails: { last4: '1234', brand: 'Visa', holderName: 'John Doe' }
    };

    const response = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload)
      .expect(201);

    expect(response.body).toHaveProperty('_id');
    expect(response.body.amount).toBe(150);
    expect(response.body.paymentMethod).toBe('credit_card');
    expect(response.body.status).toBe('pending');
    expect(response.body.userId).toBe(userId.toString());
  });

  test('POST /api/payments - deve retornar 400 se faltar amount', async () => {
    const payload = { petId: testPetId, paymentMethod: 'pix' };
    const response = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload)
      .expect(400);
    expect(response.body.message).toMatch(/amount|required/i);
  });

  test('GET /api/payments/:id - deve obter pagamento por ID', async () => {
    const payment = new Payment({
      userId,
      petId: testPetId,
      amount: 99.90,
      paymentMethod: 'boleto',
      status: 'paid'
    });
    await payment.save();

    const response = await request(app)
      .get(`/api/payments/${payment._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.payment._id).toBe(payment._id.toString());
    expect(response.body.payment.status).toBe('paid');
  });

  test('GET /api/payments/:id - deve retornar 404 para ID inexistente', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    await request(app)
      .get(`/api/payments/${fakeId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(404);
  });

  test('GET /api/payments/user - deve listar pagamentos do usuário', async () => {
    await Payment.create([
      { userId, petId: testPetId, amount: 50, paymentMethod: 'pix', status: 'paid' },
      { userId, petId: testPetId, amount: 30, paymentMethod: 'credit_card', status: 'pending' }
    ]);

    const response = await request(app)
      .get('/api/payments/user')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.payments).toHaveLength(2);
    expect(response.body.count).toBe(2);
  });

  test('GET /api/payments/pet/:petId - deve listar pagamentos de um pet', async () => {
    await Payment.create([
      { userId, petId: testPetId, amount: 120, paymentMethod: 'cash', status: 'paid' }
    ]);

    const response = await request(app)
      .get(`/api/payments/pet/${testPetId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.payments).toHaveLength(1);
    expect(response.body.payments[0].amount).toBe(120);
  });

  test('GET /api/payments/stats - deve retornar estatísticas', async () => {
    await Payment.create([
      { userId, petId: testPetId, amount: 200, paymentMethod: 'pix', status: 'paid' },
      { userId, petId: testPetId, amount: 50, paymentMethod: 'pix', status: 'pending' },
      { userId, petId: testPetId, amount: 30, paymentMethod: 'pix', status: 'failed' }
    ]);

    const response = await request(app)
      .get('/api/payments/stats')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.totalPaid).toBe(200);
    expect(response.body.totalPending).toBe(50);
    expect(response.body.countPaid).toBe(1);
    expect(response.body.countPending).toBe(1);
    expect(response.body.countFailed).toBe(1);
  });

  test('PUT /api/payments/:id/cancel - deve cancelar pagamento pendente', async () => {
    const payment = new Payment({
      userId,
      petId: testPetId,
      amount: 75,
      paymentMethod: 'boleto',
      status: 'pending'
    });
    await payment.save();

    const response = await request(app)
      .put(`/api/payments/${payment._id}/cancel`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.payment.status).toBe('canceled');
    expect(response.body.payment.canceledAt).toBeDefined();
  });

  test('PUT /api/payments/:id/refund - deve reembolsar pagamento pago', async () => {
    const payment = new Payment({
      userId,
      petId: testPetId,
      amount: 200,
      paymentMethod: 'pix',
      status: 'paid',
      paidAt: new Date()
    });
    await payment.save();

    const response = await request(app)
      .put(`/api/payments/${payment._id}/refund`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);

    expect(response.body.payment.status).toBe('refunded');
    expect(response.body.payment.refundedAt).toBeDefined();
  });
});