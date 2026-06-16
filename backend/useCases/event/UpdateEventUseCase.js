const Event = require('../../models/Event');
const mongoose = require('mongoose');

const ALLOWED_UPDATE_FIELDS = [
  'title',
  'description',
  'date',
  'status',
  'maxParticipants',
  'metadata',
];

class UpdateEventUseCase {
  static async update(id, userId, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID inválido');
    }

    const sanitized = {};
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (updateData[key] !== undefined) {
        if (typeof updateData[key] === 'object' && updateData[key] !== null) {
          throw new Error(`Campo '${key}' não pode ser um objeto`);
        }
        sanitized[key] = updateData[key];
      }
    }

    if (sanitized.maxParticipants !== undefined) {
      const max = Number(sanitized.maxParticipants);
      if (!Number.isInteger(max) || max < 1 || max > 100) {
        throw new Error('maxParticipants deve ser um inteiro entre 1 e 100');
      }
    }

    if (sanitized.status !== undefined) {
      const validStatus = ['scheduled', 'ongoing', 'completed', 'canceled'];
      if (!validStatus.includes(sanitized.status)) {
        throw new Error('Status inválido');
      }
    }

    const event = await Event.findOneAndUpdate(
      { _id: { $eq: id }, userId: { $eq: userId } },
      { $set: sanitized },
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