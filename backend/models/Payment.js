const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet', required: true },
  amount: { type: Number, required: true, min: 0.01, max: 10000 },
  currency: { type: String, enum: ['BRL', 'USD', 'EUR'], default: 'BRL' },
  status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded', 'canceled'], default: 'pending' },
  paymentMethod: { type: String, enum: ['credit_card', 'debit_card', 'pix', 'boleto', 'cash'], required: true },
  transactionId: { type: String, unique: true, sparse: true },
  cardDetails: { last4: String, brand: String, holderName: String },
  pixDetails: { code: String, qrCode: String, expiresAt: Date },
  boletoDetails: { barcode: String, url: String, dueDate: Date },
  paidAt: Date, refundedAt: Date, canceledAt: Date,
  metadata: { type: Map, of: String }
}, { timestamps: true });

paymentSchema.methods.markAsPaid = function(transactionId) {
  this.status = 'paid';
  this.transactionId = transactionId;
  this.paidAt = new Date();
  return this;
};
paymentSchema.methods.markAsFailed = function() { this.status = 'failed'; return this; };
paymentSchema.methods.markAsRefunded = function() { this.status = 'refunded'; this.refundedAt = new Date(); return this; };
paymentSchema.methods.markAsCanceled = function() { this.status = 'canceled'; this.canceledAt = new Date(); return this; };

paymentSchema.statics.findByUser = function(userId) { return this.find({ userId }).sort('-createdAt'); };
paymentSchema.statics.findByPet = function(petId) { return this.find({ petId }).sort('-createdAt'); };
paymentSchema.statics.getStats = async function(userId) {
  const match = userId ? { userId: mongoose.Types.ObjectId(userId) } : {};
  const stats = await this.aggregate([
    { $match: match },
    { $group: {
      _id: null,
      totalPaid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$amount', 0] } },
      totalPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$amount', 0] } },
      countPaid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
      countPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
      countFailed: { $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] } }
    }}
  ]);
  return stats[0] || { totalPaid: 0, totalPending: 0, countPaid: 0, countPending: 0, countFailed: 0 };
};

module.exports = mongoose.model('Payment', paymentSchema);
