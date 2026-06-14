const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    type: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text'
    },
    read: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    delivered: {
        type: Boolean,
        default: false
    },
    deliveredAt: {
        type: Date
    },
    deletedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    importance: {
        type: String,
        enum: ['low', 'normal', 'high'],
        default: 'normal'
    }
}, {
    timestamps: true
})

messageSchema.pre('save', function(next) {
    if (this.read && !this.readAt) {
        this.readAt = new Date()
    }
    if (this.delivered && !this.deliveredAt) {
        this.deliveredAt = new Date()
    }
    next()
})

messageSchema.methods.toJSON = function() {
    const message = this.toObject()
    delete message.__v
    return message
}

module.exports = mongoose.model('Message', messageSchema)