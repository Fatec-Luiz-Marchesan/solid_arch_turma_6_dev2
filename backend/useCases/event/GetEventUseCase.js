const Event = require('../../models/Event');
const mongoose = require('mongoose');

class GetEventUseCase {
  static async getById(id, userId) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID inválido');
    }
    const event = await Event.findByIdAndUserId(id, userId);
    if (!event) throw new Error('Evento não encontrado');
    return event;
  }

  static async getByUser(userId) {
    return Event.findByUserId(userId);
  }

  static async getStats(userId) {
    return Event.getStats(userId);
  }
}

module.exports = GetEventUseCase;