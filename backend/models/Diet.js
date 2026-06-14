const mongoose = require('mongoose')

const mealSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    time: { type: String, required: true },
    calories: { type: Number, default: 0, min: 0 },
    proteins: { type: Number, default: 0, min: 0 },
    carbs: { type: Number, default: 0, min: 0 },
    fats: { type: Number, default: 0, min: 0 },
    description: { type: String, trim: true }
})

const dietSchema = new mongoose.Schema({
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        required: true
    },
    meals: [mealSchema],
    totalDailyCalories: {
        type: Number,
        default: 0,
        min: 0
    },
    restrictions: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    observations: {
        type: String,
        trim: true,
        maxlength: 500
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

dietSchema.pre('save', function(next) {
    if (this.meals && this.meals.length > 0) {
        this.totalDailyCalories = this.meals.reduce((total, meal) => {
            return total + (meal.calories || 0)
        }, 0)
    }
    next()
})

dietSchema.methods.toJSON = function() {
    const diet = this.toObject()
    delete diet.__v
    return diet
}

module.exports = mongoose.model('Diet', dietSchema)