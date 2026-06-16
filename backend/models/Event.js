const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'canceled'],
    default: 'scheduled'
  },
  maxParticipants: {
    type: Number,
    min: 1,
    max: 100,
    default: 10
  },
  metadata: {
    type: Map,
    of: String
  }
}, { timestamps: true });

eventSchema.index({ userId: 1, date: -1 });
eventSchema.index({ status: 1 });

eventSchema.methods.cancel = function() {
  this.status = 'canceled';
  return this;
};

eventSchema.methods.complete = function() {
  this.status = 'completed';
  return this;
};

eventSchema.methods.start = function() {
  this.status = 'ongoing';
  return this;
};

eventSchema.statics.findByUserId = function(userId) {
  return this.find({ userId: { $eq: userId } }).sort('date');
};

eventSchema.statics.findByIdAndUserId = function(id, userId) {
  return this.findOne({ _id: { $eq: id }, userId: { $eq: userId } });
};

eventSchema.statics.getStats = async function(userId) {
  const match = userId ? { userId: { $eq: userId } } : {};
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        scheduled: {
          $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] }
        },
        ongoing: {
          $sum: { $cond: [{ $eq: ['$status', 'ongoing'] }, 1, 0] }
        },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        canceled: {
          $sum: { $cond: [{ $eq: ['$status', 'canceled'] }, 1, 0] }
        },
        avgParticipants: { $avg: '$maxParticipants' }
      }
    }
  ]);
  return stats[0] || {
    total: 0,
    scheduled: 0,
    ongoing: 0,
    completed: 0,
    canceled: 0,
    avgParticipants: 0
  };
};

module.exports = mongoose.model('Event', eventSchema);