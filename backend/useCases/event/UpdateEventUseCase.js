const Event = require('../../models/Event');
const mongoose = require('mongoose');

class UpdateEventUseCase {
  static async update(id, userId, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID inválido');
    }

    if (updateData.maxParticipants !== undefined) {
      const max = Number(updateData.maxParticipants);
      if (!Number.isInteger(max) || max < 1 || max > 100) {
        throw new Error('maxParticipants deve ser um inteiro entre 1 e 100');
      }
    }

    const event = await Event.findOneAndUpdate(
      { _id: { $eq: id }, userId: { $eq: userId } }, 
      updateData,
      { new: true, runValidators: true }
    );

    if (!event) {
      throw new Error('Evento não encontrado');
    }

    return event;
  }

  static async cancel(id, userId) {
    return this.update(id, userId, { status: 'canceled' });
  }
}

module.exports = UpdateEventUseCase;