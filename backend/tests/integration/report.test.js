// Mocks dos middlewares ANTES de importar as rotas
jest.mock('../../middlewares/authMiddleware', () => (req, res, next) => {
  req.userId = '507f1f77bcf86cd799439011';
  next();
});
jest.mock('../../middlewares/rateLimiter', () => ({
  apiLimiter: (req, res, next) => next(),
  authLimiter: (req, res, next) => next(),
  strictLimiter: (req, res, next) => next(),
}));

const request = require('supertest');
const express = require('express');
const Report = require('../../models/Report');
const ReportRoutes = require('../../routers/ReportRoutes');

const app = express();
app.use(express.json());
app.use('/api/reports', ReportRoutes);

describe('Report Integration Tests', () => {
  const testUserId = '507f1f77bcf86cd799439011';

  beforeEach(async () => {
    await Report.deleteMany({ userId: testUserId });
  });

  test('POST /api/reports - gerar relatório', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({
        name: 'Relatório de Pets',
        type: 'pets',
        format: 'json'
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  test('GET /api/reports - listar relatórios', async () => {
    await Report.create({ userId: testUserId, name: 'Teste', type: 'pets' });
    const res = await request(app).get('/api/reports');
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
  });

  test('GET /api/reports/:id - buscar relatório', async () => {
    const report = await Report.create({ userId: testUserId, name: 'Teste', type: 'pets' });
    const res = await request(app).get(`/api/reports/${report._id}`);
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(report._id.toString());
  });

  test('GET /api/reports/:id/export - exportar relatório', async () => {
    const report = await Report.create({
      userId: testUserId,
      name: 'Teste',
      type: 'pets',
      status: 'completed',
      data: []
    });
    const res = await request(app).get(`/api/reports/${report._id}/export`);
    expect(res.status).toBe(200);
  });

  test('DELETE /api/reports/:id - deletar relatório', async () => {
    const report = await Report.create({ userId: testUserId, name: 'Teste', type: 'pets' });
    const res = await request(app).delete(`/api/reports/${report._id}`);
    expect(res.status).toBe(200);
  });
});
