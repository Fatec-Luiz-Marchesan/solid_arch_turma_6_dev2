const Diet = require('../../models/Diet')
const DietValidation = require('../../helpers/dietValidation')

class GetDietUseCase {
    async execute(id) {
        if (!DietValidation.validateId(id)) {
            throw new Error('ID inválido')
        }
        
        const diet = await Diet.findById(id)
            .populate('petId', 'name')
            .populate('createdBy', 'name email')
            .exec()
        
        if (!diet) {
            throw new Error('Dieta não encontrada')
        }
        
        return diet.toJSON()
    }
    
    async findByPetId(petId) {
        if (!DietValidation.validateId(petId)) {
            throw new Error('petId inválido')
        }
        
        const diets = await Diet.find({ petId, isActive: true })
            .populate('petId', 'name')
            .sort({ createdAt: -1 })
            .exec()
        
        return diets.map(d => d.toJSON())
    }
    
    async findAll(page = 1, limit = 10, filters = {}) {
        const query = {}
        
        if (filters.isActive !== undefined) {
            query.isActive = filters.isActive === 'true'
        }
        
        const pageNum = parseInt(page, 10)
        const limitNum = parseInt(limit, 10)
        
        const diets = await Diet.find(query)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .sort({ createdAt: -1 })
            .populate('petId', 'name')
            .exec()
        
        const total = await Diet.countDocuments(query)
        
        return {
            diets: diets.map(d => d.toJSON()),
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        }
    }
}

module.exports = GetDietUseCase