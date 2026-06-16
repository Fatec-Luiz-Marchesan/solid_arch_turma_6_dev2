const Event = require('../../models/Event');

class CreateEventUseCase {
  static async execute({ userId, title, description, date, maxParticipants }) {
    if (maxParticipants !== undefined) {
      const max = Number(maxParticipants);
      if (!Number.isInteger(max) || max < 1 || max > 100) {
        throw new Error('maxParticipants deve ser um inteiro entre 1 e 100');
      }
    }

    const event = new Event({
      userId,
      title,
      description,
      date,
      maxParticipants: maxParticipants || 10,
    });
    await event.save();
    return event;
  }
}

module.exports = CreateEventUseCase;