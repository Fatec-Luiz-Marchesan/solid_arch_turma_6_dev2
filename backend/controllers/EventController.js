const CreateEventUseCase = require('../useCases/event/CreateEventUseCase');
const GetEventUseCase = require('../useCases/event/GetEventUseCase');
const UpdateEventUseCase = require('../useCases/event/UpdateEventUseCase');
const logger = require('../config/logger');

class EventController {
  async create(req, res) {
    try {
      const userId = req.userId;
      const { title, description, date, maxParticipants } = req.body;
      const event = await CreateEventUseCase.execute({ userId, title, description, date, maxParticipants });
      res.status(201).json(event);
    } catch (error) {
      logger.error(`Create event error: ${error.message}`);
      res.status(400).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const event = await GetEventUseCase.getById(id, userId);
      res.json(event);
    } catch (error) {
      logger.error(`Get event error: ${error.message}`);
      res.status(404).json({ message: error.message });
    }
  }

  async getUserEvents(req, res) {
    try {
      const userId = req.userId;
      const events = await GetEventUseCase.getByUser(userId);
      res.json({ events, count: events.length });
    } catch (error) {
      logger.error(`Get user events error: ${error.message}`);
      res.status(400).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const updateData = req.body;
      const event = await UpdateEventUseCase.update(id, userId, updateData);
      res.json(event);
    } catch (error) {
      logger.error(`Update event error: ${error.message}`);
      const status = error.message.includes('não encontrado') ? 404 : 400;
      res.status(status).json({ message: error.message });
    }
  }

  async cancel(req, res) {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const event = await UpdateEventUseCase.cancel(id, userId);
      res.json({ message: 'Evento cancelado com sucesso', event });
    } catch (error) {
      logger.error(`Cancel event error: ${error.message}`);
      res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new EventController();