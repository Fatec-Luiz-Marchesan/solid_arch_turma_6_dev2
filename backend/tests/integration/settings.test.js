const request = require('supertest');
const express = require('express');
const SettingsController = require('../../controllers/SettingsController');
const authMiddleware = require('../../middlewares/authMiddleware');
const { apiLimiter } = require('../../middlewares/rateLimiter');

jest.mock('../../middlewares/authMiddleware', () => (req, res, next) => {
  req.userId = '507f1f77bcf86cd799439011';
  next();
});
jest.mock('../../middlewares/rateLimiter', () => ({ apiLimiter: (req, res, next) => next() }));

const app = express();
app.use(express.json());
app.use('/api/settings', require('../../routers/SettingsRoutes'));

describe('Settings Integration Tests (mocked auth)', () => {
  test('POST /api/settings - criar configurações', async () => {
    const res = await request(app)
      .post('/api/settings')
      .send({ notifications: { email: false }, theme: 'dark' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/settings - buscar configurações', async () => {
    const res = await request(app).get('/api/settings');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test('PUT /api/settings - atualizar configurações', async () => {
    const res = await request(app)
      .put('/api/settings')
      .send({ theme: 'light' });
    expect(res.status).toBe(200);
  });

  test('DELETE /api/settings - deletar configurações', async () => {
    const res = await request(app).delete('/api/settings');
    expect(res.status).toBe(200);
  });
});
