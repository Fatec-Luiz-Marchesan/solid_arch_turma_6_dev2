const Event = require('../../models/Event');
const mongoose = require('mongoose');

class UpdateEventUseCase {
  static async update(id, userId, updateData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error('ID inválido');
    }

    const allowedFields = ['title', 'description', 'date', 'status', 'maxParticipants'];
    const sanitizedData = {};

    for (const field of allowedFields) {
      if (updateData[field] !== undefined) {
        if (field === 'maxParticipants') {
          const max = Number(updateData[field]);
          if (!Number.isInteger(max) || max < 1 || max > 100) {
            throw new Error('maxParticipants deve ser um inteiro entre 1 e 100');
          }
          sanitizedData[field] = max;
        } else if (field === 'status') {
          const validStatus = ['scheduled', 'ongoing', 'completed', 'canceled'];
          if (!validStatus.includes(updateData[field])) {
            throw new Error('Status inválido');
          }
          sanitizedData[field] = updateData[field];
        } else if (field === 'date') {
          const date = new Date(updateData[field]);
          if (isNaN(date.getTime())) {
            throw new Error('Data inválida');
          }
          sanitizedData[field] = date;
        } else {
          if (typeof updateData[field] !== 'string') {
            throw new Error(`Campo ${field} deve ser uma string`);
          }
          sanitizedData[field] = updateData[field];
        }
      }
    }

    if (Object.keys(sanitizedData).length === 0) {
      throw new Error('Nenhum campo válido para atualizar');
    }

    const event = await Event.findOneAndUpdate(
      { _id: { $eq: id }, userId: { $eq: userId } },
      sanitizedData,
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