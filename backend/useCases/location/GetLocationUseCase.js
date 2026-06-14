const Location = require('../../models/Location')
const LocationValidation = require('../../helpers/locationValidation')

class GetLocationUseCase {
    async execute(id) {
        if (!LocationValidation.validateId(id)) {
            throw new Error('ID inválido')
        }
        
        const location = await Location.findById(id).populate('petId', 'name')
        
        if (!location) {
            throw new Error('Localização não encontrada')
        }
        
        return location.toJSON()
    }
    
    async findByPetId(petId) {
        if (!LocationValidation.validateId(petId)) {
            throw new Error('petId inválido')
        }
        
        const location = await Location.findOne({ petId }).populate('petId', 'name')
        
        if (!location) {
            throw new Error('Localização não encontrada para este pet')
        }
        
        return location.toJSON()
    }
    
    async findAll(page = 1, limit = 10, filters = {}) {
        const query = {}
        
        if (filters.isCurrent !== undefined) {
            query.isCurrent = filters.isCurrent === 'true'
        }
        
        if (filters.city) {
            query['address.city'] = new RegExp(filters.city, 'i')
        }
        
        const pageNum = parseInt(page, 10)
        const limitNum = parseInt(limit, 10)
        
        const locations = await Location.find(query)
            .limit(limitNum)
            .skip((pageNum - 1) * limitNum)
            .sort({ createdAt: -1 })
            .populate('petId', 'name')
        
        const total = await Location.countDocuments(query)
        
        return {
            locations: locations.map(l => l.toJSON()),
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum)
        }
    }
    
    async getNearby(lat, lng, maxDistance = 5000) {
        const locations = await Location.find({
            isCurrent: true,
            latitude: { $gte: lat - 0.05, $lte: lat + 0.05 },
            longitude: { $gte: lng - 0.05, $lte: lng + 0.05 }
        }).populate('petId', 'name')
        
        return locations.map(l => l.toJSON())
    }
}

module.exports = GetLocationUseCase