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
  describe('POST /api/payments', () => {
    it('should create a pending payment successfully', async () => {
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
      expect(response.body.petId).toBe(testPetId.toString());
    });

    it('should return 400 if amount is missing', async () => {
      const payload = { petId: testPetId, paymentMethod: 'pix' };
      const response = await request(app)
        .post('/api/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload)
        .expect(400);

      expect(response.body.message).toMatch(/amount|required/i);
    });

    it('should return 401 if no token is provided', async () => {
      const payload = { petId: testPetId, amount: 50, paymentMethod: 'cash' };
      await request(app)
        .post('/api/payments')
        .send(payload)
        .expect(401);
    });
  });

  describe('GET /api/payments/:id', () => {
    it('should get payment by id', async () => {
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

    it('should return 404 for non-existent payment', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      await request(app)
        .get(`/api/payments/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('GET /api/payments/user', () => {
    it('should return all payments of authenticated user', async () => {
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
  });

  describe('GET /api/payments/pet/:petId', () => {
    it('should return payments for a specific pet', async () => {
      await Payment.create([
        { userId, petId: testPetId, amount: 120, paymentMethod: 'cash', status: 'paid' },
        { userId, petId: new mongoose.Types.ObjectId(), amount: 80, paymentMethod: 'debit_card', status: 'pending' }
      ]);

      const response = await request(app)
        .get(`/api/payments/pet/${testPetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.payments).toHaveLength(1);
      expect(response.body.payments[0].amount).toBe(120);
    });
  });

  describe('GET /api/payments/stats', () => {
    it('should return payment statistics for the user', async () => {
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
  });

  describe('PUT /api/payments/:id/cancel', () => {
    it('should cancel a pending payment', async () => {
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

      const updated = await Payment.findById(payment._id);
      expect(updated.status).toBe('canceled');
    });

    it('should not cancel an already paid payment', async () => {
      const payment = new Payment({
        userId,
        petId: testPetId,
        amount: 75,
        paymentMethod: 'credit_card',
        status: 'paid'
      });
      await payment.save();

      await request(app)
        .put(`/api/payments/${payment._id}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PUT /api/payments/:id/refund', () => {
    it('should refund a paid payment', async () => {
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

    it('should return 400 when refunding a pending payment', async () => {
      const payment = new Payment({
        userId,
        petId: testPetId,
        amount: 100,
        paymentMethod: 'boleto',
        status: 'pending'
      });
      await payment.save();

      await request(app)
        .put(`/api/payments/${payment._id}/refund`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });
});