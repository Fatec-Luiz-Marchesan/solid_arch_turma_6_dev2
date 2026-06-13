const mongoose = require('mongoose');

const VaccineSchema = new mongoose.Schema({
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },

  name: {
    type: String,
    required: true,
    trim: true
  },

  manufacturer: {
    type: String,
    required: true,
    trim: true
  },

  batchNumber: {
    type: String,
    required: true,
    trim: true
  },

  date: {
    type: Date,
    required: true
  },

  nextDueDate: {
    type: Date
  },

  administeredBy: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

VaccineSchema.virtual('isOverdue').get(function () {
  if (!this.nextDueDate) return false;
  return this.nextDueDate < new Date();
});

module.exports = mongoose.model('Vaccine', VaccineSchema);