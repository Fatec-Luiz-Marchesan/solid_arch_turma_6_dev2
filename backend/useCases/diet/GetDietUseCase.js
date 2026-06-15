const Diet = require('../../models/Diet')
const DietValidation = require('../../helpers/dietValidation')

class GetDietUseCase {
    async execute(id) {
        if (!DietValidation.validateId(id)) {
            throw new Error('ID inválido')
        }
        
        const diet = await Diet.findById(id)
            .populate('petId', 'name species age')
            .populate('createdBy', 'name email')
            .exec()
        
        if (!diet) {
            throw new Error('Dieta não encontrada')
        }
        
        const stats = this.calculateStats(diet)
        
        return { ...diet.toJSON(), stats }
    }
    
    async findByPetId(petId) {
        if (!DietValidation.validateId(petId)) {
            throw new Error('petId inválido')
        }
        
        const diets = await Diet.find({ petId, isActive: true })
            .populate('petId', 'name')
            .sort({ createdAt: -1 })
            .exec()
        
        return diets.map(d => ({
            ...d.toJSON(),
            stats: this.calculateStats(d)
        }))
    }
    
    async findAll(page = 1, limit = 10, filters = {}) {
        const query = {}
        
        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive === 'true'
        }
        
        if (filters.petId) {
            query.petId = filters.petId
        }
        
        if (filters.minCalories) {
            query.totalDailyCalories = { $gte: parseInt(filters.minCalories) }
        }
        
        if (filters.maxCalories) {
            query.totalDailyCalories = { ...query.totalDailyCalories, $lte: parseInt(filters.maxCalories) }
        }
        
        const pageNum = parseInt(page, 10)
        const limitNum = parseInt(limit, 10)
        
        const diets = await Diet.find(query)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .sort({ createdAt: -1 })
            .populate('petId', 'name species')
            .exec()
        
        const total = await Diet.countDocuments(query)
        
        return {
            diets: diets.map(d => ({
                ...d.toJSON(),
                stats: this.calculateStats(d)
            })),
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        }
    }
    
    calculateStats(diet) {
        const meals = diet.meals || []
        const totalCalories = meals.reduce((sum, meal) => sum + (meal.calories || 0), 0)
        const totalProteins = meals.reduce((sum, meal) => sum + (meal.proteins || 0), 0)
        const totalCarbs = meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0)
        const totalFats = meals.reduce((sum, meal) => sum + (meal.fats || 0), 0)
        
        return {
            totalCalories,
            totalProteins,
            totalCarbs,
            totalFats,
            mealsCount: meals.length,
            averageCaloriesPerMeal: meals.length > 0 ? Math.round(totalCalories / meals.length) : 0
        }
    }
}

module.exports = GetDietUseCase
