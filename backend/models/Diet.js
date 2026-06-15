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
    },
    mealFrequency: {
        type: String,
        enum: ['poucas', 'normal', 'muitas'],
        default: 'normal'
    },
    waterIntake: {
        recommended: {
            type: Number,
            min: 0,
            max: 5000,
            default: 0
        },
        unit: {
            type: String,
            enum: ['ml', 'l'],
            default: 'ml'
        }
    },
    nutritionalGoals: {
        weightGain: { type: Boolean, default: false },
        weightLoss: { type: Boolean, default: false },
        maintenance: { type: Boolean, default: true },
        specificHealth: { type: String, trim: true }
    },
    weeklyMenu: [{
        day: {
            type: String,
            enum: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
        },
        meals: [{
            name: String,
            time: String,
            calories: Number
        }]
    }],
    dietaryRestrictions: [{
        type: String,
        enum: ['sem gluten', 'sem lactose', 'vegetariano', 'vegano', 'hipoalergenico']
    }],
    supplements: [{
        name: { type: String, trim: true },
        dosage: { type: String },
        frequency: { type: String }
    }]
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
