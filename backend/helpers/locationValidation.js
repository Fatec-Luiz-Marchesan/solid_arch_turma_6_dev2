class LocationValidation {
    static validateCreate(data) {
        const errors = []
        
        if (!data.petId) {
            errors.push('petId é obrigatório')
        } else if (!/^[0-9a-fA-F]{24}$/.test(data.petId)) {
            errors.push('petId inválido')
        }
        
        if (data.latitude === undefined) {
            errors.push('latitude é obrigatória')
        } else if (data.latitude < -90 || data.latitude > 90) {
            errors.push('latitude deve estar entre -90 e 90')
        }
        
        if (data.longitude === undefined) {
            errors.push('longitude é obrigatória')
        } else if (data.longitude < -180 || data.longitude > 180) {
            errors.push('longitude deve estar entre -180 e 180')
        }
        
        if (data.address && data.address.state && data.address.state.length !== 2) {
            errors.push('state deve ter 2 caracteres')
        }
        
        return { isValid: errors.length === 0, errors }
    }
    
    static validateUpdate(data) {
        const errors = []
        
        if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
            errors.push('latitude deve estar entre -90 e 90')
        }
        
        if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
            errors.push('longitude deve estar entre -180 e 180')
        }
        
        if (data.address && data.address.state && data.address.state.length !== 2) {
            errors.push('state deve ter 2 caracteres')
        }
        
        return { isValid: errors.length === 0, errors }
    }
    
    static validateId(id) {
        return id && /^[0-9a-fA-F]{24}$/.test(id)
    }
}

module.exports = LocationValidation