const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../../index');
const User = require('../../models/User');
const Event = require('../../models/Event');
const { generateToken } = require('../../helpers/create-user-token');

let authToken;
let userId;

beforeEach(async () => {
  const user = new User({
    name: 'Event Tester',
    email: `event_${Date.now()}@test.com`,
    password: 'hashed123',
  });
  await user.save();
  userId = user._id;
  authToken = generateToken(user);
});

afterEach(async () => {
  await User.deleteMany({});
  await Event.deleteMany({});
});

describe('Event Integration Tests', () => {
  test('POST /api/events - deve criar evento com maxParticipants', async () => {
    const payload = {
      title: 'Workshop',
      description: 'Node.js avançado',
      date: new Date().toISOString(),
      maxParticipants: 30,
    };
    const res = await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload)
      .expect(201);
    expect(res.body.title).toBe('Workshop');
    expect(res.body.maxParticipants).toBe(30);
  });

  test('POST /api/events - deve rejeitar maxParticipants > 100', async () => {
    const payload = {
      title: 'Invalid',
      date: new Date().toISOString(),
      maxParticipants: 150,
    };
    await request(app)
      .post('/api/events')
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload)
      .expect(400);
  });

  test('GET /api/events/:id - deve obter evento por ID', async () => {
    const event = new Event({ userId, title: 'Test', date: new Date() });
    await event.save();
    const res = await request(app)
      .get(`/api/events/${event._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body._id).toBe(event._id.toString());
  });

  test('PUT /api/events/:id - deve atualizar evento com sucesso', async () => {
    const event = new Event({ userId, title: 'Old', date: new Date() });
    await event.save();
    const update = { title: 'Updated', maxParticipants: 50 };
    const res = await request(app)
      .put(`/api/events/${event._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(update)
      .expect(200);
    expect(res.body.title).toBe('Updated');
    expect(res.body.maxParticipants).toBe(50);
  });

  test('PUT /api/events/:id - deve rejeitar atualização com campo inválido', async () => {
    const event = new Event({ userId, title: 'Test', date: new Date() });
    await event.save();
    const update = { maxParticipants: 0 };
    await request(app)
      .put(`/api/events/${event._id}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send(update)
      .expect(400);
  });

  test('PUT /api/events/:id/cancel - deve cancelar evento', async () => {
    const event = new Event({ userId, title: 'To Cancel', date: new Date() });
    await event.save();
    const res = await request(app)
      .put(`/api/events/${event._id}/cancel`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
    expect(res.body.event.status).toBe('canceled');
  });
});