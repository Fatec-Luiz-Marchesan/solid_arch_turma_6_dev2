const mongoose = require('mongoose')

const VaccineSchema = new mongoose.Schema(
  {
    petId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Pet',
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    manufacturer: {
      type: String,
      required: true,
    },

    batchNumber: {
      type: String,
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    nextDueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

VaccineSchema.virtual('isOverdue').get(function () {
  if (!this.nextDueDate) {
    return false
  }

  return this.nextDueDate < new Date()
})

module.exports = mongoose.model('Vaccine', VaccineSchema)