const mongoose = require('mongoose')

const locationSchema = new mongoose.Schema({
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true,
        unique: true
    },
    latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
    },
    longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
    },
    address: {
        street: { type: String, trim: true },
        city: { type: String, trim: true },
        state: { type: String, trim: true, uppercase: true, maxlength: 2 },
        zipCode: { type: String, trim: true },
        country: { type: String, trim: true, default: 'Brasil' }
    },
    isCurrent: {
        type: Boolean,
        default: true
    },
    lastUpdate: {
        type: Date,
        default: Date.now
    },
    history: [{
        latitude: Number,
        longitude: Number,
        timestamp: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
})

locationSchema.pre('save', function(next) {
    if (this.isModified('latitude') || this.isModified('longitude')) {
        this.history.push({
            latitude: this.latitude,
            longitude: this.longitude,
            timestamp: new Date()
        })
        this.lastUpdate = new Date()
    }
    next()
})

locationSchema.methods.toJSON = function() {
    const location = this.toObject()
    delete location.__v
    delete location.history
    return location
}

module.exports = mongoose.model('Location', locationSchema)