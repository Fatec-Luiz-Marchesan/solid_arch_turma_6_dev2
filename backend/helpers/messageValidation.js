class MessageValidation {
    static validateCreate(data) {
        const errors = []
        
        if (!data.senderId) {
            errors.push('senderId é obrigatório')
        } else if (!/^[0-9a-fA-F]{24}$/.test(data.senderId)) {
            errors.push('senderId inválido')
        }
        
        if (!data.receiverId) {
            errors.push('receiverId é obrigatório')
        } else if (!/^[0-9a-fA-F]{24}$/.test(data.receiverId)) {
            errors.push('receiverId inválido')
        }
        
        if (!data.content) {
            errors.push('conteúdo é obrigatório')
        } else if (data.content.length < 1) {
            errors.push('conteúdo deve ter no mínimo 1 caractere')
        } else if (data.content.length > 1000) {
            errors.push('conteúdo deve ter no máximo 1000 caracteres')
        }
        
        if (data.type && !['text', 'image', 'file'].includes(data.type)) {
            errors.push('type deve ser text, image ou file')
        }
        
        if (data.importance && !['low', 'normal', 'high'].includes(data.importance)) {
            errors.push('importance deve ser low, normal ou high')
        }
        
        if (data.replyTo && !/^[0-9a-fA-F]{24}$/.test(data.replyTo)) {
            errors.push('replyTo inválido')
        }
        
        return { isValid: errors.length === 0, errors }
    }
    
    static validateUpdate(data) {
        const errors = []
        
        if (data.content && data.content.length > 1000) {
            errors.push('conteúdo deve ter no máximo 1000 caracteres')
        }
        
        if (data.type && !['text', 'image', 'file'].includes(data.type)) {
            errors.push('type deve ser text, image ou file')
        }
        
        if (data.importance && !['low', 'normal', 'high'].includes(data.importance)) {
            errors.push('importance deve ser low, normal ou high')
        }
        
        if (data.read !== undefined && typeof data.read !== 'boolean') {
            errors.push('read deve ser booleano')
        }
        
        if (data.delivered !== undefined && typeof data.delivered !== 'boolean') {
            errors.push('delivered deve ser booleano')
        }
        
        return { isValid: errors.length === 0, errors }
    }
    
    static validateId(id) {
        return id && /^[0-9a-fA-F]{24}$/.test(id)
    }
}

module.exports = MessageValidation