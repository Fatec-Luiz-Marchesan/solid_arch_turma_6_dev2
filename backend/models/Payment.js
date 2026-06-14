const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: [true, 'Pet ID é obrigatório']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID é obrigatório']
  },
  amount: {
    type: Number,
    required: [true, 'Valor é obrigatório'],
    min: [0.01, 'Valor mínimo é R$ 0,01'],
    max: [10000, 'Valor máximo é R$ 10.000']
  },
  currency: {
    type: String,
    enum: ['BRL', 'USD', 'EUR'],
    default: 'BRL'
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'canceled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'pix', 'boleto', 'cash'],
    required: [true, 'Método de pagamento é obrigatório']
  },
  cardDetails: {
    last4: { type: String },
    brand: { type: String },
    holderName: { type: String }
  },
  pixDetails: {
    code: { type: String },
    qrCode: { type: String },
    expiresAt: { type: Date }
  },
  boletoDetails: {
    barcode: { type: String },
    url: { type: String },
    dueDate: { type: Date }
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true
  },
  paidAt: {
    type: Date
  },
  refundedAt: {
    type: Date
  },
  canceledAt: {
    type: Date
  },
  metadata: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

paymentSchema.methods.markAsPaid = function(transactionId) {
  this.status = 'paid';
  this.transactionId = transactionId;
  this.paidAt = new Date();
  this.updatedAt = new Date();
  return this;
};

paymentSchema.methods.markAsFailed = function() {
  this.status = 'failed';
  this.updatedAt = new Date();
  return this;
};

paymentSchema.methods.markAsRefunded = function() {
  this.status = 'refunded';
  this.refundedAt = new Date();
  this.updatedAt = new Date();
  return this;
};

paymentSchema.methods.markAsCanceled = function() {
  this.status = 'canceled';
  this.canceledAt = new Date();
  this.updatedAt = new Date();
  return this;
};

paymentSchema.statics.findByUser = function(userId) {
  return this.find({ userId }).sort('-createdAt');
};

paymentSchema.statics.findByPet = function(petId) {
  return this.find({ petId }).sort('-createdAt');
};

paymentSchema.statics.getStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: userId ? { userId: mongoose.Types.ObjectId(userId) } : {} },
    {
      $group: {
        _id: null,
        totalPaid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } },
        totalPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
        countPaid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
        countPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        countFailed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
      }
    }
  ]);
  
  return stats[0] || { totalPaid: 0, totalPending: 0, countPaid: 0, countPending: 0, countFailed: 0 };
};

module.exports = mongoose.model('Payment', paymentSchema);
