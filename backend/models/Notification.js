const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: { type: String, enum: ['info', 'success', 'warning', 'error'], default: 'info' },
    priority: { type: String, enum: ['baixa', 'media', 'alta'], default: 'media' },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    relatedTo: {
        modelType: { type: String, enum: ['pet', 'diet', 'vaccine', 'appointment', 'none'], default: 'none' },
        modelId: { type: mongoose.Schema.Types.ObjectId, refPath: 'relatedTo.modelType' }
    },
    scheduledFor: { type: Date },
    expiresAt: { type: Date },
    actionUrl: { type: String, trim: true },
    metadata: { type: Map, of: String },
    isActive: { type: Boolean, default: true },
    channel: { type: String, enum: ['email', 'push', 'sms', 'inApp'], default: 'inApp' },
    retryCount: { type: Number, default: 0, min: 0, max: 5 },
    deliveredAt: { type: Date },
    deliveryStatus: { type: String, enum: ['pending', 'sent', 'delivered', 'failed', 'cancelled'], default: 'pending' },
    errorMessage: { type: String, trim: true },
    templateId: { type: String, trim: true },
    variables: { type: Map, of: String },
    attachments: { type: Array, default: [] },
    reminder: {
        enabled: { type: Boolean, default: false },
        interval: { type: Number, min: 1, max: 30 },
        unit: { type: String, enum: ['minutes', 'hours', 'days'], default: 'hours' }
    },
    category: { type: String, enum: ['system', 'medical', 'feeding', 'appointment', 'general'], default: 'general' }
}, { timestamps: true })

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 })
notificationSchema.index({ scheduledFor: 1 })

notificationSchema.methods.markAsRead = function() {
    this.read = true
    this.readAt = new Date()
    return this.save()
}

notificationSchema.methods.toJSON = function() {
    const notification = this.toObject()
    delete notification.__v
    return notification
}

module.exports = mongoose.model('Notification', notificationSchema)
