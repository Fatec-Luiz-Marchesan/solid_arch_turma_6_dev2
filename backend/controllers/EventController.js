const Event = require('../models/Event');

class EventController {
  async create(req, res) {
    try {
      const { title, date, maxParticipants } = req.body;

      if (maxParticipants !== undefined && (maxParticipants < 1 || maxParticipants > 100)) {
        return res.status(400).json({ message: 'maxParticipants deve ser entre 1 e 100' });
      }

      const event = await Event.create({ title, date, maxParticipants });
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const { maxParticipants } = req.body;

      if (maxParticipants !== undefined && (maxParticipants < 1 || maxParticipants > 100)) {
        return res.status(400).json({ message: 'maxParticipants deve ser entre 1 e 100' });
      }

      const updated = await Event.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ message: 'Evento não encontrado' });
      res.json(updated);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new EventController();