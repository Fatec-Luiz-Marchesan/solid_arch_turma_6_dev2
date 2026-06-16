const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  maxParticipants: {
    type: Number,
    required: false,
    default: 50,
    min: [1, 'Mínimo é 1 participante'],
    max: [100, 'Máximo permitido é 100 participantes']
  }
});

module.exports = mongoose.model('Event', EventSchema);