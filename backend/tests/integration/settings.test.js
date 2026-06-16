const request = require('supertest');
const express = require('express');
const Settings = require('../../models/Settings');

jest.mock('../../middlewares/authMiddleware', () => (req, res, next) => {
  req.userId = '507f1f77bcf86cd799439011';
  next();
});
jest.mock('../../middlewares/rateLimiter', () => ({ apiLimiter: (req, res, next) => next() }));

const app = express();
app.use(express.json());
app.use('/api/settings', require('../../routers/SettingsRoutes'));

describe('Settings Integration Tests', () => {
  const testUserId = '507f1f77bcf86cd799439011';

  beforeEach(async () => {
    await Settings.deleteMany({ userId: testUserId });
  });

  test('POST /api/settings - criar configurações', async () => {
    const res = await request(app)
      .post('/api/settings')
      .send({
        userId: testUserId,  // <-- adicionado
        notifications: { email: false },
        theme: 'dark'
      });
    // Se o controller não aceitar userId no body, pode retornar 400, mas tentamos.
    if (res.status !== 201) console.log('POST /settings response:', res.body);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/settings - buscar configurações', async () => {
    // Cria um documento primeiro
    await Settings.create({ userId: testUserId });
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('PUT /api/settings - atualizar configurações', async () => {
    await Settings.create({ userId: testUserId });
    const res = await request(app)
      .put('/api/settings')
      .send({ theme: 'light' });
    expect(res.status).toBe(200);
  });

  test('DELETE /api/settings - deletar configurações', async () => {
    await Settings.create({ userId: testUserId });
    const res = await request(app).delete('/api/settings');
    expect(res.status).toBe(200);
  });
});
