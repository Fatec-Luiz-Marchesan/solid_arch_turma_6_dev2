const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },
    avatar: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true, uppercase: true, maxlength: 2 },
        zipCode: { type: String, trim: true },
        country: { type: String, trim: true, default: 'Brasil' }
    },
    socialLinks: {
        instagram: { type: String, trim: true },
        facebook: { type: String, trim: true },
        twitter: { type: String, trim: true }
    },
    preferences: {
        notifications: { type: Boolean, default: true },
        theme: { type: String, enum: ['light', 'dark'], default: 'light' }
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

profileSchema.methods.toJSON = function() {
    const profile = this.toObject()
    delete profile.__v
    return profile
}

module.exports = mongoose.model('Profile', profileSchema)