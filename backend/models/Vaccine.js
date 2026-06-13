

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
      trim: true,
      maxlength: 100,
    },

    manufacturer: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    batchNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
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