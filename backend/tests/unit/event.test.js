const request = require('supertest');
const { app } = require('../../index');
const Event = require('../../models/Event');

describe('Event Controller - maxParticipants', () => {
  beforeEach(async () => {
    await Event.deleteMany();
  });

  it('deve criar evento com maxParticipants válido', async () => {
    const payload = { title: 'Meetup', date: '2025-01-01', maxParticipants: 75 };
    const res = await request(app).post('/api/events').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.maxParticipants).toBe(75);
  });

  it('deve rejeitar maxParticipants > 100', async () => {
    const payload = { title: 'Grande Evento', date: '2025-01-01', maxParticipants: 150 };
    const res = await request(app).post('/api/events').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/entre 1 e 100/);
  });

  it('deve rejeitar maxParticipants < 1', async () => {
    const payload = { title: 'Evento Inválido', date: '2025-01-01', maxParticipants: 0 };
    const res = await request(app).post('/api/events').send(payload);
    expect(res.status).toBe(400);
  });
});