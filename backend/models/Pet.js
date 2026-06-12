const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'O nome é obrigatório'],
    trim: true
  },
  age: {
    type: Number,
    required: [true, 'A idade é obrigatória'],
    min: [0, 'Idade não pode ser negativa']
  },
  weight: {
    type: Number,
    required: [true, 'O peso é obrigatório'],
    min: [0, 'Peso não pode ser negativo']
  },
  color: {
    type: String,
    required: [true, 'A cor é obrigatória']
  },
  description: {
    type: String,
    maxlength: [500, 'Descrição muito longa']
  },
  vaccinated: {
    type: Boolean,
    default: false
  },
  healthStatus: {
    type: String,
    enum: ['healthy', 'sick', 'treatment', 'recovering'],
    default: 'healthy'
  },
  lastVetVisit: {
    type: Date,
    default: null
  },
  images: [{
    type: String
  }],
  available: {
    type: Boolean,
    default: true
  },
  user: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    image: { type: String },
    phone: { type: String, required: true }
  },
  adopter: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    image: { type: String }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Pet', petSchema);
