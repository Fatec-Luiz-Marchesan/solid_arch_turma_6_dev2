const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['pets', 'adoptions', 'vaccines', 'locations', 'diets', 'payments'],
    required: true
  },
  format: {
    type: String,
    enum: ['json', 'csv', 'pdf'],
    default: 'json'
  },
  filters: {
    startDate: { type: Date },
    endDate: { type: Date },
    status: { type: String },
    species: { type: String },
    vaccinated: { type: Boolean },
    paymentStatus: { type: String }
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  totalRecords: {
    type: Number,
    default: 0
  },
  generatedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  downloadUrl: {
    type: String,
    default: ''
  }
}, { timestamps: true });

reportSchema.methods.markAsCompleted = function(data, count) {
  this.status = 'completed';
  this.data = data || {};
  this.totalRecords = count || 0;
  this.generatedAt = new Date();
  return this;
};

reportSchema.methods.markAsFailed = function() {
  this.status = 'failed';
  return this;
};

reportSchema.methods.markAsProcessing = function() {
  this.status = 'processing';
  return this;
};

reportSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort('-createdAt');
};

reportSchema.statics.getStats = async function(userId) {
  const match = userId ? { userId: new mongoose.Types.ObjectId(userId) } : {};
  const stats = await this.aggregate([
    { $match: match },
    { $group: {
      _id: '$status',
      count: { $sum: 1 }
    }}
  ]);
  const result = { total: 0, pending: 0, processing: 0, completed: 0, failed: 0 };
  stats.forEach(stat => {
    result.total += stat.count;
    result[stat._id] = stat.count;
  });
  return result;
};

module.exports = mongoose.model('Report', reportSchema);
