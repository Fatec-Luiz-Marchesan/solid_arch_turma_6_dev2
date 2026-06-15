const request = require('supertest');
const app = require('./payment.app');
const mongoose = require('mongoose');
const User = require('../../models/User');

let authToken;
let userId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test_payment');
  await User.deleteMany();
  const user = await User.create({ name: 'Teste', email: 'teste@email.com', password: '123456', phone: '11999999999' });
  userId = user._id;
  const login = await request(app).post('/users/login').send({ email: 'teste@email.com', password: '123456' });
  authToken = login.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Payment Integration', () => {
  test('POST /api/payments - criar PIX', async () => {
    const res = await request(app)
      .post('/api/payments')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ petId: '507f1f77bcf86cd799439011', amount: 100, paymentMethod: 'pix' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/payments - listar do usuário', async () => {
    const res = await request(app)
      .get('/api/payments')
      .set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.payments)).toBe(true);
  });
});
