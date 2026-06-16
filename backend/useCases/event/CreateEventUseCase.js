const Event = require('../../models/Event');

class CreateEventUseCase {
  static async execute({ userId, title, description, date, maxParticipants }) {
    if (!title || !date) {
      throw new Error('Título e data são obrigatórios');
    }

    const sanitized = {
      userId,
      title: title.trim(),
      description: description ? description.trim() : '',
      date: new Date(date),
      maxParticipants: maxParticipants ? Number(maxParticipants) : 10
    };

    if (isNaN(sanitized.date.getTime())) {
      throw new Error('Data inválida');
    }

    if (sanitized.maxParticipants < 1 || sanitized.maxParticipants > 100) {
      throw new Error('maxParticipants deve ser entre 1 e 100');
    }

    const event = new Event(sanitized);
    await event.save();
    return event;
  }
}

module.exports = CreateEventUseCase;